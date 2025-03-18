const { app, BrowserWindow, Tray, Menu, clipboard, globalShortcut, ipcMain, nativeImage, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Initialize the store for persistent storage
const store = new Store({
  defaults: {
    clipboardHistory: [],
    maxHistorySize: 50
  }
});

// Global references
let mainWindow = null;
let tray = null;
let clipboardHistory = store.get('clipboardHistory', []);
let isQuitting = false;
let clipboardWatcher = null;
let lastClipboardContent = '';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    show: false,
    frame: false,
    resizable: false,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('blur', () => {
    if (mainWindow) {
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '../assets/trayIconTemplate.png');
  tray = new Tray(nativeImage.createFromPath(iconPath));
  tray.setToolTip('Clippy - Clipboard Manager');

  tray.on('click', (event, bounds) => {
    toggleWindow(bounds);
  });

  tray.on('right-click', () => {
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open Clippy', click: () => toggleWindow() },
      { type: 'separator' },
      { label: 'Clear History', click: clearHistory },
      { type: 'separator' },
      { label: 'Quit', click: () => { isQuitting = true; app.quit(); } }
    ]);
    if (tray) {
      tray.popUpContextMenu(contextMenu);
    }
  });
}

function toggleWindow(bounds) {
  if (!mainWindow) return;

  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    if (bounds) {
      // Position window near the tray icon
      const { x, y } = bounds;
      const { width, height } = mainWindow.getBounds();
      mainWindow.setBounds({
        x: Math.round(x - width / 2),
        y: Math.round(y),
        width,
        height
      });
    }
    mainWindow.show();
    mainWindow.focus();
  }
}

function startClipboardWatcher() {
  // Check clipboard every second
  lastClipboardContent = clipboard.readText();
  
  clipboardWatcher = setInterval(() => {
    const text = clipboard.readText();
    
    // Only add to history if it's not empty and different from the last one
    if (text && text !== lastClipboardContent) {
      addToClipboardHistory(text);
      lastClipboardContent = text;
    }
  }, 1000);
}

function addToClipboardHistory(text) {
  // Don't add duplicates
  const existingIndex = clipboardHistory.findIndex(item => item.text === text);
  if (existingIndex !== -1) {
    // Move to top if it exists
    const item = clipboardHistory.splice(existingIndex, 1)[0];
    item.timestamp = Date.now();
    clipboardHistory.unshift(item);
  } else {
    // Add new item
    const newItem = {
      id: Date.now().toString(),
      text,
      timestamp: Date.now()
    };
    clipboardHistory.unshift(newItem);
  }

  // Limit history size
  const maxSize = store.get('maxHistorySize');
  if (clipboardHistory.length > maxSize) {
    clipboardHistory = clipboardHistory.slice(0, maxSize);
  }

  // Save to store
  store.set('clipboardHistory', clipboardHistory);

  // Update renderer if window exists
  if (mainWindow) {
    mainWindow.webContents.send('clipboard-history-updated', clipboardHistory);
  }
}

function clearHistory() {
  clipboardHistory = [];
  store.set('clipboardHistory', clipboardHistory);
  if (mainWindow) {
    mainWindow.webContents.send('clipboard-history-updated', clipboardHistory);
  }
}

app.on('ready', () => {
  createWindow();
  createTray();
  startClipboardWatcher();

  // Register global shortcut to show/hide the app
  globalShortcut.register('CommandOrControl+Shift+V', () => {
    toggleWindow();
  });

  // Load clipboard history from store
  clipboardHistory = store.get('clipboardHistory', []);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
  
  // Clear clipboard watcher
  if (clipboardWatcher) {
    clearInterval(clipboardWatcher);
    clipboardWatcher = null;
  }
  
  // Clean up tray
  if (tray) {
    tray.destroy();
    tray = null;
  }
});

// IPC handlers
ipcMain.on('get-clipboard-history', (event) => {
  event.reply('clipboard-history-updated', clipboardHistory);
});

ipcMain.on('paste-item', (event, text) => {
  clipboard.writeText(text);
  // Simulate Cmd+V keystroke to paste the content
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.on('delete-item', (event, id) => {
  clipboardHistory = clipboardHistory.filter(item => item.id !== id);
  store.set('clipboardHistory', clipboardHistory);
  event.reply('clipboard-history-updated', clipboardHistory);
});

ipcMain.on('clear-history', () => {
  clearHistory();
}); 