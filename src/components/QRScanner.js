import QrScanner from 'qr-scanner'

export class QRScanner {
  constructor() {
    this.scanner = null
    this.isScanning = false
    this.video = null
  }

  init() {
    this.bindEvents()
  }

  bindEvents() {
    const startBtn = document.getElementById('start-camera')
    const stopBtn = document.getElementById('stop-camera')
    const uploadArea = document.getElementById('upload-area')
    const fileInput = document.getElementById('file-input')
    const copyBtn = document.getElementById('copy-result')

    if (startBtn) {
      startBtn.addEventListener('click', () => this.startCamera())
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stopCamera())
    }

    if (uploadArea && fileInput) {
      uploadArea.addEventListener('click', () => fileInput.click())
      uploadArea.addEventListener('dragover', this.handleDragOver.bind(this))
      uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this))
      uploadArea.addEventListener('drop', this.handleDrop.bind(this))
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.processFile(e.target.files[0])
        }
      })
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyToClipboard())
    }
  }

  handleDragOver(e) {
    e.preventDefault()
    const uploadArea = document.getElementById('upload-area')
    if (uploadArea) {
      uploadArea.classList.add('dragover')
    }
  }

  handleDragLeave() {
    const uploadArea = document.getElementById('upload-area')
    if (uploadArea) {
      uploadArea.classList.remove('dragover')
    }
  }

  handleDrop(e) {
    e.preventDefault()
    const uploadArea = document.getElementById('upload-area')
    if (uploadArea) {
      uploadArea.classList.remove('dragover')
    }
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      this.processFile(files[0])
    }
  }

  async startCamera() {
    try {
      // Check if QrScanner is supported
      if (!QrScanner.hasCamera()) {
        this.showAlert('No camera found on this device', 'error')
        return
      }

      this.video = document.getElementById('camera-preview')
      if (!this.video) {
        this.showAlert('Camera preview element not found', 'error')
        return
      }

      this.video.style.display = 'block'
      
      this.scanner = new QrScanner(
        this.video,
        (result) => this.handleScanResult(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment'
        }
      )

      await this.scanner.start()
      this.isScanning = true
      
      this.updateCameraButtons(true)
      this.showAlert('Camera started successfully!', 'success')
    } catch (error) {
      console.error('Error starting camera:', error)
      this.showAlert('Error accessing camera. Please check permissions.', 'error')
      this.cleanup()
    }
  }

  stopCamera() {
    try {
      this.cleanup()
      this.updateCameraButtons(false)
      this.showAlert('Camera stopped', 'success')
    } catch (error) {
      console.error('Error stopping camera:', error)
      this.showAlert('Error stopping camera', 'error')
    }
  }

  cleanup() {
    if (this.scanner) {
      this.scanner.stop()
      this.scanner.destroy()
      this.scanner = null
    }
    
    if (this.video) {
      this.video.style.display = 'none'
    }
    
    this.isScanning = false
  }

  updateCameraButtons(isScanning) {
    const startBtn = document.getElementById('start-camera')
    const stopBtn = document.getElementById('stop-camera')
    
    if (startBtn && stopBtn) {
      if (isScanning) {
        startBtn.classList.add('hidden')
        stopBtn.classList.remove('hidden')
      } else {
        startBtn.classList.remove('hidden')
        stopBtn.classList.add('hidden')
      }
    }
  }

  async processFile(file) {
    try {
      if (!file) {
        this.showAlert('No file selected', 'error')
        return
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/mov', 'video/avi']
      if (!validTypes.includes(file.type)) {
        this.showAlert('Unsupported file type. Please use JPG, PNG, GIF, MP4, MOV, or AVI', 'error')
        return
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.showAlert('File too large. Maximum size is 10MB', 'error')
        return
      }

      this.showAlert('Processing file...', 'warning')
      
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true
      })
      
      this.handleScanResult(result.data)
    } catch (error) {
      console.error('Error scanning file:', error)
      this.showAlert('No QR code found in the uploaded file', 'error')
    }
  }

  handleScanResult(content) {
    try {
      if (!content) {
        this.showAlert('Empty scan result', 'error')
        return
      }

      const scanContent = document.getElementById('scan-content')
      const scanResult = document.getElementById('scan-result')
      
      if (scanContent) {
        scanContent.textContent = content
      }
      
      if (scanResult) {
        scanResult.classList.add('show')
      }
      
      // Trigger custom event for history saving
      const event = new CustomEvent('qrScanned', {
        detail: {
          type: 'scanned',
          content: content,
          timestamp: new Date().toISOString()
        }
      })
      document.dispatchEvent(event)

      this.showAlert('QR Code scanned successfully!', 'success')
    } catch (error) {
      console.error('Error handling scan result:', error)
      this.showAlert('Error processing scan result', 'error')
    }
  }

  async copyToClipboard() {
    try {
      const content = document.getElementById('scan-content')?.textContent
      if (!content) {
        this.showAlert('No content to copy', 'error')
        return
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content)
        this.showAlert('Content copied to clipboard!', 'success')
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = content
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        this.showAlert('Content copied to clipboard!', 'success')
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      this.showAlert('Failed to copy content', 'error')
    }
  }

  showAlert(message, type = 'success') {
    const event = new CustomEvent('showAlert', {
      detail: { message, type }
    })
    document.dispatchEvent(event)
  }

  // Cleanup when component is destroyed
  destroy() {
    this.cleanup()
  }
}