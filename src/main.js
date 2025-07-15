import './style.css'
import { QRCodeApp } from './components/QRCodeApp.js'

// Show loading initially
document.querySelector('#app').innerHTML = `
  <div id="qr-app">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading QR Code Studio...</p>
    </div>
  </div>
`

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    const app = new QRCodeApp()
    app.init()
  } catch (error) {
    console.error('Error initializing QR Code App:', error)
    document.querySelector('#app').innerHTML = `
      <div class="error-boundary">
        <h2>⚠️ Application Error</h2>
        <p>Failed to load QR Code Studio. Please refresh the page.</p>
        <button onclick="window.location.reload()" class="btn btn-primary">
          🔄 Refresh Page
        </button>
      </div>
    `
  }
})

// Initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
  // DOM is still loading, wait for DOMContentLoaded
} else {
  // DOM is already loaded
  try {
    const app = new QRCodeApp()
    app.init()
  } catch (error) {
    console.error('Error initializing QR Code App:', error)
    document.querySelector('#app').innerHTML = `
      <div class="error-boundary">
        <h2>⚠️ Application Error</h2>
        <p>Failed to load QR Code Studio. Please refresh the page.</p>
        <button onclick="window.location.reload()" class="btn btn-primary">
          🔄 Refresh Page
        </button>
      </div>
    `
  }
}