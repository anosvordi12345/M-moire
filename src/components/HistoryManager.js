export class HistoryManager {
  constructor() {
    this.history = this.loadHistory()
    this.maxItems = 50
  }

  init() {
    this.bindEvents()
    this.renderHistory()
    this.setupEventListeners()
  }

  bindEvents() {
    const clearBtn = document.getElementById('clear-history')
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearHistory())
    }
  }

  setupEventListeners() {
    // Listen for QR generation events
    document.addEventListener('qrGenerated', (e) => {
      this.saveToHistory(e.detail)
    })

    // Listen for QR scan events
    document.addEventListener('qrScanned', (e) => {
      this.saveToHistory(e.detail)
    })
  }

  saveToHistory(item) {
    try {
      if (!item || !item.content) {
        console.warn('Invalid history item:', item)
        return
      }

      // Add unique ID and ensure all required fields
      const historyItem = {
        id: Date.now() + Math.random(),
        type: item.type || 'unknown',
        contentType: item.contentType || '',
        content: item.content,
        timestamp: item.timestamp || new Date().toISOString()
      }

      this.history.unshift(historyItem)
      
      // Keep only last maxItems
      if (this.history.length > this.maxItems) {
        this.history = this.history.slice(0, this.maxItems)
      }
      
      this.saveToStorage()
      this.renderHistory()
    } catch (error) {
      console.error('Error saving to history:', error)
    }
  }

  loadHistory() {
    try {
      const stored = localStorage.getItem('qr-history')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading history:', error)
      return []
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('qr-history', JSON.stringify(this.history))
    } catch (error) {
      console.error('Error saving history to storage:', error)
    }
  }

  renderHistory() {
    const historyList = document.getElementById('history-list')
    if (!historyList) return
    
    if (this.history.length === 0) {
      historyList.innerHTML = this.renderEmptyState()
      return
    }

    historyList.innerHTML = this.history.map((item, index) => 
      this.renderHistoryItem(item, index)
    ).join('')
  }

  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p>No QR codes in history yet</p>
        <p class="mt-1">Generated and scanned QR codes will appear here</p>
      </div>
    `
  }

  renderHistoryItem(item, index) {
    const date = new Date(item.timestamp)
    const formattedDate = date.toLocaleString()
    const typeLabel = item.type === 'generated' ? '📝 Generated' : '📷 Scanned'
    const contentTypeLabel = item.contentType ? ` (${item.contentType})` : ''
    
    return `
      <div class="history-item" data-index="${index}">
        <div class="history-item-header">
          <span class="history-item-type">
            ${typeLabel}${contentTypeLabel}
          </span>
          <span class="history-item-date">
            ${formattedDate}
          </span>
        </div>
        <div class="history-item-content">
          ${this.escapeHtml(item.content)}
        </div>
        <div class="history-item-actions">
          <button class="btn btn-secondary btn-small copy-btn" data-content="${this.escapeHtml(item.content)}">
            📋 Copy
          </button>
          <button class="btn btn-danger btn-small delete-btn" data-index="${index}">
            🗑️ Delete
          </button>
        </div>
      </div>
    `
  }

  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  async copyHistoryItem(content) {
    try {
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

  deleteHistoryItem(index) {
    try {
      if (index >= 0 && index < this.history.length) {
        this.history.splice(index, 1)
        this.saveToStorage()
        this.renderHistory()
        this.showAlert('Item deleted from history', 'success')
      }
    } catch (error) {
      console.error('Error deleting history item:', error)
      this.showAlert('Error deleting item', 'error')
    }
  }

  clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
      try {
        this.history = []
        this.saveToStorage()
        this.renderHistory()
        this.showAlert('History cleared successfully!', 'success')
      } catch (error) {
        console.error('Error clearing history:', error)
        this.showAlert('Error clearing history', 'error')
      }
    }
  }

  showAlert(message, type = 'success') {
    const event = new CustomEvent('showAlert', {
      detail: { message, type }
    })
    document.dispatchEvent(event)
  }

  // Event delegation for dynamically created buttons
  setupEventDelegation() {
    const historyList = document.getElementById('history-list')
    if (!historyList) return

    historyList.addEventListener('click', (e) => {
      if (e.target.classList.contains('copy-btn')) {
        const content = e.target.getAttribute('data-content')
        this.copyHistoryItem(content)
      } else if (e.target.classList.contains('delete-btn')) {
        const index = parseInt(e.target.getAttribute('data-index'))
        this.deleteHistoryItem(index)
      }
    })
  }
}