# Random Thinking - Cloudflare Tunnel Starter
$toolsPath = Join-Path $PSScriptRoot "tools\cloudflared.exe"
if (-not (Test-Path $toolsPath)) {
    $toolsPath = "$env:TEMP\cloudflared.exe"
}

Write-Host "Connecting game to Cloudflare edge network..." -ForegroundColor Green
$logFile = "$env:TEMP\cloudflared_live.log"
if (Test-Path $logFile) { Remove-Item -Force $logFile }

Start-Process -FilePath $toolsPath -ArgumentList "tunnel --url http://localhost:5173 --logfile $logFile" -WindowStyle Hidden

Write-Host "Waiting for live public URL..." -ForegroundColor Yellow
$liveUrl = $null
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    if (Test-Path $logFile) {
        $content = Get-Content $logFile -Raw -ErrorAction SilentlyContinue
        if ($content -match '(https:\/\/[a-z0-9\-]+\.trycloudflare\.com)') {
            $liveUrl = $matches[1]
            break
        }
    }
}

if ($liveUrl) {
    Write-Host "`n========================================================" -ForegroundColor Cyan
    Write-Host "🎉 YOUR GAME IS LIVE ONLINE!" -ForegroundColor Green
    Write-Host "👉 Public URL: $liveUrl" -ForegroundColor Yellow
    Write-Host "========================================================`n" -ForegroundColor Cyan
    Set-Clipboard -Value $liveUrl
    Write-Host "URL has been copied to your clipboard! Opening browser..." -ForegroundColor Gray
    Start-Process $liveUrl
} else {
    Write-Host "Could not retrieve URL automatically. Opening local server http://localhost:5173" -ForegroundColor Red
    Start-Process "http://localhost:5173"
}
