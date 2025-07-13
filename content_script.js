// Content Script for Stealth AI Interview Assistant
// Runs only on meet.google.com pages

let isActive = false;
let microphonePermissionGranted = false;

// Initialize content script
(function() {
  'use strict';
  
  console.log('Stealth AI Interview Assistant content script loaded');
  
  // Check payment status on load
  checkPaymentAndInitialize();
  
  // Listen for messages from service worker
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'voiceStarted') {
      console.log('Voice recognition started by service worker');
      showMinimalIndicator('🎤 Listening...');
    }
    
    if (request.action === 'showNotification') {
      showNotification(request.message, request.type);
    }
    
    if (request.action === 'copyToClipboard') {
      copyToClipboard(request.text);
    }
  });
  
  // Add keyboard shortcut listener
  document.addEventListener('keydown', handleKeyboardShortcut);
  
})();

// Check payment status and initialize
async function checkPaymentAndInitialize() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'checkPayment' });
    if (response && response.paid) {
      console.log('Payment verified, content script ready');
      requestMicrophonePermission();
    } else {
      console.log('Payment required');
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
  }
}

// Request microphone permission
async function requestMicrophonePermission() {
  try {
    showMinimalIndicator('🎤 Requesting microphone...', 'loading');
    
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100
      } 
    });
    
    microphonePermissionGranted = true;
    console.log('Microphone permission granted');
    
    // Stop the stream immediately - we don't need to keep it open
    stream.getTracks().forEach(track => track.stop());
    
    // Notify service worker that we're ready
    chrome.runtime.sendMessage({ action: 'microphoneReady' });
    
    // Show success indicator
    showMinimalIndicator('✅ Microphone Ready!', 'success');
    
    // Show success notification
    setTimeout(() => {
      showNotification('🎤 Microphone access granted!', 'success');
    }, 1000);
    
  } catch (error) {
    console.error('Microphone permission denied:', error);
    showMinimalIndicator('❌ Microphone denied', 'error');
    showPermissionError();
  }
}

// Handle keyboard shortcuts
function handleKeyboardShortcut(event) {
  // Ctrl+Shift+Y to toggle voice listening
  if (event.ctrlKey && event.shiftKey && event.key === 'Y') {
    event.preventDefault();
    chrome.runtime.sendMessage({ action: 'toggleListening' });
  }
  
  // Ctrl+Shift+M to manually trigger microphone permission
  if (event.ctrlKey && event.shiftKey && event.key === 'M') {
    event.preventDefault();
    requestMicrophonePermission();
  }
  
  // Ctrl+Shift+T to test voice recognition manually
  if (event.ctrlKey && event.shiftKey && event.key === 'T') {
    event.preventDefault();
    testVoiceRecognition();
  }
}

// Show minimal indicator (only visible to user, not in screen share)
function showMinimalIndicator(message = '🎤 Listening', type = 'info') {
  // Remove existing indicator
  const existingIndicator = document.getElementById('stealth-ai-indicator');
  if (existingIndicator) {
    existingIndicator.parentNode.removeChild(existingIndicator);
  }
  
  // Set colors based on type
  let bgColor, textColor;
  switch (type) {
    case 'success':
      bgColor = 'rgba(0, 255, 0, 0.8)';
      textColor = 'white';
      break;
    case 'error':
      bgColor = 'rgba(255, 0, 0, 0.8)';
      textColor = 'white';
      break;
    case 'loading':
      bgColor = 'rgba(255, 165, 0, 0.8)';
      textColor = 'white';
      break;
    default:
      bgColor = 'rgba(0, 123, 255, 0.8)';
      textColor = 'white';
  }
  
  // Create a tiny, transparent indicator that won't show in screen share
  const indicator = document.createElement('div');
  indicator.id = 'stealth-ai-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: ${bgColor};
    color: ${textColor};
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    z-index: 999999;
    pointer-events: none;
    opacity: 0.9;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    animation: ${type === 'loading' ? 'pulse 1.5s infinite' : 'none'};
  `;
  indicator.textContent = message;
  
  // Add pulse animation for loading
  if (type === 'loading') {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.05); }
        100% { opacity: 0.6; transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(indicator);
  
  // Hide indicator after 3 seconds (or 5 seconds for loading)
  const hideTime = type === 'loading' ? 5000 : 3000;
  setTimeout(() => {
    if (indicator.parentNode) {
      indicator.style.opacity = '0';
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 300);
    }
  }, hideTime);
}

// Show notification to user
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existingNotification = document.getElementById('stealth-ai-notification');
  if (existingNotification) {
    existingNotification.parentNode.removeChild(existingNotification);
  }
  
  // Set colors based on type
  let bgColor, icon;
  switch (type) {
    case 'success':
      bgColor = 'rgba(0, 255, 0, 0.9)';
      icon = '✅';
      break;
    case 'error':
      bgColor = 'rgba(255, 0, 0, 0.9)';
      icon = '❌';
      break;
    case 'loading':
      bgColor = 'rgba(255, 165, 0, 0.9)';
      icon = '⏳';
      break;
    default:
      bgColor = 'rgba(0, 123, 255, 0.9)';
      icon = 'ℹ️';
  }
  
  const notification = document.createElement('div');
  notification.id = 'stealth-ai-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
    z-index: 999999;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    animation: ${type === 'loading' ? 'slideInOut 3s ease' : 'none'};
  `;
  notification.innerHTML = `${icon} ${message}`;
  
  // Add slide animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInOut {
      0% { transform: translateX(100%); }
      20% { transform: translateX(0); }
      80% { transform: translateX(0); }
      100% { transform: translateX(100%); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Slide in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Auto-remove after 3 seconds (or 5 seconds for loading)
  const hideTime = type === 'loading' ? 5000 : 3000;
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, hideTime);
}

// Show permission error
function showPermissionError() {
  const errorDiv = document.createElement('div');
  errorDiv.id = 'stealth-ai-error';
  errorDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 0, 0, 0.9);
    color: white;
    padding: 20px;
    border-radius: 8px;
    z-index: 999999;
    font-family: Arial, sans-serif;
    font-size: 14px;
    max-width: 300px;
    text-align: center;
  `;
  errorDiv.innerHTML = `
    <div style="margin-bottom: 10px; font-weight: bold;">Microphone Permission Required</div>
    <div style="margin-bottom: 15px;">Please allow microphone access for the Stealth AI Assistant to work.</div>
    <button id="retry-permission" style="
      background: white;
      color: red;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    ">Retry Permission</button>
  `;
  
  document.body.appendChild(errorDiv);
  
  // Add retry button functionality
  document.getElementById('retry-permission').addEventListener('click', () => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
    requestMicrophonePermission();
  });
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 10000);
}

// Clean up function
function cleanup() {
  const indicator = document.getElementById('stealth-ai-indicator');
  if (indicator) {
    indicator.parentNode.removeChild(indicator);
  }
  
  const errorDiv = document.getElementById('stealth-ai-error');
  if (errorDiv) {
    errorDiv.parentNode.removeChild(errorDiv);
  }
}

// Copy text to clipboard
async function copyToClipboard(text) {
  try {
    console.log('[Stealth AI] Copying to clipboard:', text.substring(0, 50) + '...');
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      console.log('[Stealth AI] Text copied using clipboard API');
      showMinimalIndicator('✅ Copied to clipboard!', 'success');
      return;
    }
    
    // Fallback method using document.execCommand
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      console.log('[Stealth AI] Text copied using fallback method');
      showMinimalIndicator('✅ Copied to clipboard!', 'success');
    } else {
      throw new Error('execCommand copy failed');
    }
    
  } catch (error) {
    console.error('[Stealth AI] Failed to copy to clipboard:', error);
    showMinimalIndicator('❌ Copy failed', 'error');
    
    // Show the text in a notification as last resort
    showNotification(`Answer: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`, 'info');
  }
}

// Clean up on page unload
window.addEventListener('beforeunload', cleanup);

// Test voice recognition manually
function testVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showMinimalIndicator('❌ Speech API not supported', 'error');
    showNotification('❌ Speech recognition not supported in this browser', 'error');
    return;
  }

  showMinimalIndicator('🎤 Starting test...', 'loading');
  showNotification('🎤 Starting voice recognition test...', 'info');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    console.log('Test voice recognition started');
    showMinimalIndicator('🎤 Test Listening...', 'loading');
    showNotification('🎤 Listening... Speak now!', 'info');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log('Test voice input:', transcript);
    showMinimalIndicator(`✅ Heard: "${transcript}"`, 'success');
    showNotification(`✅ Voice detected: "${transcript}"`, 'success');
    
    // Send to service worker for processing
    chrome.runtime.sendMessage({ 
      action: 'processVoiceInput',
      transcript: transcript
    });
  };

  recognition.onerror = (event) => {
    console.error('Test voice recognition error:', event.error);
    showMinimalIndicator(`❌ Error: ${event.error}`, 'error');
    showNotification(`❌ Voice recognition error: ${event.error}`, 'error');
  };

  recognition.onend = () => {
    console.log('Test voice recognition ended');
    showMinimalIndicator('✅ Test completed', 'success');
  };

  try {
    recognition.start();
  } catch (error) {
    console.error('Failed to start test voice recognition:', error);
    showMinimalIndicator('❌ Failed to start', 'error');
    showNotification(`❌ Failed to start voice recognition: ${error.message}`, 'error');
  }
}

// Export functions for potential external use
window.StealthAI = {
  requestMicrophonePermission,
  cleanup,
  testVoiceRecognition
}; 