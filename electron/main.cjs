const { app, BrowserWindow, shell, dialog } = require("electron");
const path = require("node:path");
const { autoUpdater } = require("electron-updater");

const isDev = process.env.NODE_ENV === "development";
const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? "http://localhost:5173";

let fenetrePrincipale = null;

function envoyerStatut(texte, info) {
  if (fenetrePrincipale && !fenetrePrincipale.isDestroyed()) {
    fenetrePrincipale.webContents.send("mise-a-jour", { texte, info: info ?? null });
  }
}

function configurerMiseAJour() {
  if (isDev) return;

  autoUpdater.logger = console;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => envoyerStatut("Recherche de mise à jour…"));
  autoUpdater.on("update-available", (info) => {
    envoyerStatut(`Nouvelle version ${info.version} — téléchargement…`, { version: info.version });
  });
  autoUpdater.on("update-not-available", () => envoyerStatut("Application à jour."));
  autoUpdater.on("download-progress", (progress) => {
    envoyerStatut(`Téléchargement : ${Math.round(progress.percent)} %`, { percent: progress.percent });
  });
  autoUpdater.on("update-downloaded", async (info) => {
    envoyerStatut(`Version ${info.version} prête — redémarrage pour installer.`);
    const reponse = await dialog.showMessageBox(fenetrePrincipale, {
      type: "info",
      title: "Mise à jour disponible",
      message: `La version ${info.version} de Flux Publics vient d'être téléchargée.`,
      detail: "Redémarrer maintenant pour l'installer ? Vos scénarios sont conservés.",
      buttons: ["Redémarrer maintenant", "Plus tard"],
      defaultId: 0,
    });
    if (reponse.response === 0) {
      autoUpdater.quitAndInstall(false, true);
    }
  });
  autoUpdater.on("error", (erreur) => envoyerStatut(`Mise à jour indisponible (${String(erreur)})`));
}

function creerFenetre() {
  fenetrePrincipale = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "Flux Publics",
    backgroundColor: "#0b1220",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  fenetrePrincipale.setMenuBarVisibility(false);

  fenetrePrincipale.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  fenetrePrincipale.on("closed", () => {
    fenetrePrincipale = null;
  });

  if (isDev) {
    void fenetrePrincipale.loadURL(devServerUrl);
  } else {
    void fenetrePrincipale.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  creerFenetre();
  configurerMiseAJour();
  void autoUpdater.checkForUpdatesAndNotify();
  setInterval(() => {
    if (!isDev) void autoUpdater.checkForUpdates();
  }, 6 * 60 * 60 * 1000);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) creerFenetre();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
