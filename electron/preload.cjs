const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("fluxPublics", {
  plateforme: process.platform,
  versionApp: process.env.npm_package_version ?? "0.0.0",
  estApplicationBureau: true,
  surMiseAJour: (callback) => {
    ipcRenderer.on("mise-a-jour", (_event, donnees) => callback(donnees));
  },
});
