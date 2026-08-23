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
if [[ "${old_mode}" != "auto" && "${old_mode}" != "manual" ]]; then
  echo "Old launch mode must be 'auto' or 'manual'." >&2
  exit 2
fi
adb wait-for-device
adb shell settings put global hide_error_dialogs 1 >/dev/null 2>&1 || true
adb logcat -c
adb install "${old_apk}" | tee "${output_dir}/install-old.txt"
adb shell am force-stop "${package_name}"
adb shell pm clear "${package_name}" >/dev/null
# S1 launches directly into MainActivity while R2 launches into its native
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

if [[ "${old_mode}" == "manual" ]]; then
  tap_marker "进入课程，三星稳定模式" "old-native"
fi

old_task_id=""
for _ in $(seq 1 30); do
  timeout 20s adb shell dumpsys activity activities > "${output_dir}/old-activities.txt"
  old_task_id="$(sed -n -E "s/.*${package_regex}\/\.MainActivity t([0-9]+).*/\1/p" \
    "${output_dir}/old-activities.txt" | head -n 1)"
  if [[ -n "${old_task_id}" ]] \
      && grep -E -q "(topResumedActivity=|mResumedActivity:|ResumedActivity:).*${package_regex}/\.MainActivity" \
        "${output_dir}/old-activities.txt"; then
    break
  fi
  sleep 1
done
test -n "${old_task_id}"
printf '%s\n' "${old_task_id}" > "${output_dir}/old-task-id.txt"

adb shell input keyevent KEYCODE_HOME
sleep 1
adb install -r "${new_apk}" | tee "${output_dir}/install-upgrade.txt"

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

# A later real home-screen launch must reopen R3's safe native task rather than
# reviving the removed historical task.
adb shell input keyevent KEYCODE_HOME
adb shell monkey -p "${package_name}" -c android.intent.category.LAUNCHER 1 \
  > "${output_dir}/monkey-launch.txt" 2>&1
for _ in $(seq 1 20); do
  dump_ui "desktop-launch"
  timeout 20s adb shell dumpsys activity activities > "${output_dir}/desktop-launch-activities.txt"
  if grep -q 'text="三星稳定入口"' "${output_dir}/desktop-launch.xml" \
      && grep -E -q "(topResumedActivity=|mResumedActivity:|ResumedActivity:).*${package_regex}/\.LauncherActivity" \
        "${output_dir}/desktop-launch-activities.txt"; then
    break
  fi
  sleep 1
done
grep -q 'text="三星稳定入口"' "${output_dir}/desktop-launch.xml"

tap_marker "进入课程，三星稳定模式" "desktop-enter"
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
printf 'PASS: %s signed upgrade recovered the stale task and opened CourseActivity in :course.\n' \
  "${old_mode}" | tee "${output_dir}/verdict.txt"
