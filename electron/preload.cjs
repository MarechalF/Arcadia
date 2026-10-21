const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("fluxPublics", {
  plateforme: process.platform,
  versionApp: process.env.npm_package_version ?? "0.0.0",
  estApplicationBureau: true,
});
