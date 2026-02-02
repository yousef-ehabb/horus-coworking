import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { arEG } from '@mui/material/locale';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import MainLayout from './layouts/MainLayout';

// إنشاء Theme مخصص مع دعم RTL
const theme = createTheme(
    {
        direction: 'rtl',
        palette: {
            mode: 'light',
            primary: {
                main: '#1565C0', // أزرق ملكي
                light: '#42a5f5',
                dark: '#0d47a1',
            },
            secondary: {
                main: '#FFD700', // ذهبي
                light: '#ffeb3b',
                dark: '#ffc107',
            },
            success: {
                main: '#4caf50',
            },
            error: {
                main: '#f44336',
            },
            background: {
                default: '#f5f5f5',
                paper: '#ffffff',
            },
        },
        typography: {
            fontFamily: 'Cairo, Arial, sans-serif',
            fontSize: 14,
            h1: { fontWeight: 700 },
            h2: { fontWeight: 700 },
            h3: { fontWeight: 600 },
            h4: { fontWeight: 600 },
            h5: { fontWeight: 500 },
            h6: { fontWeight: 500 },
        },
        shape: {
            borderRadius: 8,
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        fontWeight: 600,
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    },
                },
            },
        },
    },
    arEG
);

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // التحقق من حالة تسجيل الدخول
        const authStatus = localStorage.getItem('isAuthenticated');
        setIsAuthenticated(authStatus === 'true');
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div dir="rtl" style={{ minHeight: '100vh' }}>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            isAuthenticated ?
                                <Navigate to="/" replace /> :
                                <LoginPage onLogin={handleLogin} />
                        }
                    />
                    <Route
                        path="/*"
                        element={
                            isAuthenticated ?
                                <MainLayout onLogout={handleLogout} /> :
                                <Navigate to="/login" replace />
                        }
                    />
                </Routes>
            </div>
        </ThemeProvider>
    );
}

export default App;
