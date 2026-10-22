@echo off
chcp 65001 >nul
title Mise a jour - Flux Publics
mode con: cols=90 lines=30

echo.
echo  ============================================
echo    MISE A JOUR DE FLUX PUBLICS
echo    Laisse cette fenetre ouverte jusqu'a la fin.
echo  ============================================
echo.

cd /d "%~dp0"
if not exist "package.json" (
    echo  [ERREUR] package.json introuvable ici : ce script doit etre lance depuis le dossier du projet.
    pause
    exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
    echo  [ERREUR] Node.js n'est pas installe. Telecharge la version LTS sur nodejs.org
    pause
    exit /b 1
)

echo  [0/5] Fermeture de l'application en cours...
taskkill /im "electron.exe" /f >nul 2>&1
timeout /t 2 /nobreak >nul

echo  [1/5] Recuperation de la derniere version sur GitHub...
git pull origin main
if errorlevel 1 (
    echo.
    echo  [ERREUR] git pull a echoue.
    echo  Causes possibles :
    echo    - git n'est pas installe ^(git-scm.com^)
    echo    - pas de connexion internet
    echo    - le dossier n'est pas un clone git ^(recree-le avec : git clone https://github.com/MarechalF/Arcadia.git^)
    pause
    exit /b 1
)

echo.
echo  [2/5] Installation des nouvelles dependances...
call npm install
if errorlevel 1 (
    echo  [ERREUR] npm install a echoue. Verifie ta connexion internet.
    pause
    exit /b 1
)

echo.
echo  [3/5] Construction de la nouvelle version...
call npm run build
if errorlevel 1 (
    echo  [ERREUR] La construction a echoue. Envoie une capture de cette fenetre.
    pause
    exit /b 1
)

echo.
echo  [4/5] Regeneration de l'empreinte de version...
call node scripts/generer-version.mjs

echo.
echo  [5/5] Relance de Flux Publics dans 3 secondes...
timeout /t 3 /nobreak >nul
start "" cmd /c "npm run electron:dev"

echo.
echo  ============================================
echo    MISE A JOUR TERMINEE !
echo    Flux Publics se relance automatiquement.
echo  ============================================
echo.
echo  Cette fenetre se fermera dans 5 secondes...
timeout /t 5 /nobreak >nul
exit /b 0
