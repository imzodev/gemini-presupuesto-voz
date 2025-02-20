import { useState } from 'react';
import { VoiceRecorder } from './VoiceRecorder';
import { transcribeAudio, initializeGemini } from '../utils/geminiApi';

interface VoiceToTextProps {
  onTranscriptionComplete?: (text: string) => void;
}

export function VoiceToText({ onTranscriptionComplete }: VoiceToTextProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setError(null);
    
    try {
      // Initialize Gemini API with your API key
      // In production, this should be stored in environment variables
      initializeGemini(import.meta.env.VITE_GEMINI_API_KEY);

      const text = await transcribeAudio(audioBlob);
      setTranscription(text);
      onTranscriptionComplete?.(text);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="space-y-4">
      <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
      
      {isTranscribing && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-600">Transcribing...</span>
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}
      
      {transcription && !isTranscribing && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Transcription:</h3>
          <p className="text-gray-600">{transcription}</p>
        </div>
      )}
    </div>
  );
}
