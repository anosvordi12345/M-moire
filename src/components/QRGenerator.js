import QRCode from 'qrcode'

export class QRGenerator {
  constructor() {
    this.currentType = 'text'
  }

  init() {
    this.bindEvents()
  }

  bindEvents() {
    const typeSelect = document.getElementById('qr-type')
    const form = document.getElementById('qr-form')
    const downloadBtn = document.getElementById('download-btn')

    if (typeSelect) {
      typeSelect.addEventListener('change', (e) => {
        this.updateFormFields(e.target.value)
      })
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault()
        this.generateQR()
      })
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        this.downloadQR()
      })
    }
  }

  updateFormFields(type) {
    const dynamicFields = document.getElementById('dynamic-fields')
    if (!dynamicFields) return

    this.currentType = type
    
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
      default:
        dynamicFields.innerHTML = this.renderTextFields()
    }
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

  async generateQR() {
    try {
      const formData = new FormData(document.getElementById('qr-form'))
      const type = formData.get('type')
      let content = this.buildContent(formData, type)

      if (!content || !content.trim()) {
        this.showAlert('Please fill in all required fields', 'error')
        return
      }

      const canvas = document.getElementById('qr-canvas')
      if (!canvas) {
        this.showAlert('QR canvas not found', 'error')
        return
      }

      await QRCode.toCanvas(canvas, content, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })

      const preview = document.getElementById('qr-preview')
      if (preview) {
        preview.style.display = 'block'
      }
      
      // Trigger custom event for history saving
      const event = new CustomEvent('qrGenerated', {
        detail: {
          type: 'generated',
          contentType: type,
          content: content,
          timestamp: new Date().toISOString()
        }
      })
      document.dispatchEvent(event)

      this.showAlert('QR Code generated successfully!', 'success')
    } catch (error) {
      console.error('Error generating QR code:', error)
      this.showAlert('Error generating QR code: ' + error.message, 'error')
    }
  }

  buildContent(formData, type) {
    switch(type) {
      case 'text':
        return formData.get('content')
      case 'url':
        return formData.get('url')
      case 'email':
        const email = formData.get('email')
        const subject = formData.get('subject') || ''
        const body = formData.get('body') || ''
        return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      case 'phone':
        return `tel:${formData.get('phone')}`
      case 'wifi':
        const ssid = formData.get('ssid')
        const password = formData.get('password') || ''
        const security = formData.get('security')
        return `WIFI:T:${security};S:${ssid};P:${password};;`
      default:
        return ''
    }
  }

  downloadQR() {
    try {
      const canvas = document.getElementById('qr-canvas')
      if (!canvas) {
        this.showAlert('No QR code to download', 'error')
        return
      }

      const link = document.createElement('a')
      link.download = `qr-code-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      this.showAlert('QR Code downloaded!', 'success')
    } catch (error) {
      console.error('Error downloading QR code:', error)
      this.showAlert('Error downloading QR code', 'error')
    }
  }

  showAlert(message, type = 'success') {
    const event = new CustomEvent('showAlert', {
      detail: { message, type }
    })
    document.dispatchEvent(event)
  }
}