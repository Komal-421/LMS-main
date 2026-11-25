import { StrictMode, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import './index.css';
import { resetAllCaches } from './store/slices/coursesSlice';
import { store } from './store/store';

function RootProviders() {
  const handleLogout = useCallback(() => {
    store.dispatch(resetAllCaches());
  }, []);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider onLogout={handleLogout}>
            <App />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </Provider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootProviders />
  </StrictMode>
);
