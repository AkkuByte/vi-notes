import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  // Tell Node.js to open the Google login window
  loginWithGoogle: () => ipcRenderer.invoke('auth:google-login'),
  
  // Listen for the successful login data coming back from Node.js
  onAuthSuccess: (callback: (data: any) => void) => {
    ipcRenderer.on('auth:success', (_event, data) => callback(data))
  }
}

contextBridge.exposeInMainWorld('api', api)