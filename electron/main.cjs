const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");

const isDev = process.env.NODE_ENV === "development";
const devServerUrl = process.env.VITE_DEV_SERVER_URL ?? "http://localhost:5173";

let fenetrePrincipale = null;

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
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) creerFenetre();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
