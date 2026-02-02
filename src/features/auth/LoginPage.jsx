import React, { useState } from 'react';
import {
    Container,
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';

function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // تسجيل دخول بسيط (admin/admin123)
        if (username === 'admin' && password === 'admin123') {
            onLogin();
        } else {
            setError('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1565C0 0%, #42a5f5 100%)',
            }}
        >
            <Container maxWidth="sm">
                <Card elevation={10}>
                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Typography
                                variant="h3"
                                component="h1"
                                gutterBottom
                                sx={{
                                    fontWeight: 700,
                                    color: 'primary.main',
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                حورس
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                نظام إدارة مساحات العمل المشتركة
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="اسم المستخدم"
                                variant="outlined"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                sx={{ mb: 2 }}
                                autoFocus
                                required
                            />

                            <TextField
                                fullWidth
                                label="كلمة المرور"
                                type="password"
                                variant="outlined"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{ mb: 3 }}
                                required
                            />

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                startIcon={<LoginIcon />}
                                sx={{
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600
                                }}
                            >
                                تسجيل الدخول
                            </Button>
                        </form>

                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                المستخدم الافتراضي: admin / admin123
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}

export default LoginPage;
