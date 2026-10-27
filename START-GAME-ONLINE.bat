@echo off
title Random Thinking Game - Online Launcher
color 0b

echo ========================================================
echo   RANDOM THINKING - GUESS THE NUMBER ONLINE LAUNCHER
echo ========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-online.ps1"

pause
