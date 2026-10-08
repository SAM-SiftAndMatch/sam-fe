import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { useAuthStore } from './stores/useAuthStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <BrowserRouter>
          <AppRoutes />
          <Analytics />
        </BrowserRouter>
      </div>
    </QueryClientProvider>
  );
}

export default App;
