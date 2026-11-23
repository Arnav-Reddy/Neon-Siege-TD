// Desktop overlay shell: a transparent, frameless, always-on-top window that
// sits in the bottom-right corner above other apps, including full-screen ones.
const { app, BrowserWindow, screen, ipcMain, globalShortcut, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

const WIDTH = 400, HEIGHT = 340, MARGIN = 16, HOTKEY = 'CommandOrControl+Shift+T';
let win, tray;

if (!app.requestSingleInstanceLock()) app.quit();

function toggle(){
  if (win.isVisible()) win.hide();
  else { win.showInactive(); win.setAlwaysOnTop(true, 'screen-saver'); }
}

// The widget reports its size (full card or minimized pill); grow/shrink the
// window around its bottom-right corner so it stays anchored where it is.
function fitTo(w, h){
  const b = win.getBounds();
  win.setBounds({ x: b.x + b.width - w, y: b.y + b.height - h, width: w, height: h });
}

app.whenReady().then(() => {
  if (process.platform === 'darwin') app.dock.hide(); // agent app: required to float over macOS full-screen Spaces
  const wa = screen.getPrimaryDisplay().workArea;
  win = new BrowserWindow({
    width: WIDTH, height: HEIGHT,
    x: wa.x + wa.width - WIDTH - MARGIN, y: wa.y + wa.height - HEIGHT - MARGIN,
    frame: false, transparent: true, resizable: false, maximizable: false, fullscreenable: false,
    skipTaskbar: true, hasShadow: false, alwaysOnTop: true, backgroundColor: '#00000000',
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadFile(path.join(__dirname, 'index.html'));

  ipcMain.on('fit', (_e, w, h) => fitTo(Math.ceil(w), Math.ceil(h)));
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
