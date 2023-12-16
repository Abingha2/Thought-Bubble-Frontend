/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
require("dotenv").config()

import path from 'path';
import { app, BrowserWindow, shell, ipcMain, Notification } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

const userData={token:""}

const thoughts: any[]=[]

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  //require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('/'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      const NOTIFICATION_TITLE = 'Thought bubble is Running!'
      const NOTIFICATION_BODY = 'Welcome to Thought Bubble!'

      new Notification({
      title: NOTIFICATION_TITLE,
      body: NOTIFICATION_BODY
}).show()
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    startChecker()
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

  ipcMain.on('note',async () => {
    console.log("Note Clicked")
    await getThoughts()
  })
  ipcMain.on('login',async(event,details) => {
    const email = details[0]
    const password = details[1]
  try{
  const res = await fetch(`${process.env.SERVER_URL}/login`,{
  method: "POST",
  body: JSON.stringify({email, password}),
  headers: {
    "Content-Type" : "application/json"
  }
})
const results = (await res.json())
userData.token = results.data;
console.log(res.status, userData.token)
}catch(err){
console.log(err)
}
  })

let checkTimer
function startChecker(){
  checkTimer=setInterval(async()=>{
    //TODO:fetch call to backend to get thoughts
  console.log("checking for thoughts")
  if (userData.token !== "") await getThoughts()
  },5*60*1000)
}

async function getThoughts() {
  try{
    const res = await fetch(`${process.env.SERVER_URL}/thought`,{
    method: "POST",
    headers: {
      "Content-Type" : "application/json",
      "x-access-token": userData.token
    }
  })
  const newThoughts: Array<any> = (await res.json()).data
  thoughts.push(...(newThoughts.filter((thought) => {
    const exists = thoughts.find((search) => search.id === thought.id)
    console.log("Does the thought exist? It will appear here ---> ", exists)
    return exists ? false : thought;
  })))
  console.log(res.status, thoughts)
  for(const thought of thoughts){
    if(!thought.viewed){
      await showThought(thought.id);
    }
  }
  }catch(err){
  console.log(err)
  }
}

async function showThought(id:number){
  const child = new BrowserWindow({
    width: 1024,
    height: 728,
    transparent: false,
    frame: false,
      webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });
  try{
    const res = await fetch(`${process.env.SERVER_URL}/thought/viewed`,{
    method: "POST",
    headers: {
      "Content-Type" : "application/json",
      "x-access-token": userData.token
    },
    body: JSON.stringify({id:id})
  })
  const {result, data} = await res.json()
  if(res.status === 200 && result === "ok"){
    console.log("View status update successful.")
  }
  }catch(err){
  console.log(err)
  }
  child.loadURL(resolveHtmlPath(`/thought/${id}`))
}


ipcMain.on('thought',async (window, id) => {
  console.log("Loading thought", id, typeof id)
  const found = thoughts.find((thought) => thought.id === parseInt(id))
  console.log(found)
  window.reply("thought",found)
})

ipcMain.on('update',async(event,details) => {
  const {id, title, body} = details
try{
const res = await fetch(`${process.env.SERVER_URL}/thought/edit`,{
method: "POST",
body: JSON.stringify({id:id, title:title, body:body}),
headers: {
  "Content-Type" : "application/json",
  "x-access-token": userData.token
}
})
const results = (await res.json())
if(results.result === "ok"){
  const index = thoughts.findIndex((thought) => thought.id === parseInt(id))
  console.log(thoughts[index])
  thoughts[index].title = title
  thoughts[index].body = body
  event.reply('update-done',true)
}
console.log(res.status, results)
}catch(err){
console.log(err)
}
})