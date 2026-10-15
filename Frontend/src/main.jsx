import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            fontSize: '14px',
                            background: '#241A12',
                            color: '#E8D5B5',
                            border: '1px solid rgba(232, 213, 181, 0.14)',
                        },
                    }}
                />
                <App />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);
