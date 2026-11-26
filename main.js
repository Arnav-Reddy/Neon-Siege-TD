// Desktop overlay shell: a transparent, frameless, always-on-top window that floats above other
// apps (including full-screen ones). The page drags it via native drag regions and sizes it to the widget.
const { app, BrowserWindow, screen, ipcMain, globalShortcut, Tray, Menu, nativeImage, Notification, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

const WIDTH = 440, HEIGHT = 344, MARGIN = 16, HOTKEY = 'CommandOrControl+Shift+T', PAUSE_HOTKEY = 'CommandOrControl+Alt+Shift+T';
// The game is loaded live from GitHub Pages, so every push to main reaches the installed app
// on its next launch without a new download. Only changes to this shell need a new release.
// Draft mode: `npm start -- --local` (or TDM_LOCAL=1) loads the in-repo index.html instead.
const LOCAL = process.argv.includes('--local') || !!process.env.TDM_LOCAL;
const LOCAL_GAME = 'file://' + path.join(__dirname, 'index.html');
const GAME_URL = LOCAL
  ? LOCAL_GAME
  : 'https://arnav-reddy.github.io/Neon-Siege-TD/';
let win, tray, saveTimer, menu, hotkeyOk = true;
let shellUpdate = null;   // { version, ready } once a newer desktop release is found

// ---- Desktop shell auto-update (GitHub Releases) ----
// Windows (installer) and Linux AppImage: download in the background, install on quit.
// macOS (ad-hoc signed, so the OS refuses self-replacement) and the Windows portable .exe:
// announce the new version and open its download page in one click.
const RELEASES_URL = 'https://github.com/Arnav-Reddy/Neon-Siege-TD/releases/latest';
const SELF_INSTALL = process.platform !== 'darwin' && !process.env.PORTABLE_EXECUTABLE_DIR;
const UPDATE_EVERY_MS = 6 * 60 * 60 * 1000;
function notify(body, onClick){
  if (!Notification.isSupported()) return;
  const n = new Notification({ title: 'Neon Siege TD', body });
  if (onClick) n.on('click', onClick);
  n.show();
}
function setupShellUpdates(){
  if (!app.isPackaged && !process.env.TDM_UPDATE_TEST) return;   // dev runs never update themselves
  if (process.env.TDM_UPDATE_TEST) autoUpdater.forceDevUpdateConfig = true;
  autoUpdater.autoDownload = SELF_INSTALL;
  autoUpdater.autoInstallOnAppQuit = SELF_INSTALL;
  autoUpdater.on('update-available', info => {
    shellUpdate = { version: info.version, ready: false };
    buildMenu();
    if (!SELF_INSTALL) notify(`Version ${info.version} is available. Click to download it.`, () => shell.openExternal(RELEASES_URL));
  });
  autoUpdater.on('update-downloaded', info => {
    shellUpdate = { version: info.version, ready: true };
    buildMenu();
    notify(`Version ${info.version} is ready. It installs when you quit, or choose Restart to update in the tray menu.`);
  });
  autoUpdater.on('error', err => console.warn('Update check failed:', err.message));
  const check = () => autoUpdater.checkForUpdates().catch(err => console.warn('Update check failed:', err.message));
  check();
  setInterval(check, UPDATE_EVERY_MS);
}
function buildMenu(){
  const items = [
    { label: hotkeyOk ? 'Show / Hide (Ctrl/Cmd+Shift+T)' : 'Show / Hide (tray icon only — hotkey taken)', click: toggle },
    { label: 'Reload game', click: loadGame },
  ];
  if (shellUpdate) items.push({ type: 'separator' }, shellUpdate.ready
    ? { label: `Restart to update to v${shellUpdate.version}`, click: () => autoUpdater.quitAndInstall() }
    : SELF_INSTALL ? { label: `Downloading v${shellUpdate.version}…`, enabled: false }
    : { label: `Download v${shellUpdate.version}…`, click: () => shell.openExternal(RELEASES_URL) });
  items.push({ type: 'separator' }, { label: 'Quit', click: () => app.quit() });
  menu = Menu.buildFromTemplate(items);
}
let triedLocal = false, errorShown = false;

if (!app.requestSingleInstanceLock()) app.quit();

const posFile = () => path.join(app.getPath('userData'), 'window.json');
const writePos = () => { if (win && !win.isDestroyed()) fs.writeFileSync(posFile(), JSON.stringify(win.getPosition())); };
const savePos = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(writePos, 250);
};

// Pin the widget to the topmost level. macOS can demote always-on-top windows across hide/show,
// restore and focus changes (Electron #36364, #9170), so every show path re-asserts both the
// window level ('screen-saver' = NSScreenSaverWindowLevel) and the all-Spaces/full-screen
// collection behavior. skipTransformProcessType: the app is already a UIElement via
// app.dock.hide(), and re-transforming the process type on every pin would flash the Dock.
function pin(){
  if (!win || win.isDestroyed()) return;
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true, skipTransformProcessType: true });
}

function toggle(){
  if (!win || win.isDestroyed()) return;
  if (win.isVisible()) win.hide();
  else { win.showInactive(); pin(); }
}

function loadGame(){ triedLocal = false; errorShown = false; win.loadURL(GAME_URL); }
function loadLocal(){ if (triedLocal) return; triedLocal = true; win.loadURL(LOCAL_GAME); }

app.on('second-instance', () => { if (win) { win.showInactive(); pin(); } });

// Keep a rectangle fully inside the work area of the display it is on.
function keepOnScreen(b){
  const wa = screen.getDisplayMatching(b).workArea;
  return {
    x: Math.min(Math.max(b.x, wa.x), wa.x + wa.width - b.width),
    y: Math.min(Math.max(b.y, wa.y), wa.y + wa.height - b.height),
    width: b.width, height: b.height,
  };
}

// The widget reports its size plus which corner it is anchored to (ax: 'l'|'r', ay: 't'|'b');
// grow/shrink the window around that corner.
function fitTo(w, h, ax, ay){
  w = Math.ceil(Number(w));
  h = Math.ceil(Number(h));
  if (!Number.isFinite(w) || !Number.isFinite(h) || !['l', 'r'].includes(ax) || !['t', 'b'].includes(ay)) return;
  w = Math.max(180, Math.min(1200, w));
  h = Math.max(40, Math.min(1100, h));
  const b = win.getBounds();
  win.setBounds(keepOnScreen({
    x: ax === 'r' ? b.x + b.width - w : b.x,
    y: ay === 'b' ? b.y + b.height - h : b.y,
    width: w, height: h,
  }));
  savePos();
}

app.whenReady().then(async () => {
  if (process.platform === 'darwin') app.dock.hide(); // agent app: required to float over macOS full-screen Spaces
  const wa = screen.getPrimaryDisplay().workArea;
  const home = [wa.x + wa.width - WIDTH - MARGIN, wa.y + wa.height - HEIGHT - MARGIN];
  let x, y;
  try { [x, y] = JSON.parse(fs.readFileSync(posFile(), 'utf8')); }
  catch { [x, y] = home; } // missing or corrupt position: use the default corner
  win = new BrowserWindow({
    ...keepOnScreen({ x, y, width: WIDTH, height: HEIGHT }),
    frame: false, transparent: true, resizable: false, maximizable: false, fullscreenable: false,
    skipTaskbar: true, hasShadow: false, alwaysOnTop: true, backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false,
    },
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true }); // no skip here: first call runs DockHide
  for (const ev of ['show', 'restore', 'focus']) win.on(ev, pin);    // re-assert topmost on every show path
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', e => e.preventDefault());
  win.webContents.session.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  if (!LOCAL) {
    win.webContents.session.webRequest.onHeadersReceived({
      urls: ['https://arnav-reddy.github.io/Neon-Siege-TD*'],
    }, (details, callback) => {
      if (details.resourceType === 'mainFrame' && details.statusCode >= 400) loadLocal();
      callback({});
    });
  }
  win.webContents.on('did-fail-load', (_e, code, desc, url, isMainFrame) => {
    if (!isMainFrame || errorShown || code === -3) return; // -3: replaced by another loadURL
    if (!LOCAL && !triedLocal) { loadLocal(); return; }
    if (url !== LOCAL_GAME) return; // ignore the remote navigation after the local fallback starts
    errorShown = true;
    win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(
      `<body style="margin:0;font:13px system-ui;background:#fff4dc;color:#16115e;border:1.5px solid #16115e;border-radius:7px;padding:14px;box-sizing:border-box;height:100vh">`
      + `<b>Can't reach the game</b><p>Neon Siege TD loads live from GitHub. Check your internet connection, then reopen the app.</p><small>${desc} (${code})</small></body>`));
  });
  await win.webContents.session.clearCache(); // always fetch the newest game
  loadGame();
  win.on('moved', savePos);
  win.on('closed', () => { win = null; });

  ipcMain.on('fit', (_e, w, h, ax, ay) => fitTo(w, h, ax, ay));
  hotkeyOk = globalShortcut.register(HOTKEY, toggle);
  if (!globalShortcut.register(PAUSE_HOTKEY, () => win && win.webContents.send('pause-toggle'))) console.warn('Pause hotkey unavailable:', PAUSE_HOTKEY);
  if (!hotkeyOk) console.warn('Global hotkey unavailable; use the tray icon:', HOTKEY);

  tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'build', 'icon.png')).resize({ width: 16, height: 16 }));
  tray.setToolTip('Neon Siege TD');
  // Left-click toggles, right-click opens the menu. setContextMenu would ALSO pop the menu on
  // every left-click on macOS (and then double-toggle if its Show/Hide item is used), which is
  // why the menu is shown manually instead.
  buildMenu();
  tray.on('click', toggle);
  tray.on('right-click', () => tray.popUpContextMenu(menu));
  setupShellUpdates();
});

app.on('before-quit', () => { clearTimeout(saveTimer); writePos(); });
app.on('will-quit', () => globalShortcut.unregisterAll());
