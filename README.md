# Stealth AI Interview Assistant – Gemini Pro Edition

A Chrome Extension that provides AI-powered interview assistance with complete stealth mode functionality.

## 🚀 Features

- **🎙️ Real-time Voice Recognition**: Automatically captures questions from Google Meet
- **🤖 AI-Powered Answers**: Uses Google's Gemini Pro API for intelligent responses
- **📋 Automatic Clipboard**: Copies answers directly to clipboard for easy pasting
- **👻 Complete Stealth Mode**: No visible UI during screen sharing
- **💰 One-Time Payment**: $5 lifetime access with secure Razorpay integration
- **⌨️ Keyboard Shortcuts**: Ctrl+Shift+Y to toggle voice listening
- **🔒 Secure**: API keys stored locally, no data transmitted

## 📋 Requirements

- Google Chrome browser
- Gemini API key (free from [Google AI Studio](https://makersuite.google.com/app/apikey))
- Microphone permission
- $5 one-time payment

## 🛠️ Installation

### Method 1: Load Unpacked Extension

1. **Download the extension files** to your computer
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top right)
4. **Click "Load unpacked"** and select the extension folder
5. **Grant permissions** when prompted

### Method 2: From Source Code

1. **Clone or download** this repository
2. **Create icon files** (see Icon Requirements below)
3. **Update API keys** in `payment.js` (replace `rzp_test_xxxxxxxx`)
4. **Load as unpacked extension** in Chrome

## 🎯 Usage

### First Time Setup

1. **Click the extension icon** in Chrome toolbar
2. **Enter your Gemini API key** in the payment form
3. **Complete the $5 payment** via Razorpay
4. **Grant microphone permission** when prompted

### During Interviews

1. **Navigate to Google Meet** (`meet.google.com`)
2. **Press Ctrl+Shift+Y** to start voice listening
3. **Wait for questions** - the extension will automatically detect them
4. **Answers are copied to clipboard** - paste with Ctrl+V
5. **Press Ctrl+Shift+Y again** to stop listening

### Keyboard Shortcuts

- **Ctrl+Shift+Y**: Toggle voice listening on/off
- **Ctrl+Shift+M**: Manually request microphone permission

## 🔧 Configuration

### API Keys

1. **Gemini API Key**: Get free key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Razorpay Key**: Replace `rzp_test_xxxxxxxx` in `payment.js` with your actual test key

### Customization

- **Voice Language**: Change `recognition.lang` in `service_worker.js`
- **Payment Amount**: Modify `amount` variable in `payment.js`
- **UI Colors**: Update CSS variables in `payment.css`

## 📁 File Structure

```
stealth-ai-assistant/
├── manifest.json          # Extension configuration
├── service_worker.js      # Background service worker
├── content_script.js      # Google Meet page script
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── payment.html          # Payment page
├── payment.css           # Payment page styles
├── payment.js            # Payment processing
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon48-active.png
└── README.md             # This file
```

## 🎨 Icon Requirements

You need to create actual PNG icon files:

- **icon16.png**: 16x16 pixels
- **icon48.png**: 48x48 pixels  
- **icon128.png**: 128x128 pixels
- **icon48-active.png**: 48x48 pixels (green/active state)

## 🔒 Security Features

- **Local Storage**: API keys stored in Chrome's secure local storage
- **No Data Transmission**: Voice data processed locally, never stored
- **CSP Compliance**: Follows Chrome Extension security policies
- **Permission Minimal**: Only requests necessary permissions

## 🚨 Important Notes

### Chrome Extension Limitations

- **Manifest V3**: Uses latest Chrome extension standards
- **Service Worker**: Background script limitations apply
- **CSP Restrictions**: Cannot load external scripts in extension pages
- **Microphone Permission**: Requires user gesture to initiate

### Production Deployment

1. **Replace test keys** with production Razorpay keys
2. **Create proper icons** for all sizes
3. **Test thoroughly** on different Chrome versions
4. **Submit to Chrome Web Store** for distribution

## 🐛 Troubleshooting

### Common Issues

**"Microphone permission denied"**
- Click the extension icon and try again
- Check Chrome's microphone permissions in settings

**"Payment failed"**
- Ensure you have a valid Gemini API key
- Check internet connection
- Verify Razorpay test keys are correct

**"Voice not detected"**
- Press Ctrl+Shift+M to manually request permission
- Ensure you're on a Google Meet page
- Check that microphone is working in other applications

**"Extension not working"**
- Reload the extension in `chrome://extensions/`
- Check browser console for error messages
- Verify all files are present in the extension folder

### Debug Mode

Enable debug logging by adding this to `service_worker.js`:
```javascript
const DEBUG = true;
if (DEBUG) console.log('Debug message');
```

### Voice Recognition Testing

1. **Test Page**: Open `test-voice.html` in your browser to test voice recognition
2. **Manual Test**: Press `Ctrl+Shift+T` on Google Meet to test voice recognition
3. **Check Console**: Open browser console (F12) to see detailed logs
4. **Microphone Permission**: Ensure microphone access is granted

### Common Voice Issues

**"No voice detected"**
- Check microphone permissions in Chrome settings
- Try the test page first: `test-voice.html`
- Ensure you're speaking clearly and loudly
- Check if microphone works in other applications

**"Speech recognition not supported"**
- Update Chrome to latest version
- Try on a different browser (Chrome works best)
- Check if HTTPS is required (some browsers need secure connection)

**"Permission denied"**
- Click the microphone icon in Chrome's address bar
- Go to Chrome Settings > Privacy and Security > Site Settings > Microphone
- Allow microphone access for meet.google.com

## 📞 Support

- **Email**: support@stealthai.com
- **Issues**: Create GitHub issue for bugs
- **Documentation**: Check Chrome Extension documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This extension is for educational and legitimate interview preparation purposes only. Users are responsible for complying with their organization's policies and ethical guidelines regarding interview assistance tools.

---

**Built with ❤️ for productive interviews** 