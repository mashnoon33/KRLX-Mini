"use strict";

const electron = require("electron");
const app = electron.app;
const globalShortcut = electron.globalShortcut;
const AutoLaunch = require("auto-launch");
const menubar = require("menubar");
const ipcMain = electron.ipcMain;
const path = require("path");

let autoLaunch = true;

app.on("window-all-closed", function() {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", function() {
  globalShortcut.unregisterAll();
});

const mb = menubar({
  index: path.join("file://", __dirname, "/main/index.html"),
  icon: path.join(__dirname, "/../assets/menu_icon.png"),
  width: 300,
  height: 500,
  transparent: true,
  vibrancy: "menu",
  resizable: true,
  showDockIcon: false,
  preloadWindow: true
});

mb.on("ready", function ready() {
  const ret = globalShortcut.register("CommandOrControl+Shift+W", function() {
    if (mb.window.isVisible()) {
      mb.window.hide();
    } else {
      mb.window.show();
    }
  });

  if (!ret) {
    console.log("registration failed");
  }

  mb.showWindow();

  ipcMain.on("auto-launch", function(event, args) {
    if (autoLaunch) {
      appLauncher.disable();
      autoLaunch = false;
      console.log("disable auto-launch");
    } else {
      appLauncher.enable();
      autoLaunch = true;
      console.log("enable auto-launch");
    }
  });
});

mb.on("show", function show() {
  mb.window.webContents.send("show");
});

const appPath = app.getPath("exe").split(".app/Content")[0] + ".app";

console.log(appPath);

const appLauncher = new AutoLaunch({
  name: "temps",
  path: appPath,
  isHidden: true
});

appLauncher
  .isEnabled()
  .then(function(enabled) {
    if (enabled) return;
    return appLauncher.enable();
  })
  .then(function(err) {
    console.log(err);
  });

appLauncher.enable();
