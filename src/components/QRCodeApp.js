import { QRGenerator } from './QRGenerator.js'
import { QRScanner } from './QRScanner.js'
import { HistoryManager } from './HistoryManager.js'
import { AlertManager } from './AlertManager.js'

export class QRCodeApp {
  constructor() {
    this.currentTab = 'generator'
    this.generator = new QRGenerator()
    this.scanner = new QRScanner()
    this.historyManager = new HistoryManager()
    this.alertManager = new AlertManager()
  }

  init() {
    try {
      this.render()
      this.bindEvents()
      this.initializeComponents()
    } catch (error) {
      console.error('Error initializing QR Code App:', error)
    }
  }

  initializeComponents() {
    this.generator.init()
    this.scanner.init()
    this.historyManager.init()
    this.alertManager.init()
    
    // Setup event delegation for history
    this.historyManager.setupEventDelegation()
  }

  render() {
    const app = document.getElementById('qr-app')
    if (!app) {
      console.error('QR app container not found')
      return
    }

    app.innerHTML = `
      <div class="qr-app">
        <header class="app-header">
          <h1>🎯 QR Code Studio</h1>
          <p>Generate, Scan, and Manage QR Codes with Ease</p>
        </header>
        
        <nav class="tab-navigation">
          <button class="tab-button active" data-tab="generator">
            📝 Generate QR
          </button>
          <button class="tab-button" data-tab="scanner">
            📷 Scan QR
          </button>
          <button class="tab-button" data-tab="history">
            📚 History
          </button>
        </nav>
        
        <main class="tab-content">
          ${this.renderGeneratorTab()}
          ${this.renderScannerTab()}
          ${this.renderHistoryTab()}
        </main>
      </div>
    `
  }

  renderGeneratorTab() {
    return `
      <div class="tab-panel active" id="generator-panel">
        <form class="generator-form" id="qr-form">
          <div class="form-group">
            <label for="qr-type">QR Code Type</label>
            <select id="qr-type" name="type">
              <option value="text">📝 Text</option>
              <option value="url">🔗 URL</option>
              <option value="email">📧 Email</option>
              <option value="phone">📞 Phone</option>
              <option value="wifi">📶 WiFi</option>
            </select>
          </div>
          
          <div id="dynamic-fields">
            ${this.renderTextFields()}
          </div>
          
          <button type="submit" class="btn btn-primary">
            ✨ Generate QR Code
          </button>
        </form>
        
        <div class="qr-preview" id="qr-preview" style="display: none;">
          <div class="qr-code-container">
            <canvas id="qr-canvas"></canvas>
          </div>
          <button class="btn btn-secondary" id="download-btn">
            💾 Download QR Code
          </button>
        </div>
      </div>
    `
  }

  renderScannerTab() {
    return `
      <div class="tab-panel" id="scanner-panel">
        <div class="scanner-container">
          <div class="camera-section">
            <h3>📷 Camera Scanner</h3>
            <video id="camera-preview" playsinline></video>
            <div class="flex gap-2 justify-center">
              <button class="btn btn-primary" id="start-camera">
                🎥 Start Camera
              </button>
              <button class="btn btn-danger hidden" id="stop-camera">
                ⏹️ Stop Camera
              </button>
            </div>
          </div>
          
          <div class="upload-section">
            <h3>📁 Upload File</h3>
            <div class="upload-area" id="upload-area">
              <div class="upload-icon">📎</div>
              <p>Drag & drop your image/video here or click to browse</p>
              <p class="mt-1" style="font-size: 0.875rem; color: var(--text-secondary);">
                Supports: JPG, PNG, GIF, MP4, MOV, AVI (Max 10MB)
              </p>
            </div>
            <input type="file" id="file-input" accept="image/*,video/*" style="display: none;">
          </div>
        </div>
        
        <div class="scan-result" id="scan-result">
          <h4>✅ QR Code Detected!</h4>
          <p id="scan-content"></p>
          <button class="btn btn-secondary btn-small" id="copy-result">
            📋 Copy Result
          </button>
        </div>
      </div>
    `
  }

  renderHistoryTab() {
    return `
      <div class="tab-panel" id="history-panel">
        <div class="history-header">
          <h3>📚 QR Code History</h3>
          <button class="btn btn-danger btn-small" id="clear-history">
            🗑️ Clear All
          </button>
        </div>
        <div class="history-list" id="history-list">
          <!-- History items will be rendered here -->
        </div>
      </div>
    `
  }

  renderTextFields() {
    return `
      <div class="form-group">
        <label for="qr-content">Content</label>
        <textarea id="qr-content" name="content" placeholder="Enter your text here..." required></textarea>
      </div>
    `
  }

  bindEvents() {
    // Tab navigation
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab)
      })
    })

    // Handle page visibility change to cleanup camera
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.scanner) {
        this.scanner.cleanup()
      }
    })

    // Handle beforeunload to cleanup resources
    window.addEventListener('beforeunload', () => {
      this.cleanup()
    })
  }

  switchTab(tabName) {
    try {
      // Update active tab button
      document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active')
      })
      const activeBtn = document.querySelector(`[data-tab="${tabName}"]`)
      if (activeBtn) {
        activeBtn.classList.add('active')
      }

      // Update active panel
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active')
      })
      const activePanel = document.getElementById(`${tabName}-panel`)
      if (activePanel) {
        activePanel.classList.add('active')
      }

      this.currentTab = tabName

      // Cleanup camera when switching away from scanner
      if (tabName !== 'scanner' && this.scanner) {
        this.scanner.cleanup()
      }

      // Render history when switching to history tab
      if (tabName === 'history' && this.historyManager) {
        this.historyManager.renderHistory()
      }
    } catch (error) {
      console.error('Error switching tab:', error)
    }
  }

  cleanup() {
    try {
      if (this.scanner) {
        this.scanner.destroy()
      }
      if (this.alertManager) {
        this.alertManager.clearAllAlerts()
      }
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  }
}