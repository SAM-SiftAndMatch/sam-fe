import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <BrowserRouter>
        <AppRoutes />
        <Analytics />
      </BrowserRouter>
    </div>
  );
}

export default App;
