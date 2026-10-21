@echo off
chcp 65001 >nul
title Flux Publics

if exist "%~dp0release\win-unpacked\Flux Publics.exe" (
    echo Lancement de Flux Publics (version installee)...
    start "" "%~dp0release\win-unpacked\Flux Publics.exe"
    exit /b 0
)

echo Version installee non trouvee - lancement en mode developpeur...
echo (la fenetre doit rester ouverte pendant l'utilisation)
echo.
where node >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Node.js manquant. Lance d'abord "installer-mettre-a-jour.bat"
    pause
    exit /b 1
)
call npm install
call npm run electron:dev
