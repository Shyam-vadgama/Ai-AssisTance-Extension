// Service Worker for Stealth AI Interview Assistant
let isListening = false;
let recognition = null;
let geminiApiKey = null;

// Initialize the service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('Stealth AI Interview Assistant installed');
  checkPaymentStatus();
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === 'checkPayment') {
      chrome.storage.local.get(['paid'], (result) => {
        sendResponse({ paid: result.paid || false });
      });
      return true; // Keep message channel open for async response
    }
    
    if (request.action === 'paymentSuccess') {
      geminiApiKey = request.apiKey;
      chrome.storage.local.set({ 
        paid: true, 
        geminiApiKey: request.apiKey 
      });
      console.log('Payment successful, extension activated');
    }
    
    if (request.action === 'toggleListening') {
      const tabId = request.tabId || (sender && sender.tab && sender.tab.id);
      if (tabId) {
        toggleVoiceListening(tabId);
      } else {
        console.error('Cannot toggle listening: no tab ID available');
      }
    }
    
    // Handle voice recognition events
    if (request.action === 'voiceStarted') {
      if (sender && sender.tab) {
        console.log('Voice recognition started in tab:', sender.tab.url);
        if (sender.tab.id) {
          chrome.tabs.sendMessage(sender.tab.id, { action: 'voiceStarted' });
        }
      } else {
        console.log('Voice recognition started (no tab info available)');
      }
    }
    
    if (request.action === 'processVoiceInput') {
      console.log('Processing voice input:', request.transcript);
      processQuestion(request.transcript);
    }
    
    if (request.action === 'voiceError') {
      console.error('Voice recognition error:', request.error);
      isListening = false;
    }
    
    if (request.action === 'voiceEnded') {
      console.log('Voice recognition ended');
      if (isListening) {
        // Restart if still supposed to be listening
        setTimeout(() => {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].url && tabs[0].url.includes('meet.google.com')) {
              startVoiceRecognition(tabs[0].id);
            }
          });
        }, 1000);
      }
    }
  } catch (error) {
    console.error('Error in message handler:', error);
    console.error('Request:', request);
    console.error('Sender:', sender);
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('meet.google.com')) {
    toggleVoiceListening(tab.id);
  } else {
    showPaymentPopup();
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === '_execute_action') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('meet.google.com')) {
        toggleVoiceListening(tabs[0].id);
      }
    });
  }
});

// Check payment status
async function checkPaymentStatus() {
  try {
    const result = await chrome.storage.local.get(['paid', 'geminiApiKey']);
    if (!result.paid) {
      showPaymentPopup();
    } else {
      geminiApiKey = result.geminiApiKey;
      console.log('Payment verified, extension ready');
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    showPaymentPopup();
  }
}

// Show payment popup
function showPaymentPopup() {
  chrome.windows.create({
    url: chrome.runtime.getURL('payment.html'),
    type: 'popup',
    width: 400,
    height: 600
  });
}

// Toggle voice listening
function toggleVoiceListening(tabId) {
  chrome.storage.local.get(['paid'], (result) => {
    if (!result.paid) {
      showPaymentPopup();
      return;
    }

    isListening = !isListening;
    
    if (isListening) {
      startVoiceRecognition(tabId);
    } else {
      stopVoiceRecognition(tabId);
    }

    // Update icon to show listening state
    try {
      chrome.action.setIcon({
        path: isListening ? 'icons/icon-active.svg' : 'icons/icon.svg'
      });
    } catch (error) {
      console.log('Icon update skipped - using default icon');
    }
  });
}

// Start voice recognition
function startVoiceRecognition(tabId) {
  // Execute content script to start voice recognition
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    function: startVoiceRecognitionInContent
  });
}

// Function to be executed in content script context
function startVoiceRecognitionInContent() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.error('Speech recognition not supported');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    console.log('Voice recognition started in content script');
    // Send message to service worker
    chrome.runtime.sendMessage({ 
      action: 'voiceStarted'
    });
  };

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    console.log('Voice input detected:', transcript);
    
    if (transcript.trim()) {
      // Send transcript to service worker for processing
      chrome.runtime.sendMessage({ 
        action: 'processVoiceInput',
        transcript: transcript
      });
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    chrome.runtime.sendMessage({ 
      action: 'voiceError',
      error: event.error
    });
  };

  recognition.onend = () => {
    console.log('Voice recognition ended');
    chrome.runtime.sendMessage({ 
      action: 'voiceEnded'
    });
  };

  // Store recognition instance globally
  window.stealthAIRecognition = recognition;
  
  try {
    recognition.start();
    console.log('Voice recognition started successfully');
  } catch (error) {
    console.error('Failed to start voice recognition:', error);
  }
}

// Stop voice recognition
function stopVoiceRecognition(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    function: stopVoiceRecognitionInContent
  });
  isListening = false;
}

// Function to stop voice recognition in content script
function stopVoiceRecognitionInContent() {
  if (window.stealthAIRecognition) {
    window.stealthAIRecognition.stop();
    window.stealthAIRecognition = null;
    console.log('Voice recognition stopped');
  }
}

// Process question and get AI response
async function processQuestion(question) {
  try {
    if (!geminiApiKey) {
      console.error('Gemini API key not found');
      showNotification('❌ Gemini API key not configured', 'error');
      return;
    }

    console.log('Sending question to Gemini:', question);
    showNotification('🤖 Processing with AI...', 'info');

    // Try with the latest Gemini model first
    let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: question }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    // If the new model fails, try with gemini-pro
    if (!response.ok && response.status === 404) {
      console.log('New model not available, trying gemini-pro...');
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: question }
              ]
            }
          ]
        })
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      // Provide more specific error messages
      if (response.status === 400) {
        throw new Error('Invalid request format. Please check your API key.');
      } else if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Gemini API key.');
      } else if (response.status === 403) {
        throw new Error('API key quota exceeded or disabled.');
      } else if (response.status === 404) {
        throw new Error('Gemini model not found. Please try again.');
      } else {
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('Gemini API response:', data);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    const answer = data.candidates[0].content.parts[0].text;
    
    // Copy answer to clipboard
    await copyToClipboard(answer);
    console.log('Answer copied to clipboard:', answer);
    showNotification('✅ Answer copied to clipboard!', 'success');
    
  } catch (error) {
    console.error('Error processing question:', error);
    showNotification(`❌ AI Error: ${error.message}`, 'error');
  }
}

// Show notification to user
function showNotification(message, type = 'info') {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('meet.google.com')) {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'showNotification',
        message: message,
        type: type
      }).catch(error => {
        console.log('Could not send notification to tab:', error);
      });
    }
  });
}

// Copy text to clipboard using content script
async function copyToClipboard(text) {
  try {
    // Send message to content script to copy text
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      await chrome.tabs.sendMessage(tabs[0].id, {
        action: 'copyToClipboard',
        text: text
      });
      console.log('Copy request sent to content script');
    } else {
      console.error('No active tab found for clipboard copy');
      throw new Error('No active tab found');
    }
  } catch (error) {
    console.error('Failed to send copy request:', error);
    // Try direct clipboard API as fallback
    try {
      await navigator.clipboard.writeText(text);
      console.log('Text copied using direct clipboard API');
    } catch (clipboardError) {
      console.error('Direct clipboard API failed:', clipboardError);
      throw clipboardError;
    }
  }
}



// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('meet.google.com')) {
    chrome.storage.local.get(['paid'], (result) => {
      if (result.paid && isListening) {
        // Restart voice recognition on page reload
        setTimeout(() => startVoiceRecognition(tabId), 1000);
      }
    });
  }
}); 