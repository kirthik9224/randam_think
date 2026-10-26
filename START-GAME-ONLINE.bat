@echo off
title Random Thinking Game - Online Launcher
color 0b

echo ========================================================
echo   RANDOM THINKING - GUESS THE NUMBER ONLINE LAUNCHER
echo ========================================================
echo.
echo [1/3] Starting Spring Boot Backend (connected to MySQL Workbench)...
start /b "" powershell -NoProfile -ExecutionPolicy Bypass -Command "cd '%~dp0backend' ; .\mvnw.cmd spring-boot:run"

timeout /t 5 /nobreak >nul

echo [2/3] Starting Vite Frontend Server...
start /b "" powershell -NoProfile -ExecutionPolicy Bypass -Command "cd '%~dp0frontend' ; npm run dev -- --host"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Cloudflare Public Tunnel (No Passwords / Global HTTPS)...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-online.ps1"

pause
