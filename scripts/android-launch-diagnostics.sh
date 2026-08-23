#!/usr/bin/env bash
set -euo pipefail

apk_path="${1:?APK path is required}"
output_dir="${2:-android-smoke}"
package_name="com.huilaishi.app"
activity_name="${package_name}/.MainActivity"

mkdir -p "${output_dir}"
adb wait-for-device
adb shell getprop > "${output_dir}/device-properties.txt"
adb shell dumpsys webviewupdate > "${output_dir}/webview-provider.txt" 2>&1 || true
adb install -r "${apk_path}" | tee "${output_dir}/install.txt"
adb shell dumpsys package "${package_name}" > "${output_dir}/package.txt"
adb logcat -c

launch_failed=0
for attempt in 1 2 3; do
  adb shell am force-stop "${package_name}"
  adb shell pm clear "${package_name}" > /dev/null
  adb shell am start -W -n "${activity_name}" \
    | tee "${output_dir}/launch-${attempt}.txt" || launch_failed=1

  sleep 15
  adb shell pidof "${package_name}" \
    | tr -d '\r' | tee "${output_dir}/pid-${attempt}.txt" || true
  adb shell dumpsys activity activities \
    > "${output_dir}/activities-${attempt}.txt" 2>&1 || true
  adb shell dumpsys window windows \
    > "${output_dir}/windows-${attempt}.txt" 2>&1 || true
  adb exec-out screencap -p \
    > "${output_dir}/screen-before-${attempt}.png" || true

  if ! grep -Eq '[0-9]+' "${output_dir}/pid-${attempt}.txt"; then
    echo "Application process disappeared after launch attempt ${attempt}." \
      | tee -a "${output_dir}/verdict.txt"
    launch_failed=1
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
  adb shell input tap "${tap_x}" "${tap_y}"
  sleep 5
  adb exec-out screencap -p \
    > "${output_dir}/screen-after-${attempt}.png" || true
  adb shell dumpsys meminfo "${package_name}" \
    > "${output_dir}/meminfo-${attempt}.txt" 2>&1 || true
  adb shell uiautomator dump --compressed "/sdcard/window-${attempt}.xml" \
    >> "${output_dir}/interaction-${attempt}.txt" 2>&1 || true
  adb pull "/sdcard/window-${attempt}.xml" \
    "${output_dir}/window-${attempt}.xml" \
    >> "${output_dir}/interaction-${attempt}.txt" 2>&1 || true

  if ! adb shell pidof "${package_name}" | tr -d '\r' \
    | grep -Eq '[0-9]+'; then
    echo "Application process disappeared after the first interaction." \
      | tee -a "${output_dir}/interaction-${attempt}.txt" "${output_dir}/verdict.txt"
    launch_failed=1
  elif [[ -f "${output_dir}/window-${attempt}.xml" ]] \
    && grep -E -q '说话分寸|เลือก.*ระดับ|เลือกโทนภาษา|同一个意思' \
      "${output_dir}/window-${attempt}.xml"; then
    echo "PASS: first direction card opened onboarding." \
      | tee -a "${output_dir}/interaction-${attempt}.txt"
  else
    echo "First direction card did not expose the expected onboarding content." \
      | tee -a "${output_dir}/interaction-${attempt}.txt" "${output_dir}/verdict.txt"
    launch_failed=1
  fi
done

adb logcat -d -v threadtime > "${output_dir}/logcat.txt"
grep -E -i \
  'AndroidRuntime|FATAL EXCEPTION|Process: com\.huilaishi\.app|OutOfMemoryError|Fatal signal|chromium|crashpad|WebView|renderer|lowmemorykiller|am_crash|am_anr' \
  "${output_dir}/logcat.txt" > "${output_dir}/logcat-crash-filtered.txt" || true
grep -E -i \
  'Capacitor/Console.*(Uncaught|SyntaxError|ReferenceError|TypeError|globalThis|padStart)|Uncaught (SyntaxError|ReferenceError|TypeError)' \
  "${output_dir}/logcat.txt" > "${output_dir}/logcat-js-errors.txt" || true

if grep -E -q \
  'Process: com\.huilaishi\.app|ANR in com\.huilaishi\.app|am_crash.*com\.huilaishi\.app|am_anr.*com\.huilaishi\.app' \
  "${output_dir}/logcat.txt"; then
  echo "Package-specific crash or ANR signature found." \
    | tee -a "${output_dir}/verdict.txt"
  launch_failed=1
fi

if [[ -s "${output_dir}/logcat-js-errors.txt" ]]; then
  echo "Uncaught JavaScript compatibility/runtime errors found." \
    | tee -a "${output_dir}/verdict.txt"
  launch_failed=1
fi

if [[ "${launch_failed}" -ne 0 ]]; then
  echo "FAIL: Android launch was not stable." | tee -a "${output_dir}/verdict.txt"
  exit 1
fi

echo "PASS: Process remained alive after all three cold launches." \
  | tee -a "${output_dir}/verdict.txt"
