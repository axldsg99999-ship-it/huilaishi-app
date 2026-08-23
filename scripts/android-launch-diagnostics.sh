#!/usr/bin/env bash
set -euo pipefail

apk_path="${1:?APK path is required}"
output_dir="${2:-android-smoke}"
expected_mode="${3:-app}"
package_name="${4:-com.huilaishi.app}"
launcher_class="${5:-.MainActivity}"
activity_name="${package_name}/${launcher_class}"
package_regex="${package_name//./\\.}"
force_renderer_crash_extra="com.huilaishi.app.extra.FORCE_RENDERER_CRASH"

if [[ "${expected_mode}" != "app" && "${expected_mode}" != "compatibility" ]]; then
  echo "Expected mode must be 'app' or 'compatibility'." >&2
  exit 2
fi

mkdir -p "${output_dir}"
adb wait-for-device
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

  sleep 15
  timeout 10s adb shell pidof "${package_name}" \
    | tr -d '\r' | tee "${output_dir}/pid-${attempt}.txt" || true
  timeout 20s adb shell dumpsys activity activities \
    > "${output_dir}/activities-${attempt}.txt" 2>&1 || true
  timeout 20s adb shell dumpsys window windows \
    > "${output_dir}/windows-${attempt}.txt" 2>&1 || true
  timeout 20s adb exec-out screencap -p \
    > "${output_dir}/screen-before-${attempt}.png" || true

  if ! grep -Eq '[0-9]+' "${output_dir}/pid-${attempt}.txt"; then
    echo "Application process disappeared after launch attempt ${attempt}." \
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
      echo "Compatibility update page text was not visible." \
        | tee -a "${output_dir}/interaction-${attempt}.txt" "${output_dir}/verdict.txt"
      launch_failed=1
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

  if ! timeout 10s adb shell pidof "${package_name}" | tr -d '\r' \
    | grep -Eq '[0-9]+'; then
    echo "Application process disappeared after the first interaction." \
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
  sleep 15
  timeout 10s adb shell pidof "${package_name}" \
    | tr -d '\r' | tee "${recovery_dir}/pid.txt" || true
  timeout 20s adb shell uiautomator dump --compressed "/sdcard/renderer-recovery.xml" \
    > "${recovery_dir}/uiautomator.txt" 2>&1 || true
  timeout 20s adb pull "/sdcard/renderer-recovery.xml" \
    "${recovery_dir}/window.xml" >> "${recovery_dir}/uiautomator.txt" 2>&1 || true
  timeout 20s adb exec-out screencap -p > "${recovery_dir}/screen.png" || true

  if ! grep -Eq '[0-9]+' "${recovery_dir}/pid.txt"; then
    echo "Application process disappeared during forced renderer recovery." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  elif [[ ! -s "${recovery_dir}/window.xml" ]] \
      || ! grep -q '已进入安全模式' "${recovery_dir}/window.xml"; then
    echo "Forced renderer exit did not expose the native safe-mode screen." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  else
    echo "PASS: forced WebView renderer exit stayed in-process and exposed native safe mode." \
      | tee -a "${output_dir}/verdict.txt"
  fi
fi

if ! timeout 30s adb logcat -d -v threadtime > "${output_dir}/logcat.txt"; then
  echo "Timed out while collecting logcat." | tee -a "${output_dir}/verdict.txt"
  launch_failed=1
fi
grep -E -i \
  "AndroidRuntime|FATAL EXCEPTION|Process: ${package_regex}|OutOfMemoryError|Fatal signal|chromium|crashpad|WebView|renderer|lowmemorykiller|am_crash|am_anr|Handling local request|Capacitor/Console|HuilaishiNative" \
  "${output_dir}/logcat.txt" > "${output_dir}/logcat-crash-filtered.txt" || true
grep -E -i \
  'Capacitor/Console.*Uncaught (SyntaxError|ReferenceError|TypeError|RangeError)|Uncaught (SyntaxError|ReferenceError|TypeError|RangeError)' \
  "${output_dir}/logcat.txt" > "${output_dir}/logcat-js-errors.txt" || true

if grep -E -q \
  "Process: ${package_regex},|ANR in ${package_regex}( |$)|am_crash.*${package_regex}( |,|$)|am_anr.*${package_regex}( |,|$)" \
  "${output_dir}/logcat.txt"; then
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
fi

if [[ -s "${output_dir}/logcat-js-errors.txt" ]]; then
  echo "Uncaught JavaScript compatibility/runtime errors found." \
    | tee -a "${output_dir}/verdict.txt"
  launch_failed=1
fi

compatibility_loads="$(grep -E -c 'Handling local request: .*unsupported-webview\.html' "${output_dir}/logcat.txt" || true)"
if [[ "${expected_mode}" == "compatibility" ]]; then
  if [[ "${compatibility_ui_passes}" -lt 3 ]]; then
    echo "Expected compatibility page was not visible on every cold launch." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
  else
    echo "PASS: unsupported WebView showed the script-free compatibility page on every cold launch." \
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
