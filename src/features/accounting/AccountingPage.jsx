import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Grid, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip, Tab, Tabs,
} from '@mui/material';
import { AttachMoney, TrendingUp, People, CardGiftcard } from '@mui/icons-material';
import dayjs from 'dayjs';

const { electronAPI } = window;

function AccountingPage() {
    const [tab, setTab] = useState(0);
    const [dailyReport, setDailyReport] = useState(null);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        loadData();
    }, [tab]);

    const loadData = async () => {
        try {
            const report = await electronAPI.getDailyReport();
            setDailyReport(report);

            if (tab === 1) {
                const trans = await electronAPI.getTransactions({});
                setTransactions(trans);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>الحسابات والتقارير</Typography>

            {/* Stats */}
            {dailyReport && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {[
                        { icon: <AttachMoney />, value: `${dailyReport.totalRevenue} جنيه`, label: 'إجمالي الإيرادات', color: 'success.main' },
                        { icon: <TrendingUp />, value: dailyReport.sessionsCount, label: 'عدد الجلسات', color: 'primary.main' },
                        { icon: <CardGiftcard />, value: dailyReport.packagesSold, label: 'باقات مباعة', color: 'secondary.main' },
                        { icon: <People />, value: dailyReport.newCustomers, label: 'عملاء جدد', color: 'info.main' },
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
            )}

            <Card elevation={1} sx={{ border: '1px solid', borderColor: 'neutral.200' }}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="التقرير اليومي" />
                    <Tab label="سجل المعاملات" />
                </Tabs>

                <CardContent>
                    {tab === 0 && dailyReport && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                                تقرير يوم {dayjs(dailyReport.date).format('DD/MM/YYYY')}
                            </Typography>

                            <Grid container spacing={2}>
                                {dailyReport.paymentMethods && dailyReport.paymentMethods.map((pm, i) => (
                                    <Grid item xs={12} sm={6} key={i}>
                                        <Card variant="outlined">
                                            <CardContent>
                                                <Typography variant="body2" color="text.secondary">
                                                    {pm.payment_method === 'cash' ? 'الدفع كاش' : 'الدفع بالكارت'}
                                                </Typography>
                                                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                                                    {pm.total} جنيه
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {tab === 1 && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>التاريخ</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>النوع</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>العميل</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>الوصف</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>المبلغ</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>طريقة الدفع</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.map((trans) => (
                                        <TableRow key={trans.id} hover>
                                            <TableCell>{dayjs(trans.transaction_date).format('DD/MM/YYYY hh:mm A')}</TableCell>
                                            <TableCell>
                                                <Chip label={trans.type === 'session' ? 'جلسة' : trans.type === 'package' ? 'باقة' : 'مشروب'}
                                                    size="small" color={trans.type === 'session' ? 'primary' : 'secondary'} />
                                            </TableCell>
                                            <TableCell>{trans.customer_name || '-'}</TableCell>
                                            <TableCell>{trans.description}</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>{trans.amount} جنيه</TableCell>
                                            <TableCell>
                                                <Chip label={trans.payment_method === 'cash' ? 'كاش' : 'كارت'} size="small" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}

export default AccountingPage;
