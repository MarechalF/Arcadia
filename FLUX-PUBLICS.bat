@echo off
chcp 65001 >nul
title Flux Publics

REM Recherche l'executable deja construit, sinon lance le mode developpeur
set "EXE1=%~dp0release\win-unpacked\Flux Publics.exe"
set "EXE2=%LOCALAPPDATA%\Programs\flux-publics\Flux Publics.exe"

if exist "%EXE1%" (
    start "" "%EXE1%"
    exit /b 0
)

if exist "%EXE2%" (
    start "" "%EXE2%"
    exit /b 0
)

REM Aucune version installee : mode developpeur (fenetre noire a laisser ouverte)
echo premiere utilisation : installation puis lancement de Flux Publics...
echo laisse cette fenetre ouverte, l'application va s'ouvrir.
echo.
where node >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Node.js n'est pas installe.
    echo Telecharge la version LTS sur https://nodejs.org puis relance ce fichier.
    pause
    exit /b 1
)
cd /d "%~dp0"
if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
        echo [ERREUR] L'installation a echoue - envoie une capture de cette fenetre.
        pause
        exit /b 1
    )
)
call npm run electron:dev
