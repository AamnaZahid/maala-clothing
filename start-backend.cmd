@echo off
cd /d "%~dp0backend"
set SPRING_PROFILES_ACTIVE=dev
echo Starting Maala Clothing Backend on http://localhost:8081 ...
call mvnw.cmd spring-boot:run
