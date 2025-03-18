const { app, BrowserWindow, Tray, Menu, clipboard, globalShortcut, ipcMain, nativeImage, shell, screen } = require('electron');
const path = require('path');
const Store = require('electron-store');
const Positioner = require('electron-positioner');

// Initialize the store for persistent storage
const store = new Store({
  defaults: {
    clipboardHistory: [],
    maxHistorySize: 50,
    firstRun: true
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
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    type: 'panel',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Set the window type to a pop-up menu/tooltip on macOS for better overlay behavior
  if (process.platform === 'darwin') {
    mainWindow.setWindowButtonVisibility(false);
    
    // Hide from dock for true overlay behavior
    app.dock.hide();
    
    // Set the activation policy to make it a pure background app
    app.setActivationPolicy('accessory');
  }

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('blur', () => {
    if (mainWindow && !isQuitting) {
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
      { label: 'Keyboard Shortcuts', click: () => {
        if (mainWindow) {
          toggleWindow();
          mainWindow.webContents.send('show-help-overlay');
        }
      }},
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
    // Position window near the cursor or tray icon
    const cursorPoint = screen.getCursorScreenPoint();
    const currentDisplay = screen.getDisplayNearestPoint(cursorPoint);
    const { width, height } = mainWindow.getBounds();
    
    // Calculate position to ensure the window stays within screen bounds
    let x, y;
    
    if (bounds) {
      // Positioning from tray click
      x = Math.round(bounds.x - width / 2);
      y = Math.round(bounds.y);
    } else {
      // Positioning from keyboard shortcut - appear below the cursor
      x = Math.round(cursorPoint.x - width / 2);
      y = Math.round(cursorPoint.y + 20);
    }
    
    // Ensure window is within screen bounds
    if (x + width > currentDisplay.bounds.width + currentDisplay.bounds.x) {
      x = currentDisplay.bounds.width + currentDisplay.bounds.x - width - 10;
    }
    if (x < currentDisplay.bounds.x) {
      x = currentDisplay.bounds.x + 10;
    }
    if (y + height > currentDisplay.bounds.height + currentDisplay.bounds.y) {
      y = currentDisplay.bounds.height + currentDisplay.bounds.y - height - 10;
    }
    
    mainWindow.setPosition(x, y);
    
    // Critical for macOS: set window properties in the correct order
    if (process.platform === 'darwin') {
      // 1. Reset any previous settings
      mainWindow.setAlwaysOnTop(false);
      
      // 2. Set the window to be visible on all workspaces, INCLUDING fullscreen apps
      mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      
      // 3. Set always on top with the highest possible level
      mainWindow.setAlwaysOnTop(true, 'pop-up-menu', 1);
      
      // 4. Ensure we're on the current Space by re-setting these properties
      mainWindow.setMovable(false);
      setTimeout(() => {
        mainWindow.setMovable(true);
      }, 100);
    } else {
      // For non-macOS platforms
      mainWindow.setAlwaysOnTop(true, 'floating', 1);
    }
    
    // First show the window
    mainWindow.show();
    
    // Then immediately focus it for keyboard interaction
    mainWindow.focus();
    
    // Send message to renderer to focus the search input - crucial for keyboard navigation
    mainWindow.webContents.send('focus-search');
    
    // Log that we're showing the window to help with debugging
    console.log('Showing Clippy window at position:', { x, y, display: currentDisplay.id });
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

// Register global shortcuts
function registerShortcuts() {
  // Unregister any existing shortcuts
  globalShortcut.unregisterAll();
  
  // Array of shortcuts to try
  const shortcuts = [
    { key: 'Command+Shift+V', name: 'macOS primary' },
    { key: 'CommandOrControl+Shift+V', name: 'cross-platform' },
    { key: 'Alt+Space', name: 'alternative' },
    { key: 'Option+Space', name: 'macOS space' },
    { key: 'Option+V', name: 'macOS alternative' }
  ];
  
  let successCount = 0;
  
  shortcuts.forEach(shortcut => {
    try {
      const registered = globalShortcut.register(shortcut.key, () => {
        console.log(`Shortcut triggered: ${shortcut.key} (${shortcut.name})`);
        
        // Recreate the window if it was closed
        if (!mainWindow) {
          createWindow();
          
          // Allow window to initialize before showing
          setTimeout(() => {
            toggleWindow();
          }, 100);
          return;
        }
        
        // Simple toggle
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          // For macOS, we need special handling
          if (process.platform === 'darwin') {
            // First ensure we have the right window settings
            mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
            mainWindow.setAlwaysOnTop(true, 'pop-up-menu', 1);
            
            // Position window in center of current cursor
            const cursorPoint = screen.getCursorScreenPoint();
            const currentDisplay = screen.getDisplayNearestPoint(cursorPoint);
            const { width, height } = mainWindow.getBounds();
            
            let x = Math.round(cursorPoint.x - width / 2);
            let y = Math.round(cursorPoint.y + 20);
            
            // Ensure it's on screen
            if (x + width > currentDisplay.bounds.width + currentDisplay.bounds.x) {
              x = currentDisplay.bounds.width + currentDisplay.bounds.x - width - 10;
            }
            if (x < currentDisplay.bounds.x) {
              x = currentDisplay.bounds.x + 10;
            }
            if (y + height > currentDisplay.bounds.height + currentDisplay.bounds.y) {
              y = currentDisplay.bounds.height + currentDisplay.bounds.y - height - 10;
            }
            
            // Set position
            mainWindow.setPosition(x, y);
            
            // Show and focus - critical change for keyboard interaction
            mainWindow.show();
            mainWindow.focus();
            
            // Re-assert window settings after display
            setTimeout(() => {
              if (mainWindow) {
                mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
                mainWindow.setAlwaysOnTop(true, 'pop-up-menu', 1);
                mainWindow.focus(); // Re-focus to ensure keyboard interaction works
              }
            }, 50);
            
            // Focus the search input
            mainWindow.webContents.send('focus-search');
            
            console.log(`Shortcut window shown at ${x},${y} on display ${currentDisplay.id}`);
          } else {
            // Non-macOS platforms use simple toggle
            toggleWindow();
          }
        }
      });
      
      if (registered) {
        console.log(`Successfully registered ${shortcut.key} (${shortcut.name})`);
        successCount++;
      } else {
        console.error(`Failed to register ${shortcut.key} (${shortcut.name})`);
      }
    } catch (e) {
      console.error(`Error registering ${shortcut.key} (${shortcut.name}):`, e);
    }
  });
  
  console.log(`Registered ${successCount} of ${shortcuts.length} shortcuts`);
}

app.on('ready', () => {
  // Add a short delay to ensure everything initializes properly
  setTimeout(() => {
    createWindow();
    createTray();
    startClipboardWatcher();
    
    // Register shortcuts after a short delay to ensure app is ready
    setTimeout(() => {
      registerShortcuts();
    }, 500);

    // Load clipboard history from store
    clipboardHistory = store.get('clipboardHistory', []);
    
    // Create a menu with keyboard shortcuts
    if (process.platform === 'darwin') {
      const { Menu } = require('electron');
      const template = [
        {
          label: 'Clippy',
          submenu: [
            {
              label: 'Toggle Clippy',
              accelerator: 'Command+Shift+V',
              click: () => {
                if (mainWindow && mainWindow.isVisible()) {
                  mainWindow.hide();
                } else {
                  toggleWindow();
                }
              }
            },
            {
              label: 'Clear History',
              accelerator: 'Command+Shift+C',
              click: () => clearHistory()
            },
            { type: 'separator' },
            {
              label: 'Quit',
              accelerator: 'Command+Q',
              click: () => {
                isQuitting = true;
                app.quit();
              }
            }
          ]
        }
      ];
      
      const menu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(menu);
    }
    
    // Show a welcome notification on first run
    const isFirstRun = store.get('firstRun', true);
    if (isFirstRun) {
      // Display the initial window and help overlay
      setTimeout(() => {
        toggleWindow();
        if (mainWindow) {
          mainWindow.webContents.send('show-help-overlay');
        }
      }, 1000);
      
      // Show notification
      try {
        const { Notification } = require('electron');
        if (Notification.isSupported()) {
          const notification = new Notification({
            title: 'Clippy Is Running',
            body: 'Press Command+Shift+V or click the tray icon to open Clippy from any window.',
            silent: false
          });
          
          notification.show();
          
          notification.on('click', () => {
            toggleWindow();
          });
        }
      } catch (e) {
        console.error('Error showing notification:', e);
      }
      
      // Mark as no longer first run
      store.set('firstRun', false);
    }
  }, 100);
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
  
  // After sending the history, ensure the window has focus and relay that to the renderer
  if (mainWindow) {
    mainWindow.focus();
    setTimeout(() => {
      mainWindow.webContents.send('focus-search');
    }, 100); // Short delay to ensure the DOM is ready
  }
});

ipcMain.on('paste-item', (event, text) => {
  clipboard.writeText(text);
  // Hide the window
  if (mainWindow) {
    mainWindow.hide();
  }
  
  // Give audible feedback
  try {
    shell.beep();
  } catch (e) {
    console.error('Error with audio feedback:', e);
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

// Handler for hiding the window (escape key)
ipcMain.on('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

// Automatically focus search input when window is shown
app.on('browser-window-focus', () => {
  if (mainWindow) {
    mainWindow.webContents.send('focus-search');
  }
}); 