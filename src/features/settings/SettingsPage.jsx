import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, TextField, Button, Grid, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, FormGroup, FormControlLabel,
    Checkbox, Alert, AlertTitle,
} from '@mui/material';
import { Save, DeleteForever, CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';

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

    // Factory Reset State
    const [resetDialog, setResetDialog] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [resetOptions, setResetOptions] = useState({
        customers: false,
        sessions: false,
        transactions: false,
        customerPackages: false,
        packages: false,
        beverages: false,
        settings: false
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

    const handleOptionChange = (option) => {
        setResetOptions({ ...resetOptions, [option]: !resetOptions[option] });
    };

    const handleSelectAll = () => {
        const allSelected = Object.values(resetOptions).every(v => v);
        const newOptions = {};
        Object.keys(resetOptions).forEach(k => newOptions[k] = !allSelected);
        setResetOptions(newOptions);
    };

    const handleFactoryReset = async () => {
        if (confirmText !== 'حذف') {
            alert('يرجى كتابة كلمة "حذف" للتأكيد');
            return;
        }

        try {
            await electronAPI.factoryReset(resetOptions);
            alert('تم إعادة ضبط البيانات بنجاح');
            setConfirmDialog(false);
            setResetDialog(false);
            setConfirmText('');
            loadSettings(); // Reload settings in case they were reset
        } catch (error) {
            alert('حدث خطأ أثناء إعادة الضبط: ' + error.message);
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>الإعدادات</Typography>

            <Card elevation={1} sx={{ border: '1px solid', borderColor: 'neutral.200' }}>
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

            {/* Factory Reset Section */}
            <Card sx={{ mt: 4, border: '2px solid', borderColor: 'error.main' }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6" color="error" sx={{ fontWeight: 700 }}>إعادة ضبط المصنع</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                يمكنك حذف البيانات بشكل انتقائي أو إعادة البرنامج لحالة المصنع بالكامل.
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteForever />}
                            onClick={() => setResetDialog(true)}
                        >
                            إعادة ضبط البيانات
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Selection Dialog */}
            <Dialog open={resetDialog} onClose={() => setResetDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>اختيار البيانات للحذف</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <AlertTitle>تنبيه هام</AlertTitle>
                        البيانات المحذوفة لا يمكن استرجاعها مرة أخرى. يرجى اختيار ما تريد حذفه بعناية.
                    </Alert>

                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            size="small"
                            onClick={handleSelectAll}
                            startIcon={Object.values(resetOptions).every(v => v) ? <CheckBox /> : <CheckBoxOutlineBlank />}
                        >
                            {Object.values(resetOptions).every(v => v) ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                        </Button>
                    </Box>

                    <FormGroup>
                        <FormControlLabel control={<Checkbox checked={resetOptions.customers} onChange={() => handleOptionChange('customers')} />} label="حذف العملاء" />
                        <FormControlLabel control={<Checkbox checked={resetOptions.sessions} onChange={() => handleOptionChange('sessions')} />} label="حذف الجلسات والسجلات" />
                        <FormControlLabel control={<Checkbox checked={resetOptions.transactions} onChange={() => handleOptionChange('transactions')} />} label="حذف المعاملات المالية" />
                        <FormControlLabel control={<Checkbox checked={resetOptions.customerPackages} onChange={() => handleOptionChange('customerPackages')} />} label="حذف اشتراكات العملاء" />
                        <Divider sx={{ my: 1 }} />
                        <FormControlLabel control={<Checkbox color="error" checked={resetOptions.packages} onChange={() => handleOptionChange('packages')} />} label="حذف الباقات (تحذير)" />
                        <FormControlLabel control={<Checkbox color="error" checked={resetOptions.beverages} onChange={() => handleOptionChange('beverages')} />} label="حذف المشروبات (تحذير)" />
                        <FormControlLabel control={<Checkbox color="error" checked={resetOptions.settings} onChange={() => handleOptionChange('settings')} />} label="إعادة ضبط الإعدادات للوضع الافتراضي" />
                    </FormGroup>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResetDialog(false)}>إلغاء</Button>
                    <Button
                        variant="contained"
                        color="error"
                        disabled={!Object.values(resetOptions).some(v => v)}
                        onClick={() => setConfirmDialog(true)}
                    >
                        متابعة
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>تأكيد الحذف النهائي</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" paragraph>
                        أنت على وشك حذف البيانات المحددة بشكل نهائي.
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        اكتب كلمة <strong>"حذف"</strong> للتأكيد:
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        color="error"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="حذف"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog(false)}>تراجع</Button>
                    <Button
                        variant="contained"
                        color="error"
                        disabled={confirmText !== 'حذف'}
                        onClick={handleFactoryReset}
                    >
                        تأكيد وحذف
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}

export default SettingsPage;
