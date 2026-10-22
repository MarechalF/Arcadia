const { app, BrowserWindow, shell, dialog, ipcMain } = require("electron");
const path = require("node:path");
const { spawn, execFile } = require("node:child_process");
const fs = require("node:fs");
const https = require("node:https");
const { autoUpdater } = require("electron-updater");

const isDev = process.env.NODE_ENV === "development";
const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? "http://localhost:5173";
const REPO_API = "https://api.github.com/repos/MarechalF/Arcadia/commits/main";

let fenetrePrincipale = null;

function envoyerStatut(statut) {
  if (fenetrePrincipale && !fenetrePrincipale.isDestroyed()) {
    fenetrePrincipale.webContents.send("mise-a-jour", statut);
  }
}

/** SHA du code local : calculé par git, ou lu dans dist/version.txt au build. */
function shaLocal(callback) {
  const dossierRacine = isDev ? path.resolve(__dirname, "..") : path.resolve(process.resourcesPath, "..");
  try {
    execFile("git", ["-C", dossierRacine, "rev-parse", "HEAD"], (erreur, stdout) => {
      if (!erreur && stdout && stdout.trim()) {
        callback(stdout.trim());
        return;
      }
      callback(shaDeploye());
    });
  } catch {
    callback(shaDeploye());
  }
}

/** SHA embarqué au build par scripts/generer-version.mjs (dist/version.txt). */
function shaDeploye() {
  const candidats = [
    path.join(__dirname, "../dist/version.txt"),
    path.join(process.resourcesPath, "dist/version.txt"),
  ];
  for (const fichier of candidats) {
    try {
      if (fs.existsSync(fichier)) {
        return fs.readFileSync(fichier, "utf8").trim();
      }
    } catch {
      // ignorer
    }
  }
  return "";
}

/** Récupère le SHA du dernier commit GitHub. */
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
  // Vérification : SHA local (git ou build) vs SHA distant GitHub.
  ipcMain.handle("verifier-version", () => {
    return new Promise((resoudre) => {
      shaLocal((local) => {
        shaDistant((erreur, distant) => {
          if (erreur || !distant) {
            resoudre({ disponible: false, erreur: erreur ? String(erreur.message ?? erreur) : "injoignable", local });
            return;
          }
          if (!local) {
            resoudre({ disponible: false, erreur: "empreinte locale introuvable (dossier sans git ni build)", local });
            return;
          }
          resoudre({ disponible: distant !== local, distant, local });
        });
      });
    });
  });

  // Mise à jour : lance update-maintenant.bat dans une fenêtre VISIBLE.
  ipcMain.handle("installer-mise-a-jour", () => {
    const dossierApp = path.resolve(__dirname, "..");
    const script = path.join(dossierApp, "update-maintenant.bat");
    if (!fs.existsSync(script)) {
      const message = `Script de mise à jour introuvable : ${script}. Utilise git pull + FLUX-PUBLICS.bat manuellement.`;
      envoyerStatut({ texte: message, info: null });
      return { ok: false, message };
    }
    try {
      const processus = spawn("cmd.exe", ["/c", "start", "« Mise à jour Flux Publics »", script], {
        cwd: dossierApp,
        detached: true,
        stdio: "ignore",
        windowsHide: false,
      });
      processus.unref();
      const message = "Mise à jour lancée — une fenêtre s'ouvre : laisse-la terminer, l'application redémarrera ensuite.";
      envoyerStatut({ texte: message, info: null });
      return { ok: true, message };
    } catch (erreur) {
      const message = `Échec du lancement : ${String(erreur)}`;
      envoyerStatut({ texte: message, info: null });
      return { ok: false, message };
    }
  });

  // Mode installateur NSIS (electron-updater) si l'app a été installée.
  ipcMain.handle("verifier-maj-installateur", () => {
    return new Promise((resoudre) => {
      if (isDev || !process.resourcesPath.includes("Programs")) {
        resoudre({ disponible: false, raison: "mode développeur" });
        return;
      }
      autoUpdater.checkForUpdates().then((resultat) => {
        resoudre({ disponible: Boolean(resultat && resultat.updateInfo && resultat.updateInfo.version !== app.getVersion()) });
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
