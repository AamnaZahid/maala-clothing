@echo off
cd /d "%~dp0frontend"
echo Starting Maala Clothing Frontend on http://localhost:5173 ...
call npm.cmd run dev
