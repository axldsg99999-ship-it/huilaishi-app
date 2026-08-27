@echo off
chcp 65001 >nul
title 萨瓦迪卡 V12 - 手机双码
where pwsh >nul 2>nul
if %errorlevel%==0 (
  pwsh -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-phone.ps1"
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=[IO.File]::ReadAllText('%~dp0start-phone.ps1',[Text.Encoding]::UTF8); & ([ScriptBlock]::Create($s))"
)
if errorlevel 1 pause
