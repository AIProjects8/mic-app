import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const audioStream = useRef(null);

  const requestMicrophonePermission = async () => {
    try {
      // First check if we can access the mediaDevices API
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      // Request microphone access with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      audioStream.current = stream;
      setHasPermission(true);
      setPermissionError('');
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setHasPermission(false);
      setPermissionError('Please allow microphone access in your browser settings. Then click Retry.');
      return false;
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      const permissionGranted = await requestMicrophonePermission();
      if (!permissionGranted) {
        return;
      }
    }

    try {
      // Create a new MediaRecorder instance each time
      mediaRecorder.current = new MediaRecorder(audioStream.current, {
        mimeType: 'audio/webm'
      });
      
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setPermissionError('Error starting recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorder.current) return;

    return new Promise(resolve => {
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        
        // Create form data
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.wav');
        formData.append('model', 'whisper-1');
        formData.append('language', 'pl');

        setIsLoading(true);
        try {
          const apiKey = process.env.OPENAI_API_KEY;
          if (!apiKey) {
            throw new Error('OpenAI API key is missing. Please check your .env file.');
          }

          const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
          }

          const data = await response.json();
          setResponse(data.text);
        } catch (error) {
          console.error('Error details:', error);
          setResponse(`Error: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    });
  };

  return (
    <div className="App">
      <div className="container">
        {!hasPermission && (
          <button 
            onClick={requestMicrophonePermission}
            className="permission-button"
          >
            Enable Microphone
          </button>
        )}
        {permissionError && (
          <div className="permission-error">
            {permissionError}
            <button 
              onClick={requestMicrophonePermission}
              className="retry-button"
            >
              Retry Permission
            </button>
          </div>
        )}
        <button
          className={`record-button ${isRecording ? 'recording' : ''}`}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          disabled={isLoading || !hasPermission}
        >
          {!hasPermission ? 'Waiting for Microphone Permission...' : 
           isRecording ? 'Recording...' : 
           isLoading ? 'Processing...' : 
           'Hold to Record'}
        </button>
        
        <div className="response-box">
          <h3>Transcribed Text:</h3>
          <pre>{response || (isLoading ? 'Processing your speech...' : 'No transcription yet')}</pre>
        </div>
      </div>
    </div>
  );
}

export default App; 