// Popup Handler for Stealth AI Interview Assistant

class PopupHandler {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.checkStatus();
    }

    initializeElements() {
        this.statusContainer = document.getElementById('statusContainer');
        this.payButton = document.getElementById('payButton');
        this.toggleButton = document.getElementById('toggleButton');
        this.testButton = document.getElementById('testButton');
        // Chatbot elements
        this.chatContainer = document.getElementById('chatContainer');
        this.chatInput = document.getElementById('chatInput');
        this.sendChatBtn = document.getElementById('sendChatBtn');
        this.isPaid = false;
        // Load chat history
        this.loadChatHistory();
    }

    bindEvents() {
        this.payButton.addEventListener('click', () => this.handlePayment());
        this.toggleButton.addEventListener('click', () => this.toggleVoiceListening());
        this.testButton.addEventListener('click', () => this.testVoiceRecognition());
        // Chatbot send
        this.sendChatBtn.addEventListener('click', () => this.handleSendChat());
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleSendChat();
        });
        // Remove runtime.onMessage listener for showAIAnswer
    }

    async checkStatus() {
        try {
            const result = await chrome.storage.local.get(['paid']);
            this.updateStatus(result.paid || false);
        } catch (error) {
            console.error('Error checking status:', error);
            this.updateStatus(false);
        }
    }

    updateStatus(isPaid) {
        this.isPaid = isPaid;
        if (isPaid) {
            this.statusContainer.className = 'status paid';
            this.statusContainer.innerHTML = `
                <div class="status-icon">✅</div>
                <div class="status-text">Activated</div>
                <div class="status-desc">Ready to use on Google Meet</div>
            `;
            
            this.payButton.style.display = 'none';
            this.toggleButton.disabled = false;
            this.testButton.disabled = false;
            this.toggleButton.textContent = 'Start Voice Listening';
            
        } else {
            this.statusContainer.className = 'status unpaid';
            this.statusContainer.innerHTML = `
                <div class="status-icon">🔒</div>
                <div class="status-text">Payment Required</div>
                <div class="status-desc">Complete payment to activate the assistant</div>
            `;
            
            this.payButton.style.display = 'block';
            this.toggleButton.disabled = true;
            this.testButton.disabled = true;
            this.toggleButton.textContent = 'Toggle Voice Listening';
        }
    }

    handlePayment() {
        chrome.windows.create({
            url: chrome.runtime.getURL('payment.html'),
            type: 'popup',
            width: 400,
            height: 600
        });
    }

    async toggleVoiceListening() {
        try {
            // Get current tab
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const currentTab = tabs[0];
            
            if (currentTab && currentTab.url && currentTab.url.includes('meet.google.com')) {
                // Send message to service worker to toggle listening
                chrome.runtime.sendMessage({ 
                    action: 'toggleListening',
                    tabId: currentTab.id,
                    tabUrl: currentTab.url
                });
                
                // Update button text
                this.toggleButton.textContent = this.toggleButton.textContent === 'Start Voice Listening' 
                    ? 'Stop Voice Listening' 
                    : 'Start Voice Listening';
                    
            } else {
                // Show error if not on Google Meet
                this.showError('Please navigate to Google Meet to use voice listening');
            }
        } catch (error) {
            console.error('Error toggling voice listening:', error);
            this.showError('Error toggling voice listening');
        }
    }

    showError(message) {
        // Create temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            right: 10px;
            background: #f56565;
            color: white;
            padding: 10px;
            border-radius: 6px;
            font-size: 12px;
            text-align: center;
            z-index: 1000;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }

    async testVoiceRecognition() {
        try {
            // Get current tab
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const currentTab = tabs[0];
            
            if (currentTab && currentTab.url && currentTab.url.includes('meet.google.com')) {
                // Execute test voice recognition in content script
                chrome.scripting.executeScript({
                    target: { tabId: currentTab.id },
                    function: () => {
                        if (window.StealthAI && window.StealthAI.testVoiceRecognition) {
                            window.StealthAI.testVoiceRecognition();
                        } else {
                            console.error('StealthAI test function not found');
                        }
                    }
                }).catch(error => {
                    console.error('Failed to execute test script:', error);
                });
            } else {
                this.showError('Please navigate to Google Meet to test voice recognition');
            }
        } catch (error) {
            console.error('Error testing voice recognition:', error);
            this.showError('Error testing voice recognition');
        }
    }

    // Add chat message to chatContainer
    addChatMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.style.margin = '8px 0';
        msgDiv.style.whiteSpace = 'pre-wrap';
        if (sender === 'user') {
            msgDiv.style.textAlign = 'right';
            msgDiv.style.color = '#2b6cb0';
            msgDiv.textContent = 'You: ' + text;
        } else {
            msgDiv.style.textAlign = 'left';
            msgDiv.style.color = '#222';
            msgDiv.textContent = 'AI: ' + text;
        }
        this.chatContainer.appendChild(msgDiv);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    // Handle sending chat question
    handleSendChat() {
        const question = this.chatInput.value.trim();
        if (!question) return;
        if (!this.isPaid) {
            this.showError('Please complete payment to use the chatbot.');
            return;
        }
        this.addChatMessage('user', question);
        this.chatInput.value = '';
        // Send to service worker for processing
        chrome.runtime.sendMessage({
            action: 'processVoiceInput',
            transcript: question
        });
    }

    // Load and display chat history
    loadChatHistory() {
        chrome.storage.local.get({ chatHistory: [] }, (result) => {
            this.chatContainer.innerHTML = '';
            for (const msg of result.chatHistory) {
                if (msg.question) this.addChatMessage('user', msg.question);
                if (msg.answer) this.addChatMessage('ai', msg.answer);
            }
        });
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const handler = new PopupHandler();
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.chatHistory) {
            handler.loadChatHistory();
        }
        if (namespace === 'local' && changes.paid) {
            window.location.reload();
        }
    });
}); 