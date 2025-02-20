import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'

console.log('main.tsx executing');

try {
  const rootElement = document.getElementById('root');
  console.log('Root element:', rootElement);

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);
  console.log('Root created');

  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
  console.log('Render called');
} catch (error) {
  console.error('Error in main.tsx:', error);
}
