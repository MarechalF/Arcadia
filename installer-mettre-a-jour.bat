@echo off
chcp 65001 >nul
title Flux Publics - Installation / Mise a jour

echo.
echo  ============================================
echo   FLUX PUBLICS - Installation / Mise a jour
echo  ============================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo  [ERREUR] Node.js n'est pas installe.
    echo.
    echo  1. Ouvre https://nodejs.org
    echo  2. Telecharge la version LTS et installe-la
    echo  3. Relance ce fichier
    echo.
    pause
    exit /b 1
)

echo  [1/4] Recuperation de la derniere version du code...
call git pull origin main
if errorlevel 1 (
    echo  [INFO] git indisponible ou dossier non versionne - on continue avec le code local.
)

echo.
echo  [2/4] Installation des composants (peut prendre quelques minutes la 1re fois)...
call npm install
if errorlevel 1 (
    echo  [ERREUR] L'installation a echoue. Envoie une capture d'ecran de cette fenetre.
    pause
    exit /b 1
)

echo.
echo  [3/4] Construction de l'application Windows (5 a 10 minutes)...
call npm run build
if errorlevel 1 (
    echo  [ERREUR] La construction a echoue. Envoie une capture d'ecran de cette fenetre.
    pause
    exit /b 1
)

call npx electron-builder --win nsis
if errorlevel 1 (
    echo  [ERREUR] La creation de l'installateur a echoue. Envoie une capture d'ecran.
    pause
    exit /b 1
)

echo.
echo  [4/4] Ouverture du dossier de l'installateur...
start "" "%~dp0release"

echo.
echo  ============================================
echo   TERMINE !
echo   L'installateur "Flux Publics Setup X.X.X.exe"
echo   se trouve dans le dossier qui vient de s'ouvrir.
echo   Double-clique dessus pour installer l'appli.
echo  ============================================
echo.
pause
