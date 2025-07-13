// Payment Handler for Stealth AI Interview Assistant

class PaymentHandler {
    constructor() {
        this.apiKey = '';
        this.razorpayKey = 'pk_test_51BTUDGJAJfZb9HEBwDg86TN1KNprHjkfipXmEDMb0gSCassK5T3ZfxsAbcgKVmAIXF7oZ6ItlZZbXO6idTHE67IM007EwQ4uN3'; // Replace with your actual test key
        this.amount = 500; // $5.00 in cents
        this.currency = 'USD';
        
        this.initializeElements();
        this.bindEvents();
        this.checkExistingPayment();
    }

    initializeElements() {
        this.payButton = document.getElementById('payButton');
        this.testApiButton = document.getElementById('testApiButton');
        this.apiKeyInput = document.getElementById('apiKey');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.successMessage = document.getElementById('successMessage');
        this.closeButton = document.getElementById('closeButton');
    }

    bindEvents() {
        this.payButton.addEventListener('click', () => this.handlePayment());
        this.testApiButton.addEventListener('click', () => this.testApiKeyOnly());
        this.closeButton.addEventListener('click', () => this.closeWindow());
        
        // Validate API key on input
        this.apiKeyInput.addEventListener('input', () => {
            this.validateApiKey();
        });
    }

    async checkExistingPayment() {
        try {
            const result = await chrome.storage.local.get(['paid']);
            if (result.paid) {
                this.showSuccessMessage();
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
        }
    }

    validateApiKey() {
        const apiKey = this.apiKeyInput.value.trim();
        const isValid = apiKey.length > 0 && apiKey.startsWith('AIza') && apiKey.length >= 39;
        
        this.payButton.disabled = !isValid;
        this.testApiButton.disabled = !isValid;
        this.payButton.style.opacity = isValid ? '1' : '0.6';
        
        if (isValid) {
            this.apiKey = apiKey;
        }
        
        // Show validation message
        const validationMsg = document.getElementById('apiKeyValidation');
        if (!validationMsg) {
            const msg = document.createElement('div');
            msg.id = 'apiKeyValidation';
            msg.style.cssText = `
                font-size: 12px;
                margin-top: 5px;
                color: ${isValid ? '#10b981' : '#ef4444'};
            `;
            this.apiKeyInput.parentNode.appendChild(msg);
        }
        
        if (validationMsg) {
            let message = '';
            if (apiKey.length === 0) {
                message = '❌ Please enter your Gemini API key';
            } else if (!apiKey.startsWith('AIza')) {
                message = '❌ API key should start with "AIza"';
            } else if (apiKey.length < 39) {
                message = '❌ API key seems too short (should be ~39 characters)';
            } else {
                message = '✅ Valid API key format';
            }
            
            validationMsg.textContent = message;
            validationMsg.style.color = isValid ? '#10b981' : '#ef4444';
        }
    }

    async handlePayment() {
        if (!this.apiKey) {
            this.showError('Please enter a valid Gemini API key');
            return;
        }

        this.showLoading('Testing API key...');

        try {
            // Test the API key first
            const isValid = await this.testApiKey();
            if (!isValid) {
                this.hideLoading();
                this.showError('Invalid API key. Please check your Gemini API key.');
                return;
            }

            this.showLoading('Processing payment...');

            // For demo purposes, we'll simulate a successful payment
            // In production, you would integrate with Razorpay here
            await this.simulatePayment();
            
            // Store payment status and API key
            await this.storePaymentData();
            
            // Show success message
            this.hideLoading();
            this.showSuccessMessage();
            
        } catch (error) {
            console.error('Payment error:', error);
            this.hideLoading();
            this.showError('Payment failed. Please try again.');
        }
    }

    async testApiKeyOnly() {
        if (!this.apiKey) {
            this.showError('Please enter a valid Gemini API key first');
            return;
        }

        this.testApiButton.disabled = true;
        this.testApiButton.textContent = 'Testing...';
        
        try {
            const isValid = await this.testApiKey();
            if (isValid) {
                this.showError('✅ API key is valid! You can proceed with payment.');
            } else {
                this.showError('❌ API key is invalid. Please check your key.');
            }
        } catch (error) {
            this.showError(`❌ Test failed: ${error.message}`);
        } finally {
            this.testApiButton.disabled = false;
            this.testApiButton.innerHTML = '<span class="button-text">Test API Key</span><span class="button-icon">🧪</span>';
        }
    }

    async testApiKey() {
        try {
            console.log('Testing API key:', this.apiKey.substring(0, 10) + '...');
            
            // Test with the latest Gemini model
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: "Hello, this is a test message." }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            console.log('API response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API key test failed:', response.status, errorText);
                
                // Try with gemini-pro model as fallback
                if (response.status === 404) {
                    console.log('Trying with gemini-pro model...');
                    return await this.testApiKeyWithProModel();
                }
                
                return false;
            }

            const data = await response.json();
            console.log('API response data:', data);
            
            return data.candidates && data.candidates.length > 0 && data.candidates[0].content;
        } catch (error) {
            console.error('API key test error:', error);
            return false;
        }
    }

    async testApiKeyWithProModel() {
        try {
            console.log('Testing with gemini-pro model...');
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: "Hello, this is a test message." }
                            ]
                        }
                    ]
                })
            });

            console.log('Pro model response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Pro model test failed:', response.status, errorText);
                return false;
            }

            const data = await response.json();
            console.log('Pro model response data:', data);
            
            return data.candidates && data.candidates.length > 0 && data.candidates[0].content;
        } catch (error) {
            console.error('Pro model test error:', error);
            return false;
        }
    }

    async simulatePayment() {
        // Simulate payment processing delay
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    razorpay_payment_id: 'pay_' + Math.random().toString(36).substr(2, 9),
                    status: 'success'
                });
            }, 2000);
        });
    }

    async storePaymentData() {
        try {
            await chrome.storage.local.set({
                paid: true,
                geminiApiKey: this.apiKey,
                paymentDate: new Date().toISOString(),
                paymentId: 'pay_' + Math.random().toString(36).substr(2, 9)
            });

            // Notify service worker
            chrome.runtime.sendMessage({
                action: 'paymentSuccess',
                apiKey: this.apiKey
            });

        } catch (error) {
            console.error('Error storing payment data:', error);
            throw error;
        }
    }

    showLoading(message = 'Processing payment...') {
        this.loadingOverlay.classList.remove('hidden');
        this.payButton.disabled = true;
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
    }

    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
        this.payButton.disabled = false;
    }

    showSuccessMessage() {
        this.successMessage.classList.remove('hidden');
    }

    showError(message) {
        // Create and show error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f56565;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1002;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    closeWindow() {
        window.close();
    }

    // Real Razorpay integration (commented out for demo)
    /*
    async initializeRazorpay() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async processRazorpayPayment() {
        const options = {
            key: this.razorpayKey,
            amount: this.amount,
            currency: this.currency,
            name: 'Stealth AI Interview Assistant',
            description: 'One-time access to AI-powered interview assistant',
            handler: (response) => {
                console.log('Payment successful:', response);
                this.handlePaymentSuccess(response);
            },
            prefill: {
                email: '',
                contact: ''
            },
            theme: {
                color: '#667eea'
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    }
    */
}

// Initialize payment handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PaymentHandler();
});

// Handle window focus to check payment status
window.addEventListener('focus', () => {
    // Check if payment was completed in another window
    chrome.storage.local.get(['paid'], (result) => {
        if (result.paid) {
            const successMessage = document.getElementById('successMessage');
            if (successMessage) {
                successMessage.classList.remove('hidden');
            }
        }
    });
});     