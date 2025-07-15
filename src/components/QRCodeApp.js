import QRCode from 'qrcode'
import QrScanner from 'qr-scanner'

export class QRCodeApp {
  constructor() {
    this.currentTab = 'generator'
    this.scanner = null
    this.history = this.loadHistory()
    this.isScanning = false
  }

  init() {
    this.render()
    this.bindEvents()
    this.renderHistory()
  }

  render() {
    const app = document.getElementById('qr-app')
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
                Supports: JPG, PNG, GIF, MP4, MOV, AVI
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

  renderUrlFields() {
    return `
      <div class="form-group">
        <label for="qr-url">Website URL</label>
        <input type="url" id="qr-url" name="url" placeholder="https://example.com" required>
      </div>
    `
  }

  renderEmailFields() {
    return `
      <div class="form-group">
        <label for="qr-email">Email Address</label>
        <input type="email" id="qr-email" name="email" placeholder="example@email.com" required>
      </div>
      <div class="form-group">
        <label for="qr-subject">Subject (Optional)</label>
        <input type="text" id="qr-subject" name="subject" placeholder="Email subject">
      </div>
      <div class="form-group">
        <label for="qr-body">Message (Optional)</label>
        <textarea id="qr-body" name="body" placeholder="Email message"></textarea>
      </div>
    `
  }

  renderPhoneFields() {
    return `
      <div class="form-group">
        <label for="qr-phone">Phone Number</label>
        <input type="tel" id="qr-phone" name="phone" placeholder="+1234567890" required>
      </div>
    `
  }

  renderWifiFields() {
    return `
      <div class="form-group">
        <label for="qr-ssid">Network Name (SSID)</label>
        <input type="text" id="qr-ssid" name="ssid" placeholder="WiFi Network Name" required>
      </div>
      <div class="form-group">
        <label for="qr-password">Password</label>
        <input type="password" id="qr-password" name="password" placeholder="WiFi Password">
      </div>
      <div class="form-group">
        <label for="qr-security">Security Type</label>
        <select id="qr-security" name="security">
          <option value="WPA">WPA/WPA2</option>
          <option value="WEP">WEP</option>
          <option value="nopass">No Password</option>
        </select>
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

    // QR Type change
    document.getElementById('qr-type').addEventListener('change', (e) => {
      this.updateFormFields(e.target.value)
    })

    // QR Form submission
    document.getElementById('qr-form').addEventListener('submit', (e) => {
      e.preventDefault()
      this.generateQR()
    })

    // Download button
    document.getElementById('download-btn').addEventListener('click', () => {
      this.downloadQR()
    })

    // Camera controls
    document.getElementById('start-camera').addEventListener('click', () => {
      this.startCamera()
    })

    document.getElementById('stop-camera').addEventListener('click', () => {
      this.stopCamera()
    })

    // File upload
    const uploadArea = document.getElementById('upload-area')
    const fileInput = document.getElementById('file-input')

    uploadArea.addEventListener('click', () => fileInput.click())
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault()
      uploadArea.classList.add('dragover')
    })
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover')
    })
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault()
      uploadArea.classList.remove('dragover')
      const files = e.dataTransfer.files
      if (files.length > 0) {
        this.processFile(files[0])
      }
    })

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.processFile(e.target.files[0])
      }
    })

    // Copy result
    document.getElementById('copy-result').addEventListener('click', () => {
      this.copyToClipboard()
    })

    // Clear history
    document.getElementById('clear-history').addEventListener('click', () => {
      this.clearHistory()
    })
  }

  switchTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active')
    })
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active')

    // Update active panel
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active')
    })
    document.getElementById(`${tabName}-panel`).classList.add('active')

    this.currentTab = tabName

    // Render history when switching to history tab
    if (tabName === 'history') {
      this.renderHistory()
    }
  }

  updateFormFields(type) {
    const dynamicFields = document.getElementById('dynamic-fields')
    
    switch(type) {
      case 'text':
        dynamicFields.innerHTML = this.renderTextFields()
        break
      case 'url':
        dynamicFields.innerHTML = this.renderUrlFields()
        break
      case 'email':
        dynamicFields.innerHTML = this.renderEmailFields()
        break
      case 'phone':
        dynamicFields.innerHTML = this.renderPhoneFields()
        break
      case 'wifi':
        dynamicFields.innerHTML = this.renderWifiFields()
        break
    }
  }

  async generateQR() {
    const formData = new FormData(document.getElementById('qr-form'))
    const type = formData.get('type')
    let content = ''

    try {
      switch(type) {
        case 'text':
          content = formData.get('content')
          break
        case 'url':
          content = formData.get('url')
          break
        case 'email':
          const email = formData.get('email')
          const subject = formData.get('subject') || ''
          const body = formData.get('body') || ''
          content = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
          break
        case 'phone':
          content = `tel:${formData.get('phone')}`
          break
        case 'wifi':
          const ssid = formData.get('ssid')
          const password = formData.get('password') || ''
          const security = formData.get('security')
          content = `WIFI:T:${security};S:${ssid};P:${password};;`
          break
      }

      if (!content.trim()) {
        this.showAlert('Please fill in all required fields', 'error')
        return
      }

      const canvas = document.getElementById('qr-canvas')
      await QRCode.toCanvas(canvas, content, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      document.getElementById('qr-preview').style.display = 'block'
      
      // Save to history
      this.saveToHistory({
        type: 'generated',
        contentType: type,
        content: content,
        timestamp: new Date().toISOString()
      })

      this.showAlert('QR Code generated successfully!', 'success')
    } catch (error) {
      console.error('Error generating QR code:', error)
      this.showAlert('Error generating QR code', 'error')
    }
  }

  downloadQR() {
    const canvas = document.getElementById('qr-canvas')
    const link = document.createElement('a')
    link.download = `qr-code-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
    this.showAlert('QR Code downloaded!', 'success')
  }

  async startCamera() {
    try {
      const video = document.getElementById('camera-preview')
      video.style.display = 'block'
      
      this.scanner = new QrScanner(video, (result) => {
        this.handleScanResult(result.data)
      }, {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      })

      await this.scanner.start()
      this.isScanning = true
      
      document.getElementById('start-camera').classList.add('hidden')
      document.getElementById('stop-camera').classList.remove('hidden')
      
      this.showAlert('Camera started successfully!', 'success')
    } catch (error) {
      console.error('Error starting camera:', error)
      this.showAlert('Error accessing camera. Please check permissions.', 'error')
    }
  }

  stopCamera() {
    if (this.scanner) {
      this.scanner.stop()
      this.scanner.destroy()
      this.scanner = null
    }
    
    const video = document.getElementById('camera-preview')
    video.style.display = 'none'
    this.isScanning = false
    
    document.getElementById('start-camera').classList.remove('hidden')
    document.getElementById('stop-camera').classList.add('hidden')
    
    this.showAlert('Camera stopped', 'success')
  }

  async processFile(file) {
    try {
      const result = await QrScanner.scanImage(file)
      this.handleScanResult(result)
    } catch (error) {
      console.error('Error scanning file:', error)
      this.showAlert('No QR code found in the uploaded file', 'error')
    }
  }

  handleScanResult(content) {
    document.getElementById('scan-content').textContent = content
    document.getElementById('scan-result').classList.add('show')
    
    // Save to history
    this.saveToHistory({
      type: 'scanned',
      content: content,
      timestamp: new Date().toISOString()
    })

    this.showAlert('QR Code scanned successfully!', 'success')
  }

  copyToClipboard() {
    const content = document.getElementById('scan-content').textContent
    navigator.clipboard.writeText(content).then(() => {
      this.showAlert('Content copied to clipboard!', 'success')
    }).catch(() => {
      this.showAlert('Failed to copy content', 'error')
    })
  }

  saveToHistory(item) {
    this.history.unshift(item)
    // Keep only last 50 items
    if (this.history.length > 50) {
      this.history = this.history.slice(0, 50)
    }
    localStorage.setItem('qr-history', JSON.stringify(this.history))
  }

  loadHistory() {
    try {
      return JSON.parse(localStorage.getItem('qr-history')) || []
    } catch {
      return []
    }
  }

  renderHistory() {
    const historyList = document.getElementById('history-list')
    
    if (this.history.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <p>No QR codes in history yet</p>
          <p class="mt-1">Generated and scanned QR codes will appear here</p>
        </div>
      `
      return
    }

    historyList.innerHTML = this.history.map((item, index) => `
      <div class="history-item">
        <div class="history-item-header">
          <span class="history-item-type">
            ${item.type === 'generated' ? '📝 Generated' : '📷 Scanned'}
            ${item.contentType ? ` (${item.contentType})` : ''}
          </span>
          <span class="history-item-date">
            ${new Date(item.timestamp).toLocaleString()}
          </span>
        </div>
        <div class="history-item-content">
          ${item.content}
        </div>
        <div class="history-item-actions">
          <button class="btn btn-secondary btn-small" onclick="qrApp.copyHistoryItem('${item.content}')">
            📋 Copy
          </button>
          <button class="btn btn-danger btn-small" onclick="qrApp.deleteHistoryItem(${index})">
            🗑️ Delete
          </button>
        </div>
      </div>
    `).join('')
  }

  copyHistoryItem(content) {
    navigator.clipboard.writeText(content).then(() => {
      this.showAlert('Content copied to clipboard!', 'success')
    }).catch(() => {
      this.showAlert('Failed to copy content', 'error')
    })
  }

  deleteHistoryItem(index) {
    this.history.splice(index, 1)
    localStorage.setItem('qr-history', JSON.stringify(this.history))
    this.renderHistory()
    this.showAlert('Item deleted from history', 'success')
  }

  clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
      this.history = []
      localStorage.removeItem('qr-history')
      this.renderHistory()
      this.showAlert('History cleared successfully!', 'success')
    }
  }

  showAlert(message, type = 'success') {
    const alert = document.createElement('div')
    alert.className = `alert ${type}`
    alert.textContent = message
    
    document.body.appendChild(alert)
    
    setTimeout(() => {
      alert.remove()
    }, 3000)
  }
}

// Make qrApp globally available for onclick handlers
window.qrApp = null