export class AlertManager {
  constructor() {
    this.alerts = []
    this.maxAlerts = 3
  }

  init() {
    this.setupEventListener()
  }

  setupEventListener() {
    document.addEventListener('showAlert', (e) => {
      this.showAlert(e.detail.message, e.detail.type)
    })
  }

  showAlert(message, type = 'success') {
    try {
      // Remove oldest alert if we have too many
      if (this.alerts.length >= this.maxAlerts) {
        const oldestAlert = this.alerts.shift()
        if (oldestAlert && oldestAlert.parentNode) {
          oldestAlert.remove()
        }
      }

      const alert = this.createAlert(message, type)
      document.body.appendChild(alert)
      this.alerts.push(alert)
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        this.removeAlert(alert)
      }, 3000)
    } catch (error) {
      console.error('Error showing alert:', error)
    }
  }

  createAlert(message, type) {
    const alert = document.createElement('div')
    alert.className = `alert ${type}`
    alert.textContent = message
    
    // Add close button
    const closeBtn = document.createElement('button')
    closeBtn.innerHTML = '×'
    closeBtn.className = 'alert-close'
    closeBtn.onclick = () => this.removeAlert(alert)
    alert.appendChild(closeBtn)
    
    return alert
  }

  removeAlert(alert) {
    try {
      if (alert && alert.parentNode) {
        alert.style.opacity = '0'
        alert.style.transform = 'translateX(100%)'
        
        setTimeout(() => {
          if (alert.parentNode) {
            alert.remove()
          }
          this.alerts = this.alerts.filter(a => a !== alert)
        }, 300)
      }
    } catch (error) {
      console.error('Error removing alert:', error)
    }
  }

  clearAllAlerts() {
    this.alerts.forEach(alert => {
      if (alert && alert.parentNode) {
        alert.remove()
      }
    })
    this.alerts = []
  }
}