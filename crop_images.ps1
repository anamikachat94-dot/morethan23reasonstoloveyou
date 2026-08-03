Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Anamika\.gemini\antigravity\brain\1aea1561-5c0d-4bf0-8b18-0a9a2381a0ad\.user_uploaded\media_1785786298509.jpg"
$img = [System.Drawing.Image]::FromFile($srcPath)

$w = $img.Width
$h = $img.Height

# Top half (vinyl reference): 0% to 50%
$topH = [int]($h * 0.50)
$topBmp = New-Object System.Drawing.Bitmap($w, $topH)
$gTop = [System.Drawing.Graphics]::FromImage($topBmp)
$topSrcRect = New-Object System.Drawing.Rectangle(0, 0, $w, $topH)
$topDestRect = New-Object System.Drawing.Rectangle(0, 0, $w, $topH)
$gTop.DrawImage($img, $topDestRect, $topSrcRect, [System.Drawing.GraphicsUnit]::Pixel)
$topBmp.Save("C:\Users\Anamika\.gemini\antigravity\scratch\morethan23reasonstoloveyou\public\vinyl-ref.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$gTop.Dispose()
$topBmp.Dispose()

# Bottom half (letter frame background): 50% to 100%
$botY = [int]($h * 0.50)
$botH = $h - $botY
$botBmp = New-Object System.Drawing.Bitmap($w, $botH)
$gBot = [System.Drawing.Graphics]::FromImage($botBmp)
$botSrcRect = New-Object System.Drawing.Rectangle(0, $botY, $w, $botH)
$botDestRect = New-Object System.Drawing.Rectangle(0, 0, $w, $botH)
$gBot.DrawImage($img, $botDestRect, $botSrcRect, [System.Drawing.GraphicsUnit]::Pixel)
$botBmp.Save("C:\Users\Anamika\.gemini\antigravity\scratch\morethan23reasonstoloveyou\public\letter-bg.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$gBot.Dispose()
$botBmp.Dispose()

$img.Dispose()
Write-Host "Images successfully cropped into public/vinyl-ref.jpg and public/letter-bg.jpg"
