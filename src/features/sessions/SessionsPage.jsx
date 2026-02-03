import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Tab, Tabs, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    FormControl, InputLabel, Select, MenuItem, Grid, Alert, ListSubheader, Autocomplete,
} from '@mui/material';
import { Stop, LocalCafe, Receipt } from '@mui/icons-material';
import dayjs from 'dayjs';
import InvoiceDialog from './InvoiceDialog';
import { formatCurrency, calculateExpectedCost, formatHoursToTime } from '../../utils/formatters';

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
    const [invoiceDialog, setInvoiceDialog] = useState({ open: false, sessionId: null });

    useEffect(() => {
        loadData();
        loadBeverages();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (tab === 1) {
            loadHistory();
        }
    }, [tab]);

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
        } catch (error) {
            console.error('Error loading sessions:', error);
        }
    };

    const loadHistory = async () => {
        try {
            const hist = await electronAPI.getSessionHistory({});
            setHistory(hist);
        } catch (error) {
            console.error('Error loading history:', error);
        }
    };

    const handleExportPDF = () => {
        window.print();
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
            loadData();
            // Show invoice after ending session
            setInvoiceDialog({ open: true, sessionId });
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

            <Card elevation={1} sx={{ border: '1px solid', borderColor: 'neutral.200' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 1 }}>
                    <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 'none' }}>
                        <Tab label={`الجلسات النشطة (${activeSessions.length})`} />
                        <Tab label="سجل الجلسات" />
                    </Tabs>
                    {tab === 1 && history.length > 0 && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Receipt />}
                            onClick={handleExportPDF}
                            sx={{ '@media print': { display: 'none' } }}
                        >
                            تصدير PDF
                        </Button>
                    )}
                </Box>

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
                                        <TableCell sx={{ fontWeight: 700 }}>تكلفة المشروبات</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>الإيراد المتوقع</TableCell>
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
                                            <TableCell sx={{ fontWeight: 600, color: 'secondary.main' }}>
                                                {session.beverages_cost || 0} جنيه
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>
                                                {calculateExpectedCost(session)} جنيه
                                            </TableCell>
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
                                            <TableCell>{formatHoursToTime(session.total_hours)}</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>
                                                {formatCurrency(session.total_cost)} جنيه
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
                            {history.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 5 }}>
                                    <Typography color="text.secondary">لا توجد جلسات منتهية</Typography>
                                </Box>
                            )}
                        </TableContainer>
                    )}

                    {/* Print Styles */}
                    <style>
                        {`
                            @media print {
                                body * {
                                    visibility: hidden;
                                }
                                .MuiTableContainer-root, .MuiTableContainer-root * {
                                    visibility: visible;
                                }
                                .MuiTableContainer-root {
                                    position: absolute;
                                    left: 0;
                                    top: 0;
                                    width: 100%;
                                }
                                header, nav, .MuiDrawer-root, .MuiTabs-root, button {
                                    display: none !important;
                                }
                            }
                        `}
                    </style>
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
                                <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="body2"><strong>تكلفة الوقت:</strong> {Math.round(((Date.now() - new Date(endDialog.session.start_time).getTime()) / 3600000) * endDialog.session.hourly_rate)} جنيه</Typography>
                                    <Typography variant="body2"><strong>تكلفة المشروبات:</strong> {endDialog.session.beverages_cost || 0} جنيه</Typography>
                                    <Typography variant="h6" sx={{ mt: 1, color: 'success.main', fontWeight: 800 }}>
                                        إجمالي: {calculateExpectedCost(endDialog.session)} جنيه
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

export default SessionsPage;
