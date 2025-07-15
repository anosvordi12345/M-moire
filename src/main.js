import './style.css'
import { QRCodeApp } from './components/QRCodeApp.js'

document.querySelector('#app').innerHTML = `
  <div id="qr-app"></div>
`

// Initialize the QR Code App
const qrApp = new QRCodeApp()
window.qrApp = qrApp
qrApp.init()