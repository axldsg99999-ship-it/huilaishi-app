#!/usr/bin/env bash
set -euo pipefail

apk_path="${1:?APK path is required}"
output_dir="${2:-android-smoke}"
expected_mode="${3:-app}"
package_name="${4:-com.huilaishi.app}"
launcher_class="${5:-.LauncherActivity}"
activity_name="${package_name}/${launcher_class}"
package_regex="${package_name//./\\.}"
course_process="${package_name}:course"
force_renderer_crash_extra="com.huilaishi.app.extra.FORCE_RENDERER_CRASH"
force_course_process_death_extra="com.huilaishi.app.extra.FORCE_COURSE_PROCESS_DEATH"
force_stale_task_migration_extra="com.huilaishi.app.extra.FORCE_STALE_TASK_MIGRATION"

pid_exact() {
  local wanted="$1"
  { adb shell ps -A 2>/dev/null || adb shell ps 2>/dev/null; } \
    | tr -d '\r' \
    | awk -v process_name="${wanted}" '$NF == process_name { print $2; exit }'
}

activity_stack_recovered() {
  local activities_file="$1"
  [[ -s "${activities_file}" ]] \
    && grep -E -q \
      "(topResumedActivity=|mResumedActivity:|ResumedActivity:).*${package_regex}/.*LauncherActivity" \
      "${activities_file}" \
    && ! grep -E -q \
      "${package_regex}/.*(Main|Course)Activity" \
      "${activities_file}"
}

tap_ui_node() {
  local marker="$1"
  local local_xml="$2"
  local remote_xml="/sdcard/huilaishi-tap-target.xml"
  local coordinates=""
  for _ in 1 2 3 4 5; do
    timeout 15s adb shell uiautomator dump --compressed "${remote_xml}" >/dev/null 2>&1 || true
    timeout 15s adb pull "${remote_xml}" "${local_xml}" >/dev/null 2>&1 || true
    if [[ -s "${local_xml}" ]]; then
      coordinates="$(python3 - "${local_xml}" "${marker}" 2>/dev/null <<'PY' || true
import re
import sys
import xml.etree.ElementTree as ET

path, marker = sys.argv[1:]
root = ET.parse(path).getroot()
for node in root.iter("node"):
    if node.attrib.get("content-desc") != marker and node.attrib.get("text") != marker:
        continue
    match = re.fullmatch(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]", node.attrib.get("bounds", ""))
    if match:
        left, top, right, bottom = map(int, match.groups())
        print(f"{(left + right) // 2} {(top + bottom) // 2}")
        break
PY
)"
    fi
    if [[ "${coordinates}" =~ ^[0-9]+\ [0-9]+$ ]]; then
      read -r tap_x tap_y <<< "${coordinates}"
      timeout 10s adb shell input tap "${tap_x}" "${tap_y}"
      return 0
    fi
    sleep 1
  done
  return 1
}

if [[ "${expected_mode}" != "app" && "${expected_mode}" != "compatibility" ]]; then
  echo "Expected mode must be 'app' or 'compatibility'." >&2
  exit 2
fi

mkdir -p "${output_dir}"
adb wait-for-device
# Headless diagnostics must inspect the recovered Activity instead of a
# system crash dialog that real users can dismiss.
adb shell settings put global hide_error_dialogs 1 >/dev/null 2>&1 || true
adb shell getprop > "${output_dir}/device-properties.txt"
adb shell dumpsys webviewupdate > "${output_dir}/webview-provider.txt" 2>&1 || true
adb install -r "${apk_path}" | tee "${output_dir}/install.txt"
adb shell dumpsys package "${package_name}" > "${output_dir}/package.txt"
run_renderer_crash_test=false
if [[ "${launcher_class}" == ".LauncherActivity" ]] \
    && grep -q 'DEBUGGABLE' "${output_dir}/package.txt"; then
  run_renderer_crash_test=true
fi
adb logcat -c

launch_failed=0
compatibility_ui_passes=0
for attempt in 1 2 3; do
  timeout 15s adb shell am force-stop "${package_name}" || launch_failed=1
  timeout 20s adb shell pm clear "${package_name}" > /dev/null || launch_failed=1
  timeout 30s adb shell am start -W -n "${activity_name}" \
    | tee "${output_dir}/launch-${attempt}.txt" || launch_failed=1

  sleep 2
  pid_exact "${package_name}" | tee "${output_dir}/pid-launcher-${attempt}.txt" || true
  timeout 20s adb exec-out screencap -p \
    > "${output_dir}/screen-native-${attempt}.png" || true
  if ! grep -Eq '[0-9]+' "${output_dir}/pid-launcher-${attempt}.txt"; then
    echo "Native launcher process disappeared on attempt ${attempt}." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
    continue
  fi
  if ! tap_ui_node \
      "进入课程，三星稳定模式" \
      "${output_dir}/native-window-${attempt}.xml"; then
    echo "Native course entry was not reachable on attempt ${attempt}." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
    continue
  fi

  sleep 15
  pid_exact "${package_name}" | tee "${output_dir}/pid-${attempt}.txt" || true
  pid_exact "${course_process}" | tee "${output_dir}/pid-course-${attempt}.txt" || true
  timeout 20s adb shell dumpsys activity activities \
    > "${output_dir}/activities-${attempt}.txt" 2>&1 || true
  timeout 20s adb shell dumpsys window windows \
    > "${output_dir}/windows-${attempt}.txt" 2>&1 || true
  timeout 20s adb exec-out screencap -p \
    > "${output_dir}/screen-before-${attempt}.png" || true

  if ! grep -Eq '[0-9]+' "${output_dir}/pid-${attempt}.txt"; then
    echo "Native launcher process disappeared after course entry ${attempt}." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
    continue
  fi
  if ! grep -Eq '[0-9]+' "${output_dir}/pid-course-${attempt}.txt"; then
    echo "Isolated course process disappeared after launch attempt ${attempt}." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
    continue
  fi

  timeout 20s adb shell dumpsys meminfo "${package_name}" \
    > "${output_dir}/meminfo-${attempt}.txt" 2>&1 || true

  if [[ "${expected_mode}" == "compatibility" ]]; then
    echo "Compatibility page expected; app interaction intentionally skipped." \
      | tee "${output_dir}/interaction-${attempt}.txt"
    timeout 20s adb shell uiautomator dump --compressed "/sdcard/window-${attempt}.xml" \
      >> "${output_dir}/interaction-${attempt}.txt" 2>&1 || true
    timeout 20s adb pull "/sdcard/window-${attempt}.xml" \
      "${output_dir}/window-${attempt}.xml" \
      >> "${output_dir}/interaction-${attempt}.txt" 2>&1 || true
    if [[ -s "${output_dir}/window-${attempt}.xml" ]] \
        && grep -Eq '请先更新系统浏览器组件|โปรดอัปเดต WebView ของระบบ' \
          "${output_dir}/window-${attempt}.xml"; then
      compatibility_ui_passes=$((compatibility_ui_passes + 1))
      echo "PASS: compatibility update page is visible." \
        | tee -a "${output_dir}/interaction-${attempt}.txt"
    else
      echo "Compatibility page text was not exposed to UIAutomator; native page events will decide the verdict." \
        | tee -a "${output_dir}/interaction-${attempt}.txt"
    fi
    continue
  fi

  screen_size="$(adb shell wm size | tr -d '\r' | sed -n 's/.*size: //p' | tail -n 1)"
  screen_width="${screen_size%x*}"
  screen_height="${screen_size#*x}"
  tap_x="$((screen_width / 2))"
  tap_y="$((screen_height * 42 / 100))"
  printf 'Tap first direction card at %s,%s on %s\n' \
    "${tap_x}" "${tap_y}" "${screen_size}" \
    | tee "${output_dir}/interaction-${attempt}.txt"
  timeout 10s adb shell input tap "${tap_x}" "${tap_y}" || launch_failed=1
  sleep 5
  timeout 20s adb exec-out screencap -p \
    > "${output_dir}/screen-after-${attempt}.png" || true
  timeout 20s adb shell dumpsys meminfo "${package_name}" \
    > "${output_dir}/meminfo-after-${attempt}.txt" 2>&1 || true
  timeout 20s adb shell uiautomator dump --compressed "/sdcard/window-${attempt}.xml" \
    >> "${output_dir}/interaction-${attempt}.txt" 2>&1 || true
  timeout 20s adb pull "/sdcard/window-${attempt}.xml" \
    "${output_dir}/window-${attempt}.xml" \
    >> "${output_dir}/interaction-${attempt}.txt" 2>&1 || true

  if ! pid_exact "${package_name}" | grep -Eq '[0-9]+'; then
    echo "Native launcher process disappeared after the first interaction." \
      | tee -a "${output_dir}/interaction-${attempt}.txt" "${output_dir}/verdict.txt"
    launch_failed=1
  elif ! pid_exact "${course_process}" | grep -Eq '[0-9]+'; then
    echo "Isolated course process disappeared after the first interaction." \
      | tee -a "${output_dir}/interaction-${attempt}.txt" "${output_dir}/verdict.txt"
    launch_failed=1
  elif python3 scripts/compare-android-screens.py \
    "${output_dir}/screen-before-${attempt}.png" \
    "${output_dir}/screen-after-${attempt}.png" \
    | tee -a "${output_dir}/interaction-${attempt}.txt"; then
    echo "PASS: first direction card opened onboarding." \
      | tee -a "${output_dir}/interaction-${attempt}.txt"
  else
    echo "First direction card did not expose the expected onboarding content." \
      | tee -a "${output_dir}/interaction-${attempt}.txt" "${output_dir}/verdict.txt"
    launch_failed=1
  fi
done

if [[ "${expected_mode}" == "app" && "${run_renderer_crash_test}" == "true" ]]; then
  recovery_dir="${output_dir}/renderer-recovery"
  mkdir -p "${recovery_dir}"
  timeout 15s adb shell am force-stop "${package_name}" || launch_failed=1
  timeout 20s adb shell pm clear "${package_name}" > /dev/null || launch_failed=1
  timeout 30s adb shell am start -W -n "${activity_name}" \
    --ez "${force_renderer_crash_extra}" true \
    | tee "${recovery_dir}/launch.txt" || launch_failed=1
  sleep 2
  pid_exact "${package_name}" | tee "${recovery_dir}/pid-before.txt" || true
  if ! tap_ui_node \
      "进入课程，三星稳定模式" \
      "${recovery_dir}/native-window.xml"; then
    echo "Renderer test could not enter the isolated course." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  fi
  sleep 15
  pid_exact "${package_name}" | tee "${recovery_dir}/pid-after.txt" || true
  timeout 20s adb shell uiautomator dump --compressed "/sdcard/renderer-recovery.xml" \
    > "${recovery_dir}/uiautomator.txt" 2>&1 || true
  timeout 20s adb pull "/sdcard/renderer-recovery.xml" \
    "${recovery_dir}/window.xml" >> "${recovery_dir}/uiautomator.txt" 2>&1 || true
  timeout 20s adb exec-out screencap -p > "${recovery_dir}/screen.png" || true

  if [[ ! -s "${recovery_dir}/pid-before.txt" ]] \
      || ! cmp -s "${recovery_dir}/pid-before.txt" "${recovery_dir}/pid-after.txt"; then
    echo "Native launcher PID changed during forced renderer recovery." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  elif [[ ! -s "${recovery_dir}/window.xml" ]] \
      || ! grep -q 'text="课程已安全退出"' "${recovery_dir}/window.xml"; then
    echo "Forced renderer exit did not return to the native recovery root." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  else
    echo "PASS: forced WebView renderer exit preserved the native launcher PID and exposed recovery." \
      | tee -a "${output_dir}/verdict.txt"
  fi

  # Everything before the explicit whole-course crash must be free of app
  # process crashes. The renderer crash runs in Chromium's sandbox process.
  timeout 30s adb logcat -d -v threadtime > "${output_dir}/pre-process-crash-logcat.txt" || true
  if grep -E -q \
      "Process: ${package_regex}(:course)?,|ANR in ${package_regex}(:course)?( |$)|am_crash.*${package_regex}(:course)?( |,|$)|am_anr.*${package_regex}(:course)?( |,|$)" \
      "${output_dir}/pre-process-crash-logcat.txt"; then
    echo "Unexpected app-process crash or ANR occurred before the isolated process test." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  fi

  process_dir="${output_dir}/course-process-recovery"
  mkdir -p "${process_dir}"
  timeout 15s adb shell am force-stop "${package_name}" || launch_failed=1
  timeout 20s adb shell pm clear "${package_name}" > /dev/null || launch_failed=1
  timeout 30s adb shell am start -W -n "${activity_name}" \
    --ez "${force_course_process_death_extra}" true \
    | tee "${process_dir}/launch.txt" || launch_failed=1
  sleep 2
  pid_exact "${package_name}" | tee "${process_dir}/pid-before.txt" || true
  if ! tap_ui_node \
      "进入课程，三星稳定模式" \
      "${process_dir}/native-window.xml"; then
    echo "Process-death test could not enter the isolated course." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  fi
  stable_recovery_checks=0
  for _ in $(seq 1 30); do
    sleep 1
    pid_exact "${package_name}" | tee "${process_dir}/pid-after.txt" >/dev/null || true
    pid_exact "${course_process}" | tee "${process_dir}/course-pid-after.txt" >/dev/null || true
    timeout 15s adb shell uiautomator dump --compressed "/sdcard/course-process-recovery.xml" \
      > "${process_dir}/uiautomator.txt" 2>&1 || true
    timeout 15s adb pull "/sdcard/course-process-recovery.xml" \
      "${process_dir}/window.xml" >> "${process_dir}/uiautomator.txt" 2>&1 || true
    timeout 20s adb shell dumpsys activity activities \
      > "${process_dir}/activities.txt" 2>&1 || true
    if [[ -s "${process_dir}/pid-before.txt" ]] \
        && cmp -s "${process_dir}/pid-before.txt" "${process_dir}/pid-after.txt" \
        && [[ -s "${process_dir}/window.xml" ]] \
        && grep -q 'text="课程已安全退出"' "${process_dir}/window.xml" \
        && activity_stack_recovered "${process_dir}/activities.txt"; then
      stable_recovery_checks=$((stable_recovery_checks + 1))
    else
      stable_recovery_checks=0
    fi
    if [[ "${stable_recovery_checks}" -ge 3 ]]; then
      break
    fi
  done
  timeout 20s adb shell dumpsys activity processes \
    > "${process_dir}/processes.txt" 2>&1 || true
  timeout 20s adb exec-out screencap -p > "${process_dir}/screen.png" || true
  timeout 30s adb logcat -d -v threadtime \
    > "${process_dir}/logcat.txt" 2>&1 || true
  awk '
    /CI_FORCE_COURSE_PROCESS_DEATH/ { after_forced_death = 1; next }
    after_forced_death { print }
  ' "${process_dir}/logcat.txt" > "${process_dir}/logcat-after-force.txt"
  awk '
    /CI_FORCE_COURSE_PROCESS_DEATH/ { print $3; exit }
  ' "${process_dir}/logcat.txt" > "${process_dir}/course-pid-killed.txt"
  course_death_markers="$(grep -c 'CI_FORCE_COURSE_PROCESS_DEATH' \
    "${process_dir}/logcat.txt" || true)"

  if [[ ! -s "${process_dir}/pid-before.txt" ]] \
      || ! cmp -s "${process_dir}/pid-before.txt" "${process_dir}/pid-after.txt"; then
    echo "Native launcher PID changed when the isolated course process died." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  elif [[ ! -s "${process_dir}/course-pid-killed.txt" ]] \
      || cmp -s \
        "${process_dir}/course-pid-killed.txt" \
        "${process_dir}/course-pid-after.txt"; then
    echo "The original isolated course PID did not exit." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  elif [[ ! -s "${process_dir}/window.xml" ]] \
      || ! grep -q 'text="课程已安全退出"' "${process_dir}/window.xml"; then
    echo "Course process death did not expose the persistent native recovery root." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  elif ! activity_stack_recovered "${process_dir}/activities.txt"; then
    echo "Native recovery was not the only app Activity left in the task." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  elif [[ "${stable_recovery_checks}" -lt 3 ]]; then
    echo "Native recovery did not remain stable for three consecutive checks." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  elif [[ "${course_death_markers}" -ne 1 ]] \
      || ! grep -q 'COURSE_PROCESS_DIED' "${process_dir}/logcat-after-force.txt" \
      || ! grep -q 'LAUNCHER_RECOVERY' "${process_dir}/logcat-after-force.txt"; then
    echo "Course-process death and launcher recovery markers were incomplete or repeated." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  elif grep -E -q \
      "HuilaishiCourse: event=(START|PAGE_VISIBLE)" \
      "${process_dir}/logcat-after-force.txt"; then
    echo "The course Activity restarted or became visible after forced process death." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  else
    if [[ -s "${process_dir}/course-pid-after.txt" ]]; then
      echo "INFO: Android retained a replacement course process without a course Activity; PID absence is not required." \
        | tee -a "${output_dir}/verdict.txt"
    fi
    echo "PASS: the original course PID exited; the native launcher PID and recovery Activity remained stable." \
      | tee -a "${output_dir}/verdict.txt"
  fi

  migration_dir="${output_dir}/stale-task-migration"
  mkdir -p "${migration_dir}"
  timeout 15s adb shell am force-stop "${package_name}" || launch_failed=1
  timeout 20s adb shell pm clear "${package_name}" > /dev/null || launch_failed=1
  timeout 30s adb shell am start -W -n "${activity_name}" \
    --ez "${force_stale_task_migration_extra}" true \
    | tee "${migration_dir}/launch.txt" || launch_failed=1
  stable_migration_checks=0
  for _ in $(seq 1 20); do
    sleep 1
    timeout 15s adb shell uiautomator dump --compressed "/sdcard/stale-task-migration.xml" \
      > "${migration_dir}/uiautomator.txt" 2>&1 || true
    timeout 15s adb pull "/sdcard/stale-task-migration.xml" \
      "${migration_dir}/window.xml" >> "${migration_dir}/uiautomator.txt" 2>&1 || true
    timeout 20s adb shell dumpsys activity activities \
      > "${migration_dir}/activities.txt" 2>&1 || true
    timeout 30s adb logcat -d -v threadtime \
      > "${migration_dir}/logcat.txt" 2>&1 || true
    if [[ -s "${migration_dir}/window.xml" ]] \
        && grep -q 'text="课程已安全退出"' "${migration_dir}/window.xml" \
        && activity_stack_recovered "${migration_dir}/activities.txt" \
        && grep -q 'CI_FORCE_STALE_TASK_MIGRATION' "${migration_dir}/logcat.txt" \
        && grep -q 'HuilaishiMigration.*STALE_UPGRADE_TASK_REDIRECT' "${migration_dir}/logcat.txt"; then
      stable_migration_checks=$((stable_migration_checks + 1))
    else
      stable_migration_checks=0
    fi
    if [[ "${stable_migration_checks}" -ge 2 ]]; then break; fi
  done
  timeout 20s adb exec-out screencap -p > "${migration_dir}/screen.png" || true
  pid_exact "${course_process}" > "${migration_dir}/course-pid.txt" || true
  pid_exact "${package_name}" > "${migration_dir}/launcher-pid.txt" || true
  awk '/HuilaishiNative: event=CI_FORCE_STALE_TASK_MIGRATION/ { print $3; exit }' \
    "${migration_dir}/logcat.txt" > "${migration_dir}/migration-start-pid.txt"
  awk '/HuilaishiMigration: event=STALE_UPGRADE_TASK_REDIRECT/ { print $3; exit }' \
    "${migration_dir}/logcat.txt" > "${migration_dir}/historical-main-pid.txt"
  if [[ "${stable_migration_checks}" -lt 2 ]]; then
    echo "Historical MainActivity did not migrate the synthetic stale task to native recovery." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  elif [[ -s "${migration_dir}/course-pid.txt" ]]; then
    echo "Course process started during the WebView-free stale-task migration." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  elif [[ ! -s "${migration_dir}/launcher-pid.txt" ]] \
      || ! cmp -s "${migration_dir}/migration-start-pid.txt" "${migration_dir}/historical-main-pid.txt" \
      || ! cmp -s "${migration_dir}/migration-start-pid.txt" "${migration_dir}/launcher-pid.txt"; then
    echo "Native launcher PID changed during stale-task migration." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  else
    echo "PASS: historical MainActivity removed a Launcher+Main stale task and exposed native recovery." \
      | tee -a "${output_dir}/verdict.txt"
  fi
fi

if ! timeout 30s adb logcat -d -v threadtime > "${output_dir}/logcat.txt"; then
  echo "Timed out while collecting logcat." | tee -a "${output_dir}/verdict.txt"
  launch_failed=1
fi
grep -E -i \
  "AndroidRuntime|FATAL EXCEPTION|Process: ${package_regex}|OutOfMemoryError|Fatal signal|chromium|crashpad|WebView|renderer|lowmemorykiller|am_crash|am_anr|Handling local request|Capacitor/Console|HuilaishiNative|HuilaishiCourse|HuilaishiMigration" \
  "${output_dir}/logcat.txt" > "${output_dir}/logcat-crash-filtered.txt" || true
grep -E -i \
  'Capacitor/Console.*Uncaught (SyntaxError|ReferenceError|TypeError|RangeError)|Uncaught (SyntaxError|ReferenceError|TypeError|RangeError)' \
  "${output_dir}/logcat.txt" > "${output_dir}/logcat-js-errors.txt" || true

if [[ "${run_renderer_crash_test}" == "true" ]]; then
  package_failure_pattern="Process: ${package_regex},|ANR in ${package_regex}(:course)?( |$)|am_crash.*${package_regex}( |,|$)|am_anr.*${package_regex}(:course)?( |,|$)"
else
  package_failure_pattern="Process: ${package_regex}(:course)?,|ANR in ${package_regex}(:course)?( |$)|am_crash.*${package_regex}(:course)?( |,|$)|am_anr.*${package_regex}(:course)?( |,|$)"
fi
if grep -E -q "${package_failure_pattern}" "${output_dir}/logcat.txt"; then
  echo "Package-specific crash or ANR signature found." \
    | tee -a "${output_dir}/verdict.txt"
  launch_failed=1
fi

if [[ "${expected_mode}" == "app" && "${run_renderer_crash_test}" == "true" ]]; then
  if ! grep -q 'CI_FORCE_RENDERER_CRASH' "${output_dir}/logcat.txt" \
      || ! grep -q 'RENDERER_GONE' "${output_dir}/logcat.txt"; then
    echo "Forced renderer-crash test markers were not both recorded." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  fi
  if ! grep -q 'CI_FORCE_COURSE_PROCESS_DEATH' "${output_dir}/logcat.txt"; then
    echo "Forced course-process-death marker was not recorded." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  fi
  if ! grep -q 'CI_FORCE_STALE_TASK_MIGRATION' "${output_dir}/logcat.txt" \
      || ! grep -q 'HuilaishiMigration.*STALE_UPGRADE_TASK_REDIRECT' "${output_dir}/logcat.txt"; then
    echo "Forced stale-task migration markers were not both recorded." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  fi
fi

if [[ -s "${output_dir}/logcat-js-errors.txt" ]]; then
  echo "Uncaught JavaScript compatibility/runtime errors found." \
    | tee -a "${output_dir}/verdict.txt"
  launch_failed=1
fi

compatibility_loads="$(grep -E -c 'Handling local request: .*unsupported-webview\.html' "${output_dir}/logcat.txt" || true)"
compatibility_native_pages="$(grep -E -c 'Huilaishi(Course|Native): event=PAGE_VISIBLE .*detail=https://localhost/unsupported-webview\.html' "${output_dir}/logcat.txt" || true)"
if [[ "${expected_mode}" == "compatibility" ]]; then
  if [[ "${compatibility_native_pages}" -lt 3 && "${compatibility_ui_passes}" -lt 3 ]]; then
    echo "Expected compatibility page was not reached on every cold launch." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  else
    echo "PASS: unsupported WebView reached the script-free compatibility page on every cold launch (${compatibility_native_pages} native page events; ${compatibility_ui_passes} UIAutomator confirmations)." \
      | tee -a "${output_dir}/verdict.txt"
  fi
elif [[ "${compatibility_loads}" -ne 0 ]]; then
  echo "Supported WebView unexpectedly received the compatibility page." \
    | tee -a "${output_dir}/verdict.txt"
  launch_failed=1
fi

if [[ "${launch_failed}" -ne 0 ]]; then
  echo "FAIL: Android launch was not stable." | tee -a "${output_dir}/verdict.txt"
  exit 1
fi

echo "PASS: ${expected_mode} mode remained healthy after all three cold launches." \
  | tee -a "${output_dir}/verdict.txt"
