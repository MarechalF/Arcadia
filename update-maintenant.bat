@echo off
chcp 65001 >nul
title Flux Publics - Mise a jour automatique

echo.
echo  ============================================
echo   MISE A JOUR DE FLUX PUBLICS
echo  ============================================
echo.

REM Dossier racine du projet (celui qui contient package.json)
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo  [ERREUR] Node.js n'est pas installe. Telecharge la version LTS sur nodejs.org
    pause
    exit /b 1
)

echo  [1/5] Recuperation de la derniere version sur GitHub...
call git pull origin main
if errorlevel 1 (
    echo  [INFO] git indisponible - tentative avec le code local.
) else (
    echo  Code mis a jour avec succes.
)

echo.
echo  [2/5] Installation des nouvelles dependances...
call npm install
if errorlevel 1 (
    echo  [ERREUR] Installation des dependances impossible. Verifie ta connexion internet.
    pause
    exit /b 1
)

echo.
echo  [3/5] Construction de la nouvelle version...
call npm run build
if errorlevel 1 (
    echo  [ERREUR] La construction a echoue.
    pause
    exit /b 1
)

echo.
echo  [4/5] Preparation de l'application...
call npx electron-builder --dir --config.directories.output=release >nul 2>&1
if errorlevel 1 (
    echo  [INFO] Empaquetage optionnel ignore - lancement en mode developpeur.
)

echo.
echo  [5/5] Relance de Flux Publics dans 3 secondes...
timeout /t 3 /nobreak >nul
start "" cmd /c "call npm run electron:dev"

echo.
echo  ============================================
echo   MISE A JOUR TERMINEE !
echo   Flux Publics se relance automatiquement.
echo  ============================================
echo.
REM Ferme le processus Electron parent s'il attend la fin
exit /b 0
