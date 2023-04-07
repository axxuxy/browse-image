"use strict";

import {
  app,
  protocol,
  BrowserWindow,
  session,
  Menu,
  ipcMain,
  dialog,
} from "electron";
import { createReadStream, existsSync, lstatSync } from "fs";
import { resolve } from "path";

Menu.setApplicationMenu(null);

ipcMain.handle("selectDirectory", () => {
  return dialog
    .showOpenDialog({
      properties: ["openDirectory"],
    })
    .then((_) => _.filePaths[0]);
});

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1024,
    height: 800,
    icon: app.isPackaged
      ? resolve(__dirname, "../renderer/favicon.ico")
      : resolve(__dirname, "../../public/favicon.ico"),
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.maximize();

  ipcMain.on("actionDevtools", () => {
    if (win.webContents.isDevToolsOpened()) win.webContents.closeDevTools();
    else win.webContents.openDevTools();
  });
  ipcMain.on("fullScreen", () => {
    win.fullScreen = true;
  });
  ipcMain.on("hideFullScreen", () => {
    win.fullScreen = false;
  });

  if (process.env.DEV_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.DEV_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    const website = "app://./";
    const root = resolve(__dirname, "../renderer");

    protocol.registerFileProtocol("app", (req, res) => {
      const path = req.url.slice(website.length);

      let file = resolve(root, path);
      if (!file.startsWith(root))
        return res({
          statusCode: 403,
        });

      if (!existsSync(file) || !lstatSync(file).isFile())
        file = resolve(root, "index.html");
      res(file);
    });
    // Load the index.html when not in development
    win.loadURL(website);
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (!app.isPackaged) {
    // Install Vue Devtools
    try {
      session.defaultSession.loadExtension(
        resolve(
          app.getPath("home"),
          "AppData/Local/Google/Chrome/User Data/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/6.5.0_1"
        )
      );
    } catch (e) {
      console.error("Vue Devtools failed to install:", e);
    }
  }
  protocol.registerStreamProtocol("path", (req, call) => {
    // 由于req.url传递过来会转为cncodeURL,需要解码为中文
    const url = decodeURI(req.url);

    call(createReadStream(url.substring(7)));
  });
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (!app.isPackaged) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
