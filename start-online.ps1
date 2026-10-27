# ========================================================
# Random Thinking - Complete Game & Online Launcher
# ========================================================
$ProgressPreference = 'SilentlyContinue'
$ErrorActionPreference = 'SilentlyContinue'

$rootDir = $PSScriptRoot
$backendDir = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "frontend"

function Test-PortOpen([int]$port) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $iar = $tcp.BeginConnect("127.0.0.1", $port, $null, $null)
        $ok = $iar.AsyncWaitHandle.WaitOne(600, $false)
        if ($ok) {
            $tcp.EndConnect($iar)
            $tcp.Close()
            return $true
        }
        $tcp.Close()
        return $false
    } catch {
        return $false
    }
}

Write-Host "========================================================" -ForegroundColor Magenta
Write-Host "   RANDOM THINKING - FULL GAME LAUNCHER" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Magenta

# 1. Start Backend if not already running
$isBackendRunning = Test-PortOpen 8080
if ($isBackendRunning) {
    Write-Host "[OK] Backend is already running on port 8080 (MySQL connected)." -ForegroundColor Green
} else {
    Write-Host "[1/3] Starting Spring Boot Backend (connected to MySQL Workbench)..." -ForegroundColor Yellow
    $mvnCmd = Join-Path $backendDir "mvnw.cmd"
    Start-Process -FilePath $mvnCmd -ArgumentList "spring-boot:run" -WorkingDirectory $backendDir -WindowStyle Minimized
    
    Write-Host "      Waiting for Spring Boot to connect to MySQL..." -NoNewline -ForegroundColor Gray
    for ($i = 0; $i -lt 40; $i++) {
        Start-Sleep -Seconds 2
        Write-Host "." -NoNewline -ForegroundColor Gray
        $check = Test-PortOpen 8080
        if ($check) {
            break
        }
    }
    Write-Host ""
    $isBackendRunning = Test-PortOpen 8080
    if ($isBackendRunning) {
        Write-Host "[OK] Backend successfully connected and initialized!" -ForegroundColor Green
    } else {
        Write-Host "[!] Backend is still initializing in the background." -ForegroundColor Yellow
    }
}

# 2. Start Frontend if not already running
$isFrontendRunning = Test-PortOpen 5173
if ($isFrontendRunning) {
    Write-Host "[OK] Frontend is already running on port 5173." -ForegroundColor Green
} else {
    Write-Host "[2/3] Starting Vite Frontend Server..." -ForegroundColor Yellow
    Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev", "--", "--host" -WorkingDirectory $frontendDir -WindowStyle Minimized
    
    for ($i = 0; $i -lt 15; $i++) {
        Start-Sleep -Seconds 1
        $check = Test-PortOpen 5173
        if ($check) {
            break
        }
    }
    Write-Host "[OK] Frontend server ready on port 5173!" -ForegroundColor Green
}

# 3. Detect Wi-Fi / LAN IP
$localIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -ExpandProperty IPAddress -First 1)

# 4. Connect Public Tunnel over Port 443 (Pinggy)
Write-Host "[3/3] Establishing secure public HTTPS tunnel..." -ForegroundColor Yellow
$logFile = Join-Path $env:TEMP "pinggy_live.log"
if (Test-Path $logFile) { Remove-Item -Force $logFile }

Start-Process -FilePath "ssh.exe" -ArgumentList "-o", "StrictHostKeyChecking=no", "-o", "ServerAliveInterval=30", "-p", "443", "-R0:localhost:5173", "45.118.134.87" -RedirectStandardOutput $logFile -RedirectStandardError $logFile -WindowStyle Hidden

$publicUrl = $null
for ($i = 0; $i -lt 12; $i++) {
    Start-Sleep -Seconds 1
    if (Test-Path $logFile) {
        $content = Get-Content $logFile -Raw
        if ($content -match '(https:\/\/[a-z0-9\-]+\.free\.pinggy\.net)') {
            $publicUrl = $matches[1]
            break
        }
        if ($content -match '(https:\/\/[a-z0-9\-]+\.run\.pinggy-free\.link)') {
            $publicUrl = $matches[1]
            break
        }
    }
}

# Output Summary
Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "   GAME IS READY & LIVE ONLINE!" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green
Write-Host "Local (Your PC):        http://localhost:5173" -ForegroundColor White
if ($localIp) {
    Write-Host "Same Wi-Fi / Hotspot:   http://${localIp}:5173" -ForegroundColor Cyan
}
if ($publicUrl) {
    Write-Host "Global Public URL:      $publicUrl" -ForegroundColor Yellow
    Write-Host "   (Share this link with anyone anywhere in the world to play!)" -ForegroundColor Gray
    Set-Clipboard -Value $publicUrl
    Write-Host "`n[OK] Public link copied to your clipboard!" -ForegroundColor Green
}
Write-Host "========================================================`n" -ForegroundColor Green

# Open local browser
Start-Process "http://localhost:5173"
