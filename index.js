// index.js

// Request tab audio capture
chrome.runtime.sendMessage({ action: 'startTabCapture' });

// Listen for messages from background/service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startTabAudioProcessing') {
        startAudioProcessing();
    }
});

function startAudioProcessing() {
    // This function will be called after tabCapture is started in the background
    // You need to get the MediaStream and process it
    chrome.tabCapture.capture({ audio: true, video: false }, function(stream) {
        if (!stream) {
            console.error('Failed to capture tab audio');
            return;
        }
        // Use Web Audio API to process the stream
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);

        // You can use a ScriptProcessorNode or AudioWorklet to analyze audio
        // For demo, let's just log that we have the stream
        console.log('Tab audio stream captured:', stream);

        // TODO: Integrate with a speech-to-text API to transcribe the audio
        // Then send the transcription to Gemini API as you do for user input
    });
}
