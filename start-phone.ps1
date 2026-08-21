param(
  [int]$PreferredPort = 4173,
  [switch]$NoOpen
)

$ErrorActionPreference = "Stop"
$AppDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$OutputDirectory = Split-Path -Parent $AppDirectory

function Get-PhoneNetwork {
  $VirtualPattern = "virtual|vpn|hamachi|hyper-v|wsl|loopback|tunnel|tap|vmware|vethernet"
  $Routes = Get-NetRoute -DestinationPrefix "0.0.0.0/0" -ErrorAction SilentlyContinue |
    Where-Object { $_.NextHop -ne "0.0.0.0" } |
    Sort-Object RouteMetric, InterfaceMetric

  foreach ($Route in $Routes) {
    $Adapter = Get-NetAdapter -InterfaceIndex $Route.InterfaceIndex -ErrorAction SilentlyContinue
    if (-not $Adapter -or $Adapter.Status -ne "Up") { continue }
    $Description = "$($Adapter.Name) $($Adapter.InterfaceDescription)"
    if ($Description -match $VirtualPattern) { continue }
    $Candidate = Get-NetIPAddress -InterfaceIndex $Route.InterfaceIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue |
      Where-Object { $_.IPAddress -notlike "169.254.*" -and $_.IPAddress -ne "127.0.0.1" } |
      Select-Object -First 1
    if ($Candidate) {
      $Profile = Get-NetConnectionProfile -InterfaceIndex $Route.InterfaceIndex -ErrorAction SilentlyContinue
      return [pscustomobject]@{
        Address = $Candidate.IPAddress
        InterfaceAlias = $Adapter.Name
        Category = if ($Profile) { $Profile.NetworkCategory } else { "Unknown" }
      }
    }
  }
  return $null
}

function Get-FreePhonePort([int]$StartPort) {
  foreach ($Candidate in $StartPort..($StartPort + 40)) {
    $Listener = Get-NetTCPConnection -State Listen -LocalPort $Candidate -ErrorAction SilentlyContinue
    if (-not $Listener) { return $Candidate }
  }
  throw "找不到可用端口（已检查 $StartPort 到 $($StartPort + 40)）"
}

$PythonCommand = Get-Command python -ErrorAction SilentlyContinue
if (-not $PythonCommand) { $PythonCommand = Get-Command py -ErrorAction SilentlyContinue }
if (-not $PythonCommand) {
  Write-Host "没有找到 Python，无法启动手机扫码服务。" -ForegroundColor Red
  Write-Host "仍可把‘会来事-手机离线单文件.html’发送到 Android 手机。"
  Read-Host "按 Enter 退出"
  exit 1
}

$Network = Get-PhoneNetwork
if (-not $Network) {
  Write-Host "没有找到可供手机访问的局域网地址，请确认电脑已连接 Wi-Fi 或网线。" -ForegroundColor Red
  Read-Host "按 Enter 退出"
  exit 1
}

$Port = Get-FreePhonePort $PreferredPort
$BuildScript = Join-Path $AppDirectory "build-offline.ps1"
& $BuildScript

$SingleFile = Join-Path $OutputDirectory "会来事-手机离线单文件.html"
$PackageFile = Join-Path $OutputDirectory "thai-vibe-app-v10-complete.zip"
$PreviewUrl = "http://$($Network.Address):$Port/thai-vibe-app/"
$DownloadUrl = "http://$($Network.Address):$Port/download/android"
$LocalUrl = "http://127.0.0.1:$Port/thai-vibe-app/download.html"

$PreviewQr = Join-Path $OutputDirectory "手机扫码试玩.png"
$DownloadQr = Join-Path $OutputDirectory "手机扫码下载.png"
$QrBoard = Join-Path $OutputDirectory "手机双码.png"
$QrScript = Join-Path $AppDirectory "make-phone-qr.py"
$QrReady = $false
try {
  & $PythonCommand.Source $QrScript $PreviewUrl $PreviewQr $DownloadUrl $DownloadQr $QrBoard
  $QrReady = $LASTEXITCODE -eq 0 -and (Test-Path -LiteralPath $QrBoard)
} catch {
  $QrReady = $false
}

Set-Clipboard -Value "试玩：$PreviewUrl`r`n下载：$DownloadUrl"
Clear-Host
Write-Host "会来事 V10 · 3000 词、跟读反馈、真人邀请与分级萌音" -ForegroundColor Green
Write-Host ""
Write-Host "网络：$($Network.InterfaceAlias) · $($Network.Category) · $($Network.Address)"
if ($Network.Category -eq "Public") {
  Write-Host "当前是公共网络（Public），Windows 可能阻止手机访问。" -ForegroundColor Red
  Write-Host "仅在可信的家庭 Wi-Fi/个人热点中，把该网络改为‘专用网络’后再扫。" -ForegroundColor Yellow
}
if ($Port -ne $PreferredPort) {
  Write-Host "端口 $PreferredPort 已被占用，已安全改用 $Port（未关闭其他程序）。" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "1. 扫码试玩：" -NoNewline; Write-Host $PreviewUrl -ForegroundColor Cyan
Write-Host "2. 扫码下载 Android 离线 HTML：" -NoNewline; Write-Host $DownloadUrl -ForegroundColor Cyan
if ($QrReady) {
  Write-Host "双二维码已生成并即将弹出；两个地址也已复制到剪贴板。" -ForegroundColor Green
} else {
  Write-Host "二维码组件不可用，请手动输入上面的地址。" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "手机与电脑必须在同一 Wi-Fi；这个窗口关闭后二维码会失效。" -ForegroundColor Yellow
Write-Host "按 Ctrl+C 停止服务。永久下载二维码需要以后部署到固定 HTTPS 地址。" -ForegroundColor DarkGray
Write-Host ""

$ServerScript = Join-Path $AppDirectory "phone-server.py"
$ServerArguments = @(
  "`"$ServerScript`"",
  "--port", "$Port",
  "--app-root", "`"$AppDirectory`"",
  "--single-file", "`"$SingleFile`"",
  "--package-file", "`"$PackageFile`""
)
$ServerProcess = Start-Process -FilePath $PythonCommand.Source -ArgumentList $ServerArguments -PassThru -WindowStyle Hidden
try {
  $Ready = $false
  foreach ($Attempt in 1..20) {
    Start-Sleep -Milliseconds 150
    if ($ServerProcess.HasExited) { throw "手机服务启动失败，退出码 $($ServerProcess.ExitCode)" }
    if (Test-NetConnection -ComputerName 127.0.0.1 -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue) {
      $Ready = $true
      break
    }
  }
  if (-not $Ready) { throw "手机服务没有在端口 $Port 就绪" }
  if (-not $NoOpen) {
    if ($QrReady) { Start-Process $QrBoard }
    Start-Process $LocalUrl
  }
  Wait-Process -Id $ServerProcess.Id
} finally {
  if ($ServerProcess -and -not $ServerProcess.HasExited) {
    Stop-Process -Id $ServerProcess.Id -ErrorAction SilentlyContinue
  }
}
