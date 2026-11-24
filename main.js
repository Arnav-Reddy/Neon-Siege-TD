// Desktop overlay shell: a transparent, frameless, always-on-top window that floats above other
// apps (including full-screen ones). The page drags it via native drag regions and sizes it to the widget.
const { app, BrowserWindow, screen, ipcMain, globalShortcut, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

const WIDTH = 440, HEIGHT = 344, MARGIN = 16, HOTKEY = 'CommandOrControl+Shift+T';
// The game is loaded live from GitHub Pages, so every push to main reaches the installed app
// on its next launch without a new download. Only changes to this shell need a new release.
const GAME_URL = 'https://arnav-reddy.github.io/Tower-Defense-Mini-Game-/';
let win, tray;

if (!app.requestSingleInstanceLock()) app.quit();

const posFile = () => path.join(app.getPath('userData'), 'window.json');
const savePos = () => fs.writeFileSync(posFile(), JSON.stringify(win.getPosition()));

function toggle(){
  if (win.isVisible()) win.hide();
  else { win.showInactive(); win.setAlwaysOnTop(true, 'screen-saver'); }
}

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
  const [x, y] = fs.existsSync(posFile())
    ? JSON.parse(fs.readFileSync(posFile(), 'utf8'))
    : [wa.x + wa.width - WIDTH - MARGIN, wa.y + wa.height - HEIGHT - MARGIN];
  win = new BrowserWindow({
    ...keepOnScreen({ x, y, width: WIDTH, height: HEIGHT }),
    frame: false, transparent: true, resizable: false, maximizable: false, fullscreenable: false,
    skipTaskbar: true, hasShadow: false, alwaysOnTop: true, backgroundColor: '#00000000',
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.webContents.on('did-fail-load', (_e, code, desc, url, isMainFrame) => {
    if (!isMainFrame) return;
    win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(
      `<body style="margin:0;font:13px system-ui;background:#fff4dc;color:#16115e;border:1.5px solid #16115e;border-radius:7px;padding:14px;box-sizing:border-box;height:100vh">`
      + `<b>Can't reach the game</b><p>Neon Siege TD loads live from GitHub. Check your internet connection, then reopen the app.</p><small>${desc} (${code})</small></body>`));
  });
  await win.webContents.session.clearCache(); // always fetch the newest game
  win.loadURL(GAME_URL);
  win.on('moved', savePos);

  ipcMain.on('fit', (_e, w, h, ax, ay) => fitTo(Math.ceil(w), Math.ceil(h), ax, ay));
  globalShortcut.register(HOTKEY, toggle);

  tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'build', 'icon.png')).resize({ width: 16, height: 16 }));
  tray.setToolTip('Neon Siege TD');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show / Hide (Ctrl/Cmd+Shift+T)', click: toggle },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]));
  tray.on('click', toggle);
});

app.on('will-quit', () => globalShortcut.unregisterAll());
