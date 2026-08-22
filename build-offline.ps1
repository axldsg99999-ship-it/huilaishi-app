$ErrorActionPreference = "Stop"
$AppDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$Index = Get-Content (Join-Path $AppDirectory "index.html") -Raw -Encoding UTF8
$Styles = Get-Content (Join-Path $AppDirectory "styles.css") -Raw -Encoding UTF8
$VocabStyles = Get-Content (Join-Path $AppDirectory "vocab.css") -Raw -Encoding UTF8
$ArcadeStyles = Get-Content (Join-Path $AppDirectory "arcade.css") -Raw -Encoding UTF8
$SpeechStyles = Get-Content (Join-Path $AppDirectory "speech-engine.css") -Raw -Encoding UTF8
$PronunciationStyles = Get-Content (Join-Path $AppDirectory "pronunciation-course.css") -Raw -Encoding UTF8
$PronunciationScoreStyles = Get-Content (Join-Path $AppDirectory "pronunciation-score.css") -Raw -Encoding UTF8
$VoicePackUiStyles = Get-Content (Join-Path $AppDirectory "voice-pack-ui.css") -Raw -Encoding UTF8
$PartnerLiveStyles = Get-Content (Join-Path $AppDirectory "partner-live.css") -Raw -Encoding UTF8
$OfflineData = Get-Content (Join-Path $AppDirectory "offline-data.js") -Raw -Encoding UTF8
$VocabL12 = Get-Content (Join-Path $AppDirectory "vocab-l1-l2.js") -Raw -Encoding UTF8
$VocabL34 = Get-Content (Join-Path $AppDirectory "vocab-l3-l4.js") -Raw -Encoding UTF8
$VocabL56 = Get-Content (Join-Path $AppDirectory "vocab-l5-l6.js") -Raw -Encoding UTF8
$VocabExpansionL13 = Get-Content (Join-Path $AppDirectory "vocab-expansion-l1-l3.js") -Raw -Encoding UTF8
$VocabExpansionL46 = Get-Content (Join-Path $AppDirectory "vocab-expansion-l4-l6.js") -Raw -Encoding UTF8
$RegisterPack = Get-Content (Join-Path $AppDirectory "register-pack.js") -Raw -Encoding UTF8
$ThaiPhonetic = Get-Content (Join-Path $AppDirectory "thai-phonetic.js") -Raw -Encoding UTF8
$SpeechEngine = Get-Content (Join-Path $AppDirectory "speech-engine.js") -Raw -Encoding UTF8
$PronunciationAudioMapSource = Get-Content (Join-Path $AppDirectory "pronunciation-audio-map.js") -Raw -Encoding UTF8
$CuteAudioMapSource = Get-Content (Join-Path $AppDirectory "cute-audio-map.js") -Raw -Encoding UTF8
$VoicePackManager = Get-Content (Join-Path $AppDirectory "voice-pack-manager.js") -Raw -Encoding UTF8
$VoicePackUi = Get-Content (Join-Path $AppDirectory "voice-pack-ui.js") -Raw -Encoding UTF8
$PartnerConfig = Get-Content (Join-Path $AppDirectory "partner-config.js") -Raw -Encoding UTF8
$PartnerLive = Get-Content (Join-Path $AppDirectory "partner-live.js") -Raw -Encoding UTF8
$PronunciationCourse = Get-Content (Join-Path $AppDirectory "pronunciation-course.js") -Raw -Encoding UTF8
$PronunciationScore = Get-Content (Join-Path $AppDirectory "pronunciation-score.js") -Raw -Encoding UTF8
$AppScript = Get-Content (Join-Path $AppDirectory "app.js") -Raw -Encoding UTF8
$VocabScript = Get-Content (Join-Path $AppDirectory "vocab-ui.js") -Raw -Encoding UTF8
$ArcadeScript = Get-Content (Join-Path $AppDirectory "arcade.js") -Raw -Encoding UTF8
$AudioDirectory = Join-Path $AppDirectory "assets\audio"
$AudioMap = [ordered]@{}
Get-ChildItem -LiteralPath $AudioDirectory -Filter "alai-*.mp3" |
  Where-Object { $_.BaseName -ne "alai-sonic-mark" } |
  ForEach-Object {
    $AudioKey = $_.BaseName.Substring(5)
    $AudioMap[$AudioKey] = "data:audio/mpeg;base64,$([Convert]::ToBase64String([IO.File]::ReadAllBytes($_.FullName)))"
  }
$AudioJson = $AudioMap | ConvertTo-Json -Compress
$SugarAudioMap = [ordered]@{}
Get-ChildItem -LiteralPath $AudioDirectory -Filter "sugarblade-*.mp3" |
  ForEach-Object {
    $AudioKey = $_.BaseName.Substring(11)
    $SugarAudioMap[$AudioKey] = "data:audio/mpeg;base64,$([Convert]::ToBase64String([IO.File]::ReadAllBytes($_.FullName)))"
  }
$SugarAudioJson = $SugarAudioMap | ConvertTo-Json -Compress
$PronunciationMapMatch = [regex]::Match($PronunciationAudioMapSource, '(?s)globalThis\.PRONUNCIATION_AUDIO\s*=\s*(\{.*?\})\s*;')
if (-not $PronunciationMapMatch.Success) { throw "发音课音频映射格式错误。" }
$PronunciationMapObject = $PronunciationMapMatch.Groups[1].Value | ConvertFrom-Json
$PronunciationProfileMatch = [regex]::Match($PronunciationAudioMapSource, '(?s)globalThis\.PRONUNCIATION_AUDIO_PROFILE\s*=\s*Object\.freeze\(\{.*?\}\)\s*;')
if (-not $PronunciationProfileMatch.Success) { throw "发音课 STANDARD profile 元数据缺失。" }
$PronunciationProfileSource = $PronunciationProfileMatch.Value
$PronunciationAudioDataMap = [ordered]@{}
foreach ($Property in $PronunciationMapObject.PSObject.Properties) {
  $RelativeSource = [string]$Property.Value
  $PhysicalSource = Join-Path $AppDirectory ($RelativeSource -replace '/', '\')
  if (-not (Test-Path -LiteralPath $PhysicalSource)) { throw "发音课音频不存在：$RelativeSource" }
  $PronunciationAudioDataMap[$Property.Name] = "data:audio/mpeg;base64,$([Convert]::ToBase64String([IO.File]::ReadAllBytes($PhysicalSource)))"
}
$PronunciationAudioDataJson = $PronunciationAudioDataMap | ConvertTo-Json -Compress
$CuteAudioDataMap = [ordered]@{}
$CuteAudioDirectory = Join-Path $AudioDirectory "cute-content"
if (Test-Path -LiteralPath $CuteAudioDirectory) {
  Get-ChildItem -LiteralPath $CuteAudioDirectory -Filter "*.mp3" -File | ForEach-Object {
    $CuteAudioDataMap[$_.Name] = "data:audio/mpeg;base64,$([Convert]::ToBase64String([IO.File]::ReadAllBytes($_.FullName)))"
  }
}
$CuteAudioDataJson = $CuteAudioDataMap | ConvertTo-Json -Compress

$Index = $Index.Replace('<link rel="manifest" href="manifest.webmanifest" />', '')
$Index = $Index.Replace('<link rel="apple-touch-icon" href="icons/icon-192.png" />', '')
$Index = $Index.Replace('<link rel="stylesheet" href="styles.css" />', "<style>`n$Styles`n</style>")
$Index = $Index.Replace('<link rel="stylesheet" href="vocab.css" />', "<style>`n$VocabStyles`n</style>")
$Index = $Index.Replace('<link rel="stylesheet" href="arcade.css" />', "<style>`n$ArcadeStyles`n</style>")
$Index = $Index.Replace('<link rel="stylesheet" href="speech-engine.css" />', "<style>`n$SpeechStyles`n</style>")
$Index = $Index.Replace('<link rel="stylesheet" href="pronunciation-course.css" />', "<style>`n$PronunciationStyles`n</style>")
$Index = $Index.Replace('<link rel="stylesheet" href="pronunciation-score.css" />', "<style>`n$PronunciationScoreStyles`n</style>")
$Index = $Index.Replace('<link rel="stylesheet" href="voice-pack-ui.css" />', "<style>`n$VoicePackUiStyles`n</style>")
$Index = $Index.Replace('<link rel="stylesheet" href="partner-live.css" />', "<style>`n$PartnerLiveStyles`n</style>")
$Index = $Index.Replace('<script src="offline-data.js"></script>', "<script>window.SINGLE_FILE_BUILD = true; window.ALAI_AUDIO = $AudioJson; window.SUGAR_AUDIO = $SugarAudioJson;</script>`n<script>`n$OfflineData`n</script>")
$Index = $Index.Replace('<script src="vocab-l1-l2.js"></script>', "<script>`n$VocabL12`n</script>")
$Index = $Index.Replace('<script src="vocab-l3-l4.js"></script>', "<script>`n$VocabL34`n</script>")
$Index = $Index.Replace('<script src="vocab-l5-l6.js"></script>', "<script>`n$VocabL56`n</script>")
$Index = $Index.Replace('<script src="vocab-expansion-l1-l3.js"></script>', "<script>`n$VocabExpansionL13`n</script>")
$Index = $Index.Replace('<script src="vocab-expansion-l4-l6.js"></script>', "<script>`n$VocabExpansionL46`n</script>")
$Index = $Index.Replace('<script src="register-pack.js"></script>', "<script>`n$RegisterPack`n</script>")
$Index = $Index.Replace('<script src="thai-phonetic.js"></script>', "<script>`n$ThaiPhonetic`n</script>")
$Index = $Index.Replace('<script src="pronunciation-audio-map.js"></script>', "<script>globalThis.PRONUNCIATION_AUDIO = $PronunciationAudioDataJson; globalThis.PRONUNCIATION_AUDIO_TRACK = 'standard'; globalThis.PRONUNCIATION_AUDIO_REVIEW = 'automated-qc-passed-native-teacher-pending'; $PronunciationProfileSource</script>")
$Index = $Index.Replace('<script src="cute-audio-map.js"></script>', "<script>globalThis.HUILAISHI_CUTE_AUDIO_DATA = $CuteAudioDataJson;</script>`n<script>`n$CuteAudioMapSource`n</script>")
$Index = $Index.Replace('<script src="voice-pack-manager.js"></script>', "<script>`n$VoicePackManager`n</script>")
$Index = $Index.Replace('<script src="voice-pack-ui.js"></script>', "<script>`n$VoicePackUi`n</script>")
$Index = $Index.Replace('<script src="partner-config.js"></script>', "<script>`n$PartnerConfig`n</script>")
$Index = $Index.Replace('<script src="partner-live.js"></script>', "<script>`n$PartnerLive`n</script>")
$Index = $Index.Replace('<script src="speech-engine.js"></script>', "<script>`n$SpeechEngine`n</script>")
$Index = $Index.Replace('<script src="pronunciation-course.js"></script>', "<script>`n$PronunciationCourse`n</script>")
$Index = $Index.Replace('<script src="pronunciation-score.js"></script>', "<script>`n$PronunciationScore`n</script>")
$Index = $Index.Replace('<script src="app.js"></script>', "<script>`n$AppScript`n</script>")
$Index = $Index.Replace('<script src="vocab-ui.js"></script>', "<script>`n$VocabScript`n</script>")
$Index = $Index.Replace('<script src="arcade.js"></script>', "<script>`n$ArcadeScript`n</script>")

$OutputPath = Join-Path (Split-Path -Parent $AppDirectory) "会来事-手机离线单文件.html"
Set-Content -LiteralPath $OutputPath -Value $Index -Encoding UTF8
Write-Host "已生成：$OutputPath" -ForegroundColor Green
