import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Tab, Tabs, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    FormControl, InputLabel, Select, MenuItem, Grid, Alert,
} from '@mui/material';
import { Stop, LocalCafe, Receipt } from '@mui/icons-material';
import dayjs from 'dayjs';

const { electronAPI } = window;

function SessionsPage() {
    const [tab, setTab] = useState(0);
    const [activeSessions, setActiveSessions] = useState([]);
    const [history, setHistory] = useState([]);
    const [endDialog, setEndDialog] = useState({ open: false, session: null });
    const [endData, setEndData] = useState({ paymentMethod: 'cash', notes: '' });
    const [beverageDialog, setBeverageDialog] = useState({ open: false, session: null });
    const [beverages, setBeverages] = useState([]);
    const [selectedBeverage, setSelectedBeverage] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        loadData();
        loadBeverages();
        const interval = setInterval(loadData, 5000);
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

    const loadData = async () => {
        try {
            const active = await electronAPI.getActiveSessions();
            setActiveSessions(active);

            if (tab === 1) {
                const hist = await electronAPI.getSessionHistory({});
                setHistory(hist);
            }
        } catch (error) {
            console.error('Error loading sessions:', error);
        }
    };

    const handleEndSession = async () => {
        try {
            await electronAPI.endSession(endDialog.session.id, {
                endTime: new Date().toISOString(),
                paymentMethod: endData.paymentMethod,
                notes: endData.notes,
            });
            setEndDialog({ open: false, session: null });
            setEndData({ paymentMethod: 'cash', notes: '' });
            loadData();
        } catch (error) {
            alert('حدث خطأ');
        }
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
            loadData();
        } catch (error) {
            alert('حدث خطأ في إضافة المشروب');
        }
    };

    const calculateElapsed = (startTime) => {
        const elapsed = Date.now() - new Date(startTime).getTime();
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>إدارة الجلسات</Typography>

            <Card elevation={3}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label={`الجلسات النشطة (${activeSessions.length})`} />
                    <Tab label="سجل الجلسات" />
                </Tabs>

                <CardContent>
                    {tab === 0 && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>العميل</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>رقم الهاتف</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>النوع</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>وقت البدء</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>الوقت المنقضي</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>سعر الساعة</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>الإجراءات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {activeSessions.map((session) => (
                                        <TableRow key={session.id} hover>
                                            <TableCell sx={{ fontWeight: 600 }}>{session.customer_name}</TableCell>
                                            <TableCell>{session.customer_phone}</TableCell>
                                            <TableCell>
                                                <Chip label={session.customer_type === 'student' ? 'طالب' : 'موظف'}
                                                    color={session.customer_type === 'student' ? 'info' : 'warning'} size="small" />
                                            </TableCell>
                                            <TableCell>{dayjs(session.start_time).format('DD/MM/YYYY hh:mm A')}</TableCell>
                                            <TableCell>
                                                <Chip label={calculateElapsed(session.start_time)} color="primary" variant="outlined"
                                                    sx={{ fontFamily: 'monospace', fontWeight: 600 }} />
                                            </TableCell>
                                            <TableCell>{session.hourly_rate} جنيه</TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="secondary"
                                                    onClick={() => setBeverageDialog({ open: true, session })}
                                                    title="إضافة مشروب">
                                                    <LocalCafe />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => setEndDialog({ open: true, session })} title="إنهاء الجلسة">
                                                    <Stop />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {activeSessions.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 5 }}>
                                    <Typography color="text.secondary">لا توجد جلسات نشطة</Typography>
                                </Box>
                            )}
                        </TableContainer>
                    )}

                    {tab === 1 && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>العميل</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>التاريخ</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>المدة</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>التكلفة</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>طريقة الدفع</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>من باقة</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>إجراءات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {history.map((session) => (
                                        <TableRow key={session.id} hover>
                                            <TableCell sx={{ fontWeight: 600 }}>{session.customer_name}</TableCell>
                                            <TableCell>{dayjs(session.start_time).format('DD/MM/YYYY')}</TableCell>
                                            <TableCell>{session.total_hours?.toFixed(2)} ساعة</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>
                                                {session.total_cost?.toFixed(2)} جنيه
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={session.payment_method === 'cash' ? 'كاش' : 'كارت'} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                {session.from_package ? <Chip label="✓" color="success" size="small" /> : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="primary">
                                                    <Receipt />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

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
                                    <FormControl fullWidth>
                                        <InputLabel>المشروب</InputLabel>
                                        <Select value={selectedBeverage} label="المشروب"
                                            onChange={(e) => setSelectedBeverage(e.target.value)}>
                                            {beverages.map((bev) => (
                                                <MenuItem key={bev.id} value={bev.id}>
                                                    {bev.name} - {bev.price} جنيه
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
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
        </Box>
    );
}

export default SessionsPage;
