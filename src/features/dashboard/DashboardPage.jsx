import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, TextField, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem, Alert, AlertTitle, ListSubheader, Autocomplete,
} from '@mui/material';
import {
    PlayArrow, Stop, LocalCafe, TrendingUp, People, CardGiftcard, AttachMoney,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import InvoiceDialog from '../sessions/InvoiceDialog';

const { electronAPI } = window;

function DashboardPage() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [activeSessions, setActiveSessions] = useState([]);
    const [newCustomerDialog, setNewCustomerDialog] = useState(false);
    const [newCustomerData, setNewCustomerData] = useState({ name: '', type: 'student' });
    const [foundCustomer, setFoundCustomer] = useState(null);
    const [stats, setStats] = useState({ revenue: 0, sessions: 0, customers: 0, packages: 0 });
    const [beverageDialog, setBeverageDialog] = useState({ open: false, session: null });
    const [beverages, setBeverages] = useState([]);
    const [selectedBeverage, setSelectedBeverage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [invoiceDialog, setInvoiceDialog] = useState({ open: false, sessionId: null });
    const [endDialog, setEndDialog] = useState({ open: false, session: null });
    const [endData, setEndData] = useState({ paymentMethod: 'cash', notes: '' });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        loadActiveSessions();
        loadStats();
        loadBeverages();
        const interval = setInterval(loadActiveSessions, 5000);
        return () => clearInterval(interval);
    }, []);

    const loadBeverages = async () => {
        try {
            const data = await electronAPI.getBeverages();
            setBeverages(data.filter(b => b.is_available));
        } catch (error) {
            console.error('Error loading beverages:', error);
        }
    };

    const loadActiveSessions = async () => {
        try {
            const sessions = await electronAPI.getActiveSessions();
            setActiveSessions(sessions);
        } catch (error) {
            console.error('Error loading sessions:', error);
        }
    };

    const loadStats = async () => {
        try {
            const report = await electronAPI.getDailyReport();
            setStats({
                revenue: report.totalRevenue,
                sessions: report.sessionsCount,
                customers: report.newCustomers,
                packages: report.packagesSold,
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handlePhoneChange = async (e) => {
        const phone = e.target.value;
        setPhoneNumber(phone);

        if (phone.length === 11) {
            try {
                const customer = await electronAPI.getCustomerByPhone(phone);
                setFoundCustomer(customer || null);
            } catch (error) {
                setFoundCustomer(null);
            }
        } else {
            setFoundCustomer(null);
        }
    };

    const handleStartSession = async () => {
        if (phoneNumber.length !== 11) {
            alert('يرجى إدخال رقم هاتف صحيح (11 رقم)');
            return;
        }

        if (foundCustomer) {
            await startSession(foundCustomer);
        } else {
            setNewCustomerDialog(true);
        }
    };

    const startSession = async (customer) => {
        try {
            await electronAPI.createSession({
                customerId: customer.id,
                customerName: customer.name,
                customerPhone: customer.phone,
                customerType: customer.type,
                startTime: new Date().toISOString(),
            });

            setPhoneNumber('');
            setFoundCustomer(null);
            loadActiveSessions();
        } catch (error) {
            alert('حدث خطأ في بدء الجلسة');
        }
    };

    const handleCreateAndStart = async () => {
        if (!newCustomerData.name) {
            alert('يرجى إدخال اسم العميل');
            return;
        }

        try {
            const customer = await electronAPI.createCustomer({
                name: newCustomerData.name,
                phone: phoneNumber,
                type: newCustomerData.type,
            });

            await startSession(customer);
            setNewCustomerDialog(false);
            setNewCustomerData({ name: '', type: 'student' });
        } catch (error) {
            alert('حدث خطأ');
        }
    };

    const getElapsedTime = (startTime) => {
        const elapsed = currentTime - new Date(startTime).getTime();
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getExpectedCost = (session) => {
        const elapsed = currentTime - new Date(session.start_time).getTime();
        const hours = elapsed / 3600000;
        const timeCost = hours * session.hourly_rate;
        const beveragesCost = session.beverages_cost || 0;
        return (timeCost + beveragesCost).toFixed(2);
    };

    const handleAddBeverage = async () => {
        if (!selectedBeverage || quantity < 1) {
            alert('يرجى اختيار المشروب والكمية');
            return;
        }

        try {
            await electronAPI.addBeverageToSession(
                beverageDialog.session.id,
                selectedBeverage,
                quantity
            );
            setBeverageDialog({ open: false, session: null });
            setSelectedBeverage('');
            setQuantity(1);
            loadActiveSessions();
        } catch (error) {
            alert('حدث خطأ في إضافة المشروب');
        }
    };

    const handleEndSession = async () => {
        try {
            await electronAPI.endSession(endDialog.session.id, {
                endTime: new Date().toISOString(),
                paymentMethod: endData.paymentMethod,
                notes: endData.notes,
            });
            const sessionId = endDialog.session.id;
            setEndDialog({ open: false, session: null });
            setEndData({ paymentMethod: 'cash', notes: '' });
            loadActiveSessions();
            loadStats();
            // Show invoice after ending session
            setInvoiceDialog({ open: true, sessionId });
        } catch (error) {
            alert('حدث خطأ');
        }
    };

    const calculateElapsed = (startTime) => {
        const elapsed = Date.now() - new Date(startTime).getTime();
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    };

    // تحديد رسالة التنبيه بناءً على حالة العميل
    const getCustomerAlert = () => {
        if (!foundCustomer) return null;

        const rate = foundCustomer.type === 'student' ? 20 : 30;

        if (foundCustomer.active_package_id) {
            return (
                <Alert severity="info" sx={{ mt: 2 }}>
                    <AlertTitle><strong>{foundCustomer.name}</strong> - {foundCustomer.type === 'student' ? 'طالب' : 'موظف'}</AlertTitle>
                    ✅ لديه باقة نشطة: <strong>{foundCustomer.package_name}</strong><br />
                    الساعات المتبقية: <strong>{foundCustomer.remaining_hours} ساعة</strong><br />
                    سيتم الخصم من الباقة
                </Alert>
            );
        } else {
            return (
                <Alert severity="warning" sx={{ mt: 2 }}>
                    <AlertTitle><strong>{foundCustomer.name}</strong> - {foundCustomer.type === 'student' ? 'طالب' : 'موظف'}</AlertTitle>
                    ⚠️ بدون باقة - سيتم احتساب الجلسة بسعر الساعة<br />
                    السعر: <strong>{rate} جنيه/ساعة</strong>
                </Alert>
            );
        }
    };

    return (
        <Box>
            {/* نموذج بدء جلسة سريع */}
            <Card elevation={4} sx={{
                mb: 3,
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                color: 'white',
                borderRadius: 4
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 800 }}>
                        🚀 بدء جلسة جديدة
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <TextField
                            fullWidth
                            label="رقم الهاتف"
                            placeholder="01xxxxxxxxx"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            inputProps={{ maxLength: 11 }}
                            sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        />

                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<PlayArrow />}
                            onClick={handleStartSession}
                            disabled={phoneNumber.length !== 11}
                            sx={{
                                minWidth: 180,
                                height: 56,
                                backgroundColor: '#FFD600',
                                color: '#000',
                                fontWeight: 800,
                                fontSize: '1.1rem',
                                borderRadius: 2,
                                '&:hover': { backgroundColor: '#FFC400' },
                            }}
                        >
                            بدء الجلسة
                        </Button>
                    </Box>

                    {getCustomerAlert()}
                </CardContent>
            </Card>

            {/* الجلسات النشطة */}
            <Card elevation={1} sx={{ mb: 3, border: '1px solid', borderColor: 'neutral.200' }}>
                <CardContent>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
                        👥 الجلسات النشطة ({activeSessions.length})
                    </Typography>

                    {activeSessions.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 5 }}>
                            <Typography variant="h6" color="text.secondary">لا توجد جلسات نشطة</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>ابدأ جلسة جديدة من الأعلى</Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>الاسم</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>النوع</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>وقت البدء</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>الوقت المنقضي</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>التكلفة المتوقعة</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>الإجراءات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {activeSessions.map((session) => (
                                        <TableRow key={session.id} hover>
                                            <TableCell sx={{ fontWeight: 600 }}>{session.customer_name}</TableCell>
                                            <TableCell>
                                                <Chip label={session.customer_type === 'student' ? 'طالب' : 'موظف'}
                                                    color={session.customer_type === 'student' ? 'info' : 'warning'} size="small" />
                                            </TableCell>
                                            <TableCell>{dayjs(session.start_time).format('hh:mm A')}</TableCell>
                                            <TableCell>
                                                <Chip label={getElapsedTime(session.start_time)} color="primary" variant="outlined"
                                                    sx={{ fontWeight: 600, fontFamily: 'monospace' }} />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: 'success.main' }}>
                                                    {getExpectedCost(session)} جنيه
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <IconButton size="small" color="secondary"
                                                        onClick={() => setBeverageDialog({ open: true, session })}
                                                        title="إضافة مشروب">
                                                        <LocalCafe />
                                                    </IconButton>
                                                    <IconButton size="small" color="error"
                                                        onClick={() => setEndDialog({ open: true, session })}
                                                        title="إنهاء الجلسة">
                                                        <Stop />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* إحصائيات */}
            <Grid container spacing={3}>
                {[
                    { icon: <AttachMoney />, value: `${stats.revenue} جنيه`, label: 'إيرادات اليوم', color: 'success.main' },
                    { icon: <TrendingUp />, value: stats.sessions, label: 'جلسات مكتملة', color: 'primary.main' },
                    { icon: <People />, value: stats.customers, label: 'عملاء جدد', color: 'info.main' },
                    { icon: <CardGiftcard />, value: stats.packages, label: 'باقات مباعة', color: 'secondary.main' },
                ].map((stat, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                        <Card elevation={1} sx={{ border: '1px solid', borderColor: 'neutral.200' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                {React.cloneElement(stat.icon, { sx: { fontSize: 40, color: stat.color, mb: 1 } })}
                                <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>{stat.value}</Typography>
                                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Dialog */}
            <Dialog open={newCustomerDialog} onClose={() => setNewCustomerDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>عميل جديد</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField fullWidth label="رقم الهاتف" value={phoneNumber} disabled sx={{ mb: 2 }} />
                        <TextField fullWidth label="الاسم الكامل" value={newCustomerData.name}
                            onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })} autoFocus sx={{ mb: 2 }} />
                        <FormControl fullWidth>
                            <InputLabel>نوع العميل</InputLabel>
                            <Select value={newCustomerData.type} onChange={(e) => setNewCustomerData({ ...newCustomerData, type: e.target.value })} label="نوع العميل">
                                <MenuItem value="student">طالب</MenuItem>
                                <MenuItem value="employee">موظف</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNewCustomerDialog(false)}>إلغاء</Button>
                    <Button variant="contained" onClick={handleCreateAndStart} startIcon={<PlayArrow />}>حفظ وبدء الجلسة</Button>
                </DialogActions>
            </Dialog>

            {/* End Session Dialog */}
            <Dialog open={endDialog.open} onClose={() => setEndDialog({ open: false, session: null })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>إنهاء الجلسة</DialogTitle>
                <DialogContent>
                    {endDialog.session && (
                        <Box sx={{ pt: 2 }}>
                            <Alert severity="info" sx={{ mb: 3 }}>
                                <Typography variant="body2"><strong>العميل:</strong> {endDialog.session.customer_name}</Typography>
                                <Typography variant="body2"><strong>وقت البدء:</strong> {dayjs(endDialog.session.start_time).format('DD/MM/YYYY hh:mm A')}</Typography>
                                <Typography variant="body2"><strong>الوقت المنقضي:</strong> {calculateElapsed(endDialog.session.start_time)}</Typography>
                                <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="body2"><strong>تكلفة الوقت:</strong> {(((Date.now() - new Date(endDialog.session.start_time).getTime()) / 3600000) * endDialog.session.hourly_rate).toFixed(2)} جنيه</Typography>
                                    <Typography variant="body2"><strong>تكلفة المشروبات:</strong> {endDialog.session.beverages_cost || 0} جنيه</Typography>
                                    <Typography variant="h6" sx={{ mt: 1, color: 'success.main', fontWeight: 800 }}>
                                        إجمالي: {(((Date.now() - new Date(endDialog.session.start_time).getTime()) / 3600000) * endDialog.session.hourly_rate + (endDialog.session.beverages_cost || 0)).toFixed(2)} جنيه
                                    </Typography>
                                </Box>
                            </Alert>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>طريقة الدفع</InputLabel>
                                        <Select value={endData.paymentMethod} label="طريقة الدفع"
                                            onChange={(e) => setEndData({ ...endData, paymentMethod: e.target.value })}>
                                            <MenuItem value="cash">كاش</MenuItem>
                                            <MenuItem value="card">كارت</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="ملاحظات (اختياري)" multiline rows={3} value={endData.notes}
                                        onChange={(e) => setEndData({ ...endData, notes: e.target.value })} />
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEndDialog({ open: false, session: null })}>إلغاء</Button>
                    <Button variant="contained" color="error" onClick={handleEndSession}>إنهاء وحفظ</Button>
                </DialogActions>
            </Dialog>

            {/* Beverage Dialog */}
            <Dialog open={beverageDialog.open} onClose={() => setBeverageDialog({ open: false, session: null })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>إضافة مشروب للجلسة</DialogTitle>
                <DialogContent>
                    {beverageDialog.session && (
                        <Box sx={{ pt: 2 }}>
                            <Alert severity="info" sx={{ mb: 3 }}>
                                <Typography variant="body2"><strong>العميل:</strong> {beverageDialog.session.customer_name}</Typography>
                            </Alert>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Autocomplete
                                        fullWidth
                                        options={beverages}
                                        groupBy={(option) => option.category || 'عام'}
                                        getOptionLabel={(option) => `${option.name} - ${option.price} جنيه`}
                                        value={beverages.find(b => b.id === selectedBeverage) || null}
                                        onChange={(event, newValue) => setSelectedBeverage(newValue?.id || '')}
                                        renderInput={(params) => <TextField {...params} label="المشروب" />}
                                        renderGroup={(params) => (
                                            <li key={params.key}>
                                                <ListSubheader sx={{ fontWeight: 800, color: 'primary.main', backgroundColor: 'neutral.100', lineHeight: '36px' }}>
                                                    {params.group}
                                                </ListSubheader>
                                                <ul style={{ padding: 0 }}>{params.children}</ul>
                                            </li>
                                        )}
                                        noOptionsText="لا توجد مشروبات"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="الكمية" type="number" value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        inputProps={{ min: 1 }} />
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBeverageDialog({ open: false, session: null })}>إلغاء</Button>
                    <Button variant="contained" onClick={handleAddBeverage}>إضافة</Button>
                </DialogActions>
            </Dialog>

            {/* Invoice Dialog */}
            <InvoiceDialog
                open={invoiceDialog.open}
                onClose={() => setInvoiceDialog({ open: false, sessionId: null })}
                sessionId={invoiceDialog.sessionId}
            />
        </Box>
    );
}

export default DashboardPage;
