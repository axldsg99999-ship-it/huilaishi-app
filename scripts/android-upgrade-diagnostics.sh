#!/usr/bin/env bash
set -euo pipefail

old_apk="${1:?old signed APK is required}"
new_apk="${2:?new signed APK is required}"
output_dir="${3:-android-upgrade-smoke}"
old_mode="${4:-auto}"
package_name="com.huilaishi.app.samsung"
package_regex="com\.huilaishi\.app\.samsung"
course_process="${package_name}:course"

mkdir -p "${output_dir}"
if [[ "${old_mode}" != "auto" && "${old_mode}" != "manual" && "${old_mode}" != "course" ]]; then
  echo "Old launch mode must be 'auto', 'manual', or 'course'." >&2
  exit 2
fi
adb wait-for-device
adb shell settings put global hide_error_dialogs 1 >/dev/null 2>&1 || true
adb logcat -c
adb install "${old_apk}" | tee "${output_dir}/install-old.txt"
adb shell am force-stop "${package_name}"
adb shell pm clear "${package_name}" >/dev/null
# S1 launches directly into MainActivity while R2/R3 launch into their native
# LauncherActivity. Resolve the installed release's real MAIN/LAUNCHER entry.
adb shell monkey -p "${package_name}" -c android.intent.category.LAUNCHER 1 \
  > "${output_dir}/launch-old.txt" 2>&1

dump_ui() {
  local name="$1"
  timeout 15s adb shell uiautomator dump --compressed "/sdcard/${name}.xml" >/dev/null 2>&1 || true
  timeout 15s adb pull "/sdcard/${name}.xml" "${output_dir}/${name}.xml" >/dev/null 2>&1 || true
}

tap_marker() {
  local marker="$1"
  local name="$2"
  local coordinates=""
  for _ in 1 2 3 4 5; do
    dump_ui "${name}"
    coordinates="$(python3 - "${output_dir}/${name}.xml" "${marker}" 2>/dev/null <<'PY' || true
import re
import sys
import xml.etree.ElementTree as ET

root = ET.parse(sys.argv[1]).getroot()
marker = sys.argv[2]
for node in root.iter("node"):
    if marker not in (node.attrib.get("text"), node.attrib.get("content-desc")):
        continue
    match = re.fullmatch(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]", node.attrib.get("bounds", ""))
    if match:
        left, top, right, bottom = map(int, match.groups())
        print(f"{(left + right) // 2} {(top + bottom) // 2}")
        break
PY
)"
    printf '%s\n' "${coordinates}" > "${output_dir}/${name}-tap.txt"
    if [[ "${coordinates}" =~ ^[0-9]+\ [0-9]+$ ]]; then
      read -r tap_x tap_y <<< "${coordinates}"
      timeout 10s adb shell input tap "${tap_x}" "${tap_y}"
      return 0
    fi
    sleep 1
  done
  echo "Could not find UI marker: ${marker}" >&2
  return 1
}

activity_stack_recovered() {
  local activities_file="$1"
  [[ -s "${activities_file}" ]] \
    && grep -E -q \
      "(topResumedActivity=|mResumedActivity:|ResumedActivity:).*${package_regex}/\.LauncherActivity" \
      "${activities_file}" \
    && ! grep -E -q "${package_regex}/\.(Main|Course)Activity" "${activities_file}"
}

old_task_id=""
old_task_component=""
expected_old_component="MainActivity"
if [[ "${old_mode}" == "course" ]]; then
  expected_old_component="CourseActivity"
fi

component_is_top() {
  local activities_file="$1"
  local component="$2"
  [[ -s "${activities_file}" ]] \
    && grep -E -q \
      "(topResumedActivity=|mResumedActivity:|ResumedActivity:).*${package_regex}/\.${component}" \
      "${activities_file}"
}

component_in_task() {
  local activities_file="$1"
  local component="$2"
  local task_id="$3"
  [[ -s "${activities_file}" ]] \
    && grep -E -q "${package_regex}/\.${component} t${task_id}([^0-9]|$)" "${activities_file}"
}

course_process_running() {
  adb shell ps -A | tr -d '\r' \
    | awk -v wanted="${course_process}" '$NF == wanted { found=1 } END { exit !found }'
}

capture_old_task() {
  local candidate_task_id=""
  timeout 20s adb shell dumpsys activity activities > "${output_dir}/old-activities.txt"
  candidate_task_id="$(sed -n -E "s/.*${package_regex}\/\.${expected_old_component} t([0-9]+).*/\1/p" \
    "${output_dir}/old-activities.txt" | head -n 1)"
  if [[ -n "${candidate_task_id}" ]] \
      && component_is_top "${output_dir}/old-activities.txt" "${expected_old_component}"; then
    old_task_id="${candidate_task_id}"
    old_task_component="${expected_old_component}"
    return 0
  fi
  old_task_id=""
  old_task_component=""
  return 1
}

if [[ "${old_mode}" == "manual" || "${old_mode}" == "course" ]]; then
  for old_entry_attempt in 1 2 3; do
    dump_ui "old-state-${old_entry_attempt}"
    old_entry_marker="进入课程，三星稳定模式"
    if grep -q 'content-desc="稳定模式重试，推荐"' \
        "${output_dir}/old-state-${old_entry_attempt}.xml"; then
      old_entry_marker="稳定模式重试，推荐"
    fi
    if ! tap_marker "${old_entry_marker}" "old-entry-${old_entry_attempt}"; then
      continue
    fi
    for _ in $(seq 1 15); do
      if capture_old_task; then break 2; fi
      sleep 1
    done
  done
else
  for _ in $(seq 1 30); do
    if capture_old_task; then break; fi
    sleep 1
  done
fi
if [[ -z "${old_task_id}" ]]; then
  dump_ui "old-main-missing"
  adb logcat -d -v threadtime > "${output_dir}/old-main-missing-logcat.txt"
fi
test -n "${old_task_id}"
printf '%s\n' "${old_task_id}" > "${output_dir}/old-task-id.txt"
printf '%s\n' "${old_task_component}" > "${output_dir}/old-task-component.txt"

adb shell input keyevent KEYCODE_HOME
sleep 1
adb install -r "${new_apk}" | tee "${output_dir}/install-upgrade.txt"

timeout 20s adb shell dumpsys activity activities > "${output_dir}/post-upgrade-activities.txt"
adb logcat -c
upgrade_task_mode="aosp-package-replacement-removed-task"
if [[ "${old_task_component}" == "MainActivity" ]] \
    && component_in_task "${output_dir}/post-upgrade-activities.txt" "MainActivity" "${old_task_id}"; then
  upgrade_task_mode="retained-task-migrated"
  # Select the exact task saved by S1/R2 before any new icon launch can consume
  # it. Historical .MainActivity must remove the complete old task and redirect.
  timeout 15s adb shell am task focus "${old_task_id}" \
    > "${output_dir}/focus-old-task.txt" 2>&1
  recovery_stable_samples=0
  for _ in $(seq 1 20); do
    dump_ui "stale-task-recovery"
    adb logcat -d -v threadtime > "${output_dir}/logcat.txt"
    timeout 20s adb shell dumpsys activity activities > "${output_dir}/recovered-activities.txt"
    if grep -q 'STALE_UPGRADE_TASK_REDIRECT' "${output_dir}/logcat.txt" \
        && grep -q 'text="课程已安全退出"' "${output_dir}/stale-task-recovery.xml" \
        && activity_stack_recovered "${output_dir}/recovered-activities.txt"; then
      recovery_stable_samples=$((recovery_stable_samples + 1))
      if [[ "${recovery_stable_samples}" -ge 2 ]]; then break; fi
    else
      recovery_stable_samples=0
    fi
    sleep 1
  done
  test "${recovery_stable_samples}" -ge 2
  grep -q 'STALE_UPGRADE_TASK_REDIRECT' "${output_dir}/logcat.txt"
  grep -q 'text="课程已安全退出"' "${output_dir}/stale-task-recovery.xml"
  activity_stack_recovered "${output_dir}/recovered-activities.txt"
  ! adb shell ps -A | tr -d '\r' | awk -v wanted="${course_process}" '$NF == wanted { found=1 } END { exit !found }'
elif [[ "${old_task_component}" == "CourseActivity" ]] \
    && component_in_task "${output_dir}/post-upgrade-activities.txt" "CourseActivity" "${old_task_id}"; then
  upgrade_task_mode="retained-course-task-resumed"
  # R3 already uses the safe LauncherActivity + CourseActivity stack. Reopen
  # that exact recent task after replacement and require either a freshly
  # painted 12.4 course or an explicit return to the WebView-free launcher.
  timeout 15s adb shell am task focus "${old_task_id}" \
    > "${output_dir}/focus-old-task.txt" 2>&1
  retained_course_outcome=""
  retained_course_stable_samples=0
  for _ in $(seq 1 30); do
    dump_ui "retained-course-recovery"
    adb logcat -d -v threadtime > "${output_dir}/logcat.txt"
    timeout 20s adb shell dumpsys activity activities > "${output_dir}/recovered-activities.txt"
    sample_outcome=""
    if component_is_top "${output_dir}/recovered-activities.txt" "CourseActivity" \
        && component_in_task "${output_dir}/recovered-activities.txt" "CourseActivity" "${old_task_id}" \
        && component_in_task "${output_dir}/recovered-activities.txt" "LauncherActivity" "${old_task_id}" \
        && course_process_running \
        && grep -q 'HuilaishiCourse: event=PAGE_VISIBLE' "${output_dir}/logcat.txt"; then
      sample_outcome="course-visible"
    elif activity_stack_recovered "${output_dir}/recovered-activities.txt" \
        && grep -E -q 'text="(课程已安全退出|三星稳定入口)"' \
          "${output_dir}/retained-course-recovery.xml"; then
      sample_outcome="launcher-recovery"
    fi
    if [[ -n "${sample_outcome}" && "${sample_outcome}" == "${retained_course_outcome}" ]]; then
      retained_course_stable_samples=$((retained_course_stable_samples + 1))
    elif [[ -n "${sample_outcome}" ]]; then
      retained_course_outcome="${sample_outcome}"
      retained_course_stable_samples=1
    else
      retained_course_outcome=""
      retained_course_stable_samples=0
    fi
    if [[ "${retained_course_stable_samples}" -ge 2 ]]; then break; fi
    sleep 1
  done
  test "${retained_course_stable_samples}" -ge 2
  printf '%s\n' "${retained_course_outcome}" > "${output_dir}/retained-course-outcome.txt"
elif component_in_task "${output_dir}/post-upgrade-activities.txt" "LauncherActivity" "${old_task_id}"; then
  upgrade_task_mode="retained-safe-launcher-task"
  # Some package-replacement implementations discard the old course record but
  # retain its native root. Focusing that root must produce a stable safe page.
  timeout 15s adb shell am task focus "${old_task_id}" \
    > "${output_dir}/focus-old-task.txt" 2>&1
  launcher_stable_samples=0
  for _ in $(seq 1 20); do
    dump_ui "retained-launcher-recovery"
    timeout 20s adb shell dumpsys activity activities > "${output_dir}/recovered-activities.txt"
    if activity_stack_recovered "${output_dir}/recovered-activities.txt" \
        && grep -E -q 'text="(课程已安全退出|三星稳定入口)"' \
          "${output_dir}/retained-launcher-recovery.xml"; then
      launcher_stable_samples=$((launcher_stable_samples + 1))
      if [[ "${launcher_stable_samples}" -ge 2 ]]; then break; fi
    else
      launcher_stable_samples=0
    fi
    sleep 1
  done
  test "${launcher_stable_samples}" -ge 2
else
  # AOSP removes every Activity record during this adb package replacement.
  # That is already a safe outcome; the debug diagnostics separately force the
  # retained Launcher+Main shape through 12.4 R1's real migration component.
  printf 'AOSP removed task %s during package replacement before 12.4 R1 could resume it.\n' \
    "${old_task_id}" > "${output_dir}/focus-old-task.txt"
  ! grep -E -q "${package_regex}/\.(Main|Launcher|Course)Activity" \
    "${output_dir}/post-upgrade-activities.txt"
fi
printf '%s\n' "${upgrade_task_mode}" > "${output_dir}/upgrade-task-mode.txt"

# A later real home-screen launch must reopen 12.4 R1's safe native task rather than
# reviving the removed historical task.
adb shell input keyevent KEYCODE_HOME
adb shell monkey -p "${package_name}" -c android.intent.category.LAUNCHER 1 \
  > "${output_dir}/monkey-launch.txt" 2>&1
desktop_entry_marker=""
for _ in $(seq 1 20); do
  dump_ui "desktop-launch"
  timeout 20s adb shell dumpsys activity activities > "${output_dir}/desktop-launch-activities.txt"
  if grep -E -q "(topResumedActivity=|mResumedActivity:|ResumedActivity:).*${package_regex}/\.LauncherActivity" \
      "${output_dir}/desktop-launch-activities.txt"; then
    if grep -q 'text="三星稳定入口"' "${output_dir}/desktop-launch.xml"; then
      desktop_entry_marker="进入课程，三星稳定模式"
      break
    fi
    if grep -q 'text="课程已安全退出"' "${output_dir}/desktop-launch.xml" \
        && grep -q 'content-desc="稳定模式重试，推荐"' "${output_dir}/desktop-launch.xml"; then
      desktop_entry_marker="稳定模式重试，推荐"
      break
    fi
  fi
  sleep 1
done
test -n "${desktop_entry_marker}"

tap_marker "${desktop_entry_marker}" "desktop-enter"
for _ in $(seq 1 30); do
  timeout 20s adb shell dumpsys activity activities > "${output_dir}/course-activities.txt"
  if grep -E -q "(topResumedActivity=|mResumedActivity:|ResumedActivity:).*${package_regex}/\.CourseActivity" \
      "${output_dir}/course-activities.txt" \
      && adb shell ps -A | tr -d '\r' | awk -v wanted="${course_process}" '$NF == wanted { found=1 } END { exit !found }'; then
    break
  fi
  sleep 1
done
grep -E -q "(topResumedActivity=|mResumedActivity:|ResumedActivity:).*${package_regex}/\.CourseActivity" \
  "${output_dir}/course-activities.txt"
adb shell ps -A | tr -d '\r' \
  | awk -v wanted="${course_process}" '$NF == wanted { found=1 } END { exit !found }'

adb logcat -d -v threadtime > "${output_dir}/logcat.txt"
! grep -E -q "Process: ${package_regex}(:course)?,|ANR in ${package_regex}(:course)?( |$)|am_crash.*${package_regex}(:course)?( |,|$)|am_anr.*${package_regex}(:course)?( |,|$)" \
  "${output_dir}/logcat.txt"
adb exec-out screencap -p > "${output_dir}/final-screen.png"
printf 'PASS: %s signed upgrade (%s) opened CourseActivity in :course without a crash.\n' \
  "${old_mode}" "${upgrade_task_mode}" | tee "${output_dir}/verdict.txt"
