/**
 * electron 的主进程
 */
// 导入模块
import { app, BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url' // 导入 Node.js 的 url 模块中的 fileURLToPath

// 在 ES Module 中，__dirname 和 __filename 不再直接可用。
// 需要通过 import.meta.url 和 path 模块来构造。
const __filename = fileURLToPath(import.meta.url) // 获取当前文件的完整路径 (file://...)
const __dirname = path.dirname(__filename) // 从文件路径中获取目录名
// 创建主窗口
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  })
  // 加载当前vue 的地址
  // win.loadURL('http://localhost:5173')
  win.loadFile(path.resolve(__dirname, 'pages/index.html'))
}

// 应用准备就绪，加载窗口
app.whenReady().then(() => {
  createWindow()

  // mac 上默认保留一个窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  console.log('--- app ready ---')
})

// 关闭所有窗口 ： 程序退出 ： windows & linux
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
