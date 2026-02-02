import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, TextField, Button, Grid, Divider,
} from '@mui/material';
import { Save } from '@mui/icons-material';

const { electronAPI } = window;

function SettingsPage() {
    const [settings, setSettings] = useState({
        student_hourly_rate: '',
        employee_hourly_rate: '',
        space_name: '',
        space_address: '',
        space_phone: '',
        currency: 'EGP',
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await electronAPI.getSettings();
            setSettings(data);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const handleSave = async () => {
        try {
            for (const [key, value] of Object.entries(settings)) {
                await electronAPI.updateSetting(key, value);
            }
            alert('تم حفظ الإعدادات بنجاح');
        } catch (error) {
            alert('حدث خطأ في الحفظ');
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>الإعدادات</Typography>

            <Card elevation={3}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>معلومات المساحة</Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="اسم المساحة" value={settings.space_name || ''}
                                onChange={(e) => setSettings({ ...settings, space_name: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="رقم الهاتف" value={settings.space_phone || ''}
                                onChange={(e) => setSettings({ ...settings, space_phone: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="العنوان" value={settings.space_address || ''}
                                onChange={(e) => setSettings({ ...settings, space_address: e.target.value })} />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>أسعار الساعات</Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="سعر الساعة للطلاب (جنيه)" type="number"
                                value={settings.student_hourly_rate || ''}
                                onChange={(e) => setSettings({ ...settings, student_hourly_rate: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="سعر الساعة للموظفين (جنيه)" type="number"
                                value={settings.employee_hourly_rate || ''}
                                onChange={(e) => setSettings({ ...settings, employee_hourly_rate: e.target.value })} />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4, textAlign: 'right' }}>
                        <Button variant="contained" size="large" startIcon={<Save />} onClick={handleSave}>
                            حفظ جميع الإعدادات
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default SettingsPage;
