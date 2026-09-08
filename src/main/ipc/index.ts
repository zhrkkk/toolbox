import { BrowserWindow } from 'electron'

import setupIpcFile from './file'
import setupIpcCommon from './common'
export default function setupIpc(win: BrowserWindow) {
  setupIpcFile(win)
  setupIpcCommon(win)
}
