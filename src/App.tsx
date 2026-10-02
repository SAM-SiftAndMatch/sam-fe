import { Analytics } from '@vercel/analytics/react';
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { useAuthStore } from './stores/useAuthStore';

function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

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
