const { app, BrowserWindow, shell, dialog, ipcMain } = require("electron");
const path = require("node:path");
const { spawn, execFile } = require("node:child_process");
const https = require("node:https");
const { autoUpdater } = require("electron-updater");

const isDev = process.env.NODE_ENV === "development";
const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? "http://localhost:5173";
const REPO_API = "https://api.github.com/repos/MarechalF/Arcadia/commits/main";

let fenetrePrincipale = null;
let processusMiseAJour = null;

function envoyerStatut(statut) {
  if (fenetrePrincipale && !fenetrePrincipale.isDestroyed()) {
    fenetrePrincipale.webContents.send("mise-a-jour", statut);
  }
}

/** Récupère le SHA du dernier commit GitHub (callback non-bloquant). */
function shaDistant(callback) {
  const requete = https.request(
    REPO_API,
    { headers: { "User-Agent": "flux-publics" }, timeout: 10000 },
    (reponse) => {
      let corps = "";
      reponse.on("data", (morceau) => { corps += morceau; });
      reponse.on("end", () => {
        try {
          const info = JSON.parse(corps);
          callback(null, typeof info.sha === "string" ? info.sha : null);
        } catch {
          callback(new Error("réponse GitHub illisible"), null);
        }
      });
    },
  );
  requete.on("timeout", () => { requete.destroy(); callback(new Error("délai dépassé"), null); });
  requete.on("error", (erreur) => callback(erreur, null));
  requete.end();
}

function configurerIpc() {
  // Vérification de version : compare SHA local (version.ts) vs SHA distant GitHub.
  ipcMain.handle("verifier-version", () => {
    return new Promise((resoudre) => {
      shaDistant((erreur, distant) => {
        if (erreur || !distant) {
          resoudre({ disponible: false, erreur: erreur ? String(erreur.message ?? erreur) : "injoignable" });
          return;
        }
        // Le SHA local est injecté au build via VITE_SHA_LOCAL.
        const local = process.env.VITE_SHA_LOCAL ?? "";
        resoudre({ disponible: distant !== local, distant, local });
      });
    });
  });

  // Mise à jour en un clic : lance update-maintenant.bat (ou git pull + rebuild) dans le dossier de l'app.
  ipcMain.handle("installer-mise-a-jour", () => {
    if (processusMiseAJour) {
      return { ok: false, message: "Une mise à jour est déjà en cours." };
    }
    const dossierApp = isDev ? path.resolve(__dirname, "..") : process.resourcesPath;
    const script = path.join(dossierApp, "update-maintenant.bat");
    try {
      processusMiseAJour = spawn("cmd.exe", ["/c", script], {
        cwd: dossierApp,
        detached: true,
        stdio: "ignore",
        windowsHide: true,
      });
      processusMiseAJour.unref();
      envoyerStatut({ texte: "Mise à jour lancée — la fenêtre de mise à jour s'ouvre. L'application redémarrera automatiquement.", info: null });
      return { ok: true, message: "Mise à jour lancée." };
    } catch (erreur) {
      envoyerStatut({ texte: `Échec du lancement de la mise à jour : ${String(erreur)}`, info: null });
      return { ok: false, message: String(erreur) };
    }
  });

  // Mode installateur (electron-updater) si l'app a été installée via NSIS.
  ipcMain.handle("verifier-maj-installateur", () => {
    return new Promise((resoudre) => {
      if (isDev) {
        resoudre({ disponible: false, raison: "mode développement" });
        return;
      }
      autoUpdater.checkForUpdates().then((resultat) => {
        resoudre({ disponible: resultat && resultat.updateInfo ? resultat.updateInfo.version !== app.getVersion() : false });
      }).catch((erreur) => {
        resoudre({ disponible: false, raison: String(erreur) });
      });
    });
  });
}

function configurerMiseAJourInstallateur() {
  if (isDev) return;
  autoUpdater.logger = console;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", (info) => {
    envoyerStatut({ texte: `Nouvelle version ${info.version} — téléchargement…`, info: { version: info.version } });
  });
  autoUpdater.on("update-downloaded", async (info) => {
    envoyerStatut({ texte: `Version ${info.version} prête — redémarrage pour installer.`, info: { version: info.version } });
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
  configurerIpc();
  configurerMiseAJourInstallateur();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) creerFenetre();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
