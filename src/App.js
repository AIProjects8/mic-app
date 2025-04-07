import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Request microphone permission on first load
    if (hasPermission === null) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          setHasPermission(true);
        })
        .catch(() => {
          setHasPermission(false);
        });
    }
  }, [hasPermission]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
      };
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();
      setTranscription(data.text);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setTranscription('Error transcribing audio. Please try again.');
    }
  };

  if (hasPermission === false) {
    return (
      <div className="app">
        <h1>Microphone Access Required</h1>
        <p>Please enable microphone access to use this application.</p>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Voice Recorder</h1>
      <button
        className={`record-button ${isRecording ? 'recording' : ''}`}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
      >
        {isRecording ? 'Recording...' : 'Record'}
      </button>
      <div className="transcription-box">
        <h2>Transcription:</h2>
        <p>{transcription || 'Your transcription will appear here...'}</p>
      </div>
    </div>
  );
}

export default App; 