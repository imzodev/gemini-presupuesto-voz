# Budget Voice Assistant App

A modern budget tracking application built with React, TypeScript, and Vite. Features include expense tracking, category management, data visualization, and voice command capabilities using Google's Gemini AI.

## Features

- 💰 Track expenses and income
- 📊 Visual data representation with charts
- 🗂️ Category-based organization
- 🎤 Voice command support using Gemini AI
- 💾 SQLite database for data persistence
- 🎯 Real-time budget tracking

## Prerequisites

- Node.js (v18 or higher)
- Bun (recommended) or npm
- Google Gemini API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd gemini-presupuesto-voz
```

2. Install dependencies:
```bash
# Using Bun (recommended)
bun install

# Using npm
npm install
```

3. Create a `.env` file in the root directory and add your Gemini API key:
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

## Running the Application

1. Start the backend server:
```bash
# Using Bun
bun server/index.ts

# Using npm
npm run server
```

2. In a new terminal, start the frontend development server:
```bash
# Using Bun
bun dev

# Using npm
npm run dev
```

The application will be available at `http://localhost:5173`

## Using Voice Commands

1. Click the "Voice Report" button in the dashboard
2. Allow microphone access when prompted
3. Click "Start Recording" and speak your command
4. Click "Stop Recording" when finished
5. Wait for the transcription and response

