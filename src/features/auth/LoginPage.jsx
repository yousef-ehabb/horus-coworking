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
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
            }}
        >
            <Container maxWidth="xs">
                <Card elevation={10} sx={{ borderRadius: 4 }}>
                    <CardContent sx={{ p: 5 }}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            {/* App Icon */}
                            <Box
                                component="img"
                                src="./icon.png"
                                alt="Horus Icon"
                                sx={{
                                    height: 80,
                                    width: 80,
                                    mb: 2,
                                    borderRadius: 3,
                                }}
                            />
                            <Typography variant="h4" fontWeight="800" color="primary.main" gutterBottom>
                                حورس
                            </Typography>
                            <Typography variant="body1" color="text.secondary" fontWeight="500">
                                نظام إدارة مساحات العمل
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
