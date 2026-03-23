@echo off
title AZRAEL_PROTOCOL_LAUNCHER
echo [INIT] AZRAEL_CORE_SYNC...
echo [SIGNAL] CONNECTING_TO_FIVE_DOMAINS...

:: 1. Start the Python Shepherd in the background
cd /d %~dp0\Reciever-main
start cmd /k "python shepherd.py"

:: 2. Start the Frontend Forge (Vite)
echo [SYSTEM] INITIATING_THE_FORGE...
npm install && npm run dev

pause
