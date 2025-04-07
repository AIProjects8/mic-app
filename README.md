# Mic App

A React-based web application that allows users to record audio using their device's microphone and transcribe it to text using OpenAI's Whisper API.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (comes with Node.js)
- A modern web browser (Chrome, Safari, Firefox, etc.)
- An OpenAI API key for the Whisper transcription service

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and add your OpenAI API key:
```bash
OPENAI_API_KEY=your_api_key_here
```

## Running the Application

### Development Mode

1. Start the development server:
```bash
npm start
```

2. The application will open in your default browser at `http://localhost:3000`

### Accessing from Mobile Devices

To use the microphone feature on mobile devices, you need to access the application over HTTPS. The development server will automatically start in HTTPS mode with a self-signed certificate.

1. Find your computer's local IP address (e.g., 192.168.x.x)
2. Access the application from your mobile device using:
```
https://your-local-ip:3000
```

Note: You may need to accept the security warning about the self-signed certificate on your mobile device.

## Features

- Real-time audio recording
- Speech-to-text transcription using OpenAI's Whisper API
- Mobile-friendly interface
- PWA support for installation on mobile devices

## Troubleshooting

### Microphone Access

- Make sure you've granted microphone permissions in your browser
- On mobile devices, ensure you're accessing the site via HTTPS
- If using iOS, make sure you've enabled microphone access in your device settings

### Common Issues

1. "Not Secure" warning:
   - This is normal when using self-signed certificates in development
   - Click "Advanced" and then "Proceed" to access the site

2. Microphone not working:
   - Check browser permissions
   - Ensure no other application is using the microphone
   - Try refreshing the page

## License

MIT