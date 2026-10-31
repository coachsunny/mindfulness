param(
    [Parameter(Mandatory=$true)][string]$SourceImagePath,
    [Parameter(Mandatory=$true)][string]$OutputImagePath,
    [Parameter(Mandatory=$true)][string]$TargetUrl
)

Add-Type -AssemblyName System.Drawing
$qrApiUrl = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=6&color=111829&bgcolor=f7efe2&data=$([uri]::EscapeDataString($TargetUrl))"
$qrTemp = Join-Path $env:TEMP "mindful_qr_temp.png"
Invoke-WebRequest -Uri $qrApiUrl -OutFile $qrTemp

$baseImg = [System.Drawing.Image]::FromFile($SourceImagePath)
$bmp = New-Object System.Drawing.Bitmap($baseImg.Width, $baseImg.Height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($baseImg, 0, 0, $baseImg.Width, $baseImg.Height)

$qrImg = [System.Drawing.Image]::FromFile($qrTemp)
$qrSize = [int]($baseImg.Width * 0.13)
$pad = [int]($baseImg.Width * 0.048)
$x = $baseImg.Width - $qrSize - $pad
$y = $baseImg.Height - $qrSize - [int]($baseImg.Height * 0.15)

$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 17, 24, 41))
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(190, 235, 190, 118), 2)
$boxRect = New-Object System.Drawing.Rectangle(($x - 10), ($y - 10), ($qrSize + 20), ($qrSize + 36))
$g.FillRectangle($bgBrush, $boxRect)
$g.DrawRectangle($pen, $boxRect)

$g.DrawImage($qrImg, $x, $y, $qrSize, $qrSize)

$font = New-Object System.Drawing.Font("Microsoft YaHei", 9.5, [System.Drawing.FontStyle]::Regular)
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 235, 190, 118))
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
# 使用 Unicode 編碼確保跨系統無亂碼 ("扫码进入睡前练习")
$labelStr = "$([char]0x626B)$([char]0x7801)$([char]0x8FDB)$([char]0x5165)$([char]0x7761)$([char]0x524D)$([char]0x7EC3)$([char]0x4E60)"
$g.DrawString($labelStr, $font, $textBrush, [float]($x + $qrSize / 2), [float]($y + $qrSize + 4), $sf)

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]95)

$bmp.Save($OutputImagePath, $jpegCodec, $ep)
$g.Dispose()
$bmp.Dispose()
$baseImg.Dispose()
$qrImg.Dispose()
Write-Output "Generated QR card at: $OutputImagePath"
