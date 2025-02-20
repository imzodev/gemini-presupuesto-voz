import { useState } from 'react';
import { VoiceRecorder } from './VoiceRecorder';
import { transcribeAudio, generateSqlFromText, QueryResponse, initializeGemini } from '../utils/geminiApi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface QueryResult {
  results: any[];
  visualization: 'graph' | 'text';
  graphType?: 'bar' | 'line' | 'pie';
  description: string;
}

interface VoiceToTextProps {
  onClose?: () => void;
}

export function VoiceToText({ onClose }: VoiceToTextProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [sqlQuery, setSqlQuery] = useState<QueryResponse | null>(null);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setError(null);
    setQueryResult(null);
    
    try {

      // Initialize Gemini API with your API key
      // In production, this should be stored in environment variables
      initializeGemini(import.meta.env.VITE_GEMINI_API_KEY);

      const text = await transcribeAudio(audioBlob);
      setTranscription(text);
      
      // Generate SQL from transcribed text
      setIsProcessing(true);
      const queryResponse = await generateSqlFromText(text);
      console.log('Generated SQL query:', queryResponse);
      setSqlQuery(queryResponse);
      
      // Execute the SQL query
      const response = await fetch('http://localhost:3000/api/voice-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryResponse),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to execute query: ${errorData.error}\n` +
          `SQL: ${errorData.sql}\n` +
          (errorData.details ? `Details: ${errorData.details}` : '')
        );
      }
      
      const result = await response.json();
      console.log(result);
      
      setQueryResult(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process voice command');
    } finally {
      setIsTranscribing(false);
      setIsProcessing(false);
    }
  };

  const renderChart = () => {
    if (!queryResult || queryResult.visualization !== 'graph' || !queryResult.results.length) {
      return null;
    }

    const data = queryResult.results;
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    switch (queryResult.graphType) {
      case 'bar':
        return (
          <BarChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        );
      
      case 'line':
        return (
          <LineChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        );
      
      case 'pie':
        return (
          <PieChart width={500} height={300}>
            <Pie
              data={data}
              cx={250}
              cy={150}
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Voice Command</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
      
      {(isTranscribing || isProcessing) && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-600">
            {isTranscribing ? 'Transcribing...' : 'Processing command...'}
          </span>
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-500 p-4 bg-red-50 rounded-lg space-y-2">
          <p className="font-semibold">Error:</p>
          <pre className="whitespace-pre-wrap font-mono text-xs">
            {error}
          </pre>
        </div>
      )}
      
      {transcription && !isTranscribing && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Voice Command:</h3>
          <p className="text-gray-600">{transcription}</p>
        </div>
      )}

      {sqlQuery && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Generated SQL Query:</h3>
          <pre className="text-sm bg-gray-800 text-white p-4 rounded overflow-x-auto">
            {sqlQuery.sql}
          </pre>
          <p className="text-gray-600 mt-2">
            <strong>Visualization:</strong> {sqlQuery.visualization}
            {sqlQuery.graphType && ` (${sqlQuery.graphType})`}
          </p>
          <p className="text-gray-600">
            <strong>Description:</strong> {sqlQuery.description}
          </p>
        </div>
      )}

      {queryResult && (
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-medium text-gray-700 mb-2">{queryResult.description}</h3>
          
          {queryResult.visualization === 'text' ? (
            <div className="text-2xl font-bold text-gray-900">
              {queryResult.results[0]?.total || queryResult.results[0]?.value || JSON.stringify(queryResult.results)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {renderChart()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
