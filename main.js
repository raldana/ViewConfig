const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

// Module ipc for inter-process communication
const ipcMain = require('electron').ipcMain;

// javascript files
var jsconn = require('./js/connfuncs.js');
//var jsbatch = require('./js/batchfuncs.js');
//var jsinvoice = require('./js/invoicefuncs.js');
//var jsorder = require('./js/orderfuncs.js');
//var jsfs = require('./js/fsfuncs.js');
var jsindex = require('./js/index.js');


// global shared object
global.sharedObj = {
    tempFile: null,
    platformOS: null,
    sessionKey: 0,
    sqlConfig: null,
    sqlAuthType: null,
    okToShutdown: false,
    isLoggedin: false
  };

// get process platform
const platformOS = process.platform;
const osVersion = require('os').release();
const envVersion = process.version;
console.log('startup: ' + Date.now());
console.log('OS:' + platformOS + ', version: ' + osVersion);
console.log('NodeJS version: ' + envVersion);
console.log('------------------------------' + '\n');
global.sharedObj.platformOS = platformOS;

//*********************************************************************

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createLoginWindow () {
  loginWindow = new BrowserWindow(
    { parent: mainWindow,
      modal: true,
      width: 400, 
      height: 450
    }
  )
  
  loginWindow.setMenu(null);
  loginWindow.loadURL(`file://${__dirname}/login.html`);

  // Emitted when the window is closed.
  loginWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    //populateDBSelector();
    loginWindow = null
  })
}

// populate the main form's database dropdown
function populateDBSelector () {
  mainWindow.webContents.send("populateDBSelector");
}

function createMainWindow () {
  mainWindow = new BrowserWindow(
    { width: 1024, 
      height: 768
    }
  )
  
  mainWindow.loadURL(`file://${__dirname}/index.html`)

    // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
  createMainWindow();
  if (global.sharedObj.isLoggedin == false) {
     createLoginWindow();
  };
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createMainWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// test sql connection
ipcMain.on('testConn', function(event, config) {
  jsconn.testConn(config, event);   // js/connfuncs.js
  // jsconn.testConnV8(config, event);   // js/connfuncs.js
});

// debug console function for use by renderer processes
ipcMain.on('consoleLog', function(event, msg) {
  console.log(msg);
});

// close login window (when logged in successfully)
ipcMain.on('closeLogin', function() {
  loginWindow.close();
  populateDBSelector();
})

/*
// populate the main form's database dropdown
ipcMain.on('populateDBSelector', function() {
  console.log("calling indexhtml.populateDBSelector..." + "\n");
  mainWindow.webContents.send("populateDBSelector");
  //jsindex.populateDBSelector();
})
*/