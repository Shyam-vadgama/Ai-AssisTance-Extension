# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 🎤 Voice Recognition Issues

#### **"Speech recognition not supported"**
- **Solution**: Update Chrome to the latest version
- **Alternative**: Try a different browser (Chrome works best)
- **Check**: Open `test-voice.html` to verify basic voice recognition

#### **"Microphone permission denied"**
- **Solution**: 
  1. Click the microphone icon in Chrome's address bar
  2. Select "Allow" for microphone access
  3. Go to Chrome Settings > Privacy and Security > Site Settings > Microphone
  4. Allow microphone access for meet.google.com

#### **"No voice detected"**
- **Check**: 
  1. Ensure microphone is working in other applications
  2. Speak clearly and loudly
  3. Check microphone volume in system settings
  4. Try the test page: `test-voice.html`

### 🤖 AI/API Issues

#### **"Gemini API key not configured"**
- **Solution**: 
  1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
  2. Enter the key in the payment form
  3. The key should start with "AIza" and be at least 39 characters long

#### **"HTTP error! status: 404"**
- **Cause**: Invalid or expired API key
- **Solution**: 
  1. Check your API key format (should start with "AIza")
  2. Verify the key is active in Google AI Studio
  3. Ensure you have sufficient quota remaining

#### **"Invalid response format from Gemini API"**
- **Cause**: API response format changed or error
- **Solution**: 
  1. Check your API key is valid
  2. Ensure you have internet connection
  3. Try again in a few minutes

### 🔌 Extension Issues

#### **"Extension not detected"**
- **Solution**: 
  1. Go to `chrome://extensions/`
  2. Enable Developer Mode
  3. Click "Load unpacked" and select the extension folder
  4. Ensure the extension is enabled

#### **"Could not establish connection"**
- **Cause**: Content script communication issue
- **Solution**: 
  1. Reload the extension in `chrome://extensions/`
  2. Refresh the Google Meet page
  3. Check console for specific error messages

#### **"Icon errors"**
- **Cause**: Missing or invalid icon files
- **Solution**: 
  1. The extension now uses SVG icons automatically
  2. If issues persist, the extension will use default Chrome icons

### 💳 Payment Issues

#### **"Payment failed"**
- **Solution**: 
  1. Check your internet connection
  2. Ensure you have a valid Gemini API key
  3. Try the payment process again
  4. Check browser console for specific errors

#### **"Invalid API key"**
- **Solution**: 
  1. Get a new API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
  2. Ensure the key starts with "AIza"
  3. Use the "Test API Key" button in the payment page
  4. Open `test-api.html` for detailed API key testing
  5. Check if your API key has quota and is not disabled

### 🎯 Usage Issues

#### **"Extension not working on Google Meet"**
- **Check**: 
  1. Ensure you're on `meet.google.com`
  2. Check if payment is completed
  3. Press `Ctrl+Shift+M` to request microphone permission
  4. Press `Ctrl+Shift+Y` to toggle voice listening

#### **"No answer generated"**
- **Check**: 
  1. Verify your question was detected (check console logs)
  2. Ensure API key is valid and has quota
  3. Check if answer was copied to clipboard
  4. Try pressing `Ctrl+V` to paste the answer

## 🧪 Testing Steps

### **Step 1: API Key Test**
1. Open `test-api.html` in your browser
2. Enter your Gemini API key
3. Click "Test API Key"
4. Check the log for detailed results

### **Step 2: Basic Voice Test**
1. Open `test-voice.html` in your browser
2. Click "Start Voice Recognition"
3. Speak clearly into your microphone
4. Verify voice is detected

### **Step 3: Extension Test**
1. Open `test-extension.html` in your browser
2. Check if extension is detected
3. Verify payment status
4. Test voice recognition through extension

### **Step 3: Google Meet Test**
1. Navigate to `meet.google.com`
2. Press `Ctrl+Shift+T` to test voice recognition
3. Speak a question
4. Check if answer is generated and copied

## 🔍 Debug Information

### **Console Logs**
Open browser console (F12) and look for:
- `[Stealth AI]` prefixed messages
- Voice recognition events
- API call responses
- Error messages

### **Extension Status**
Check extension status in `chrome://extensions/`:
- Extension should be enabled
- No error messages should be shown
- Permissions should be granted

### **Network Tab**
In Developer Tools > Network tab:
- Look for requests to `generativelanguage.googleapis.com`
- Check response status codes
- Verify request payload format

## 📞 Getting Help

### **Before Asking for Help**
1. ✅ Try the troubleshooting steps above
2. ✅ Check the console for error messages
3. ✅ Test with the provided test pages
4. ✅ Verify your API key is valid

### **When Reporting Issues**
Please include:
- Browser version and OS
- Extension version
- Console error messages
- Steps to reproduce the issue
- What you expected vs what happened

### **Common Solutions**
- **Reload extension**: Go to `chrome://extensions/` and click reload
- **Clear browser cache**: Clear cache and cookies
- **Restart browser**: Close and reopen Chrome
- **Check permissions**: Ensure microphone and extension permissions are granted

---

**Still having issues?** Check the console logs and provide the specific error messages for better assistance. 