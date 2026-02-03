import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, Box, Typography, Divider, Button, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Grid, IconButton
} from '@mui/material';
import { Print, Close } from '@mui/icons-material';
import dayjs from 'dayjs';

const { electronAPI } = window;

function InvoiceDialog({ open, onClose, sessionId }) {
    const [invoiceData, setInvoiceData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && sessionId) {
            loadInvoiceData();
        }
    }, [open, sessionId]);

    const loadInvoiceData = async () => {
        setLoading(true);
        try {
            const data = await electronAPI.getSessionInvoice(sessionId);
            setInvoiceData(data);
        } catch (error) {
            console.error('Error loading invoice:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (!invoiceData) return null;

    const { session, beverages, settings } = invoiceData;
    const isFromPackage = session.from_package === 1;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
            PaperProps={{
                sx: {
                    '@media print': {
                        boxShadow: 'none',
                        margin: 0,
                        maxWidth: '100%'
                    }
                }
            }}>
            <DialogContent sx={{ p: 0 }}>
                {/* Print Actions - Hidden on Print */}
                <Box sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    backgroundColor: 'neutral.50',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '@media print': { display: 'none' }
                }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>فاتورة الجلسة</Typography>
                    <Box>
                        <Button variant="contained" startIcon={<Print />} onClick={handlePrint} sx={{ mr: 1 }}>
                            طباعة
                        </Button>
                        <IconButton onClick={onClose}>
                            <Close />
                        </IconButton>
                    </Box>
                </Box>

                {/* Invoice Content - Optimized for Print */}
                <Box sx={{
                    p: 4,
                    '@media print': {
                        p: 2,
                        fontSize: '12pt'
                    }
                }}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            component="img"
                            src="./icon.png"
                            alt="Horus"
                            sx={{ height: 60, mb: 2 }}
                        />
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                            {settings.space_name || 'حورس - مساحة عمل'}
                        </Typography>
                        {settings.space_address && (
                            <Typography variant="body2" color="text.secondary">
                                {settings.space_address}
                            </Typography>
                        )}
                        {settings.space_phone && (
                            <Typography variant="body2" color="text.secondary">
                                {settings.space_phone}
                            </Typography>
                        )}
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Invoice Info */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">رقم الفاتورة</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>#{session.id}</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'left' }}>
                            <Typography variant="body2" color="text.secondary">التاريخ</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {dayjs(session.end_time || new Date()).format('DD/MM/YYYY')}
                            </Typography>
                        </Grid>
                    </Grid>

                    {/* Customer Details */}
                    <Paper elevation={0} sx={{ p: 2, backgroundColor: 'neutral.50', mb: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>بيانات العميل</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{session.customer_name}</Typography>
                        <Typography variant="body2">{session.customer_phone}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {session.customer_type === 'student' ? 'طالب' : 'موظف'}
                        </Typography>
                    </Paper>

                    {/* Session Details */}
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>تفاصيل الجلسة</Typography>
                    <TableContainer component={Paper} elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>وقت البدء</TableCell>
                                    <TableCell>{dayjs(session.start_time).format('DD/MM/YYYY hh:mm A')}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>وقت الانتهاء</TableCell>
                                    <TableCell>{dayjs(session.end_time).format('DD/MM/YYYY hh:mm A')}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>المدة الإجمالية</TableCell>
                                    <TableCell>{session.total_hours?.toFixed(2)} ساعة</TableCell>
                                </TableRow>
                                {!isFromPackage && (
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>سعر الساعة</TableCell>
                                        <TableCell>{session.hourly_rate} {settings.currency || 'جنيه'}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Beverages */}
                    {beverages.length > 0 && (
                        <>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>المشروبات والإضافات</Typography>
                            <TableContainer component={Paper} elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
                                <Table size="small">
                                    <TableHead sx={{ backgroundColor: 'neutral.50' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>الصنف</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>الكمية</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>السعر</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>المجموع</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {beverages.map((bev, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{bev.beverage_name}</TableCell>
                                                <TableCell>{bev.quantity}</TableCell>
                                                <TableCell>{bev.unit_price} {settings.currency || 'جنيه'}</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>
                                                    {bev.total_price} {settings.currency || 'جنيه'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}

                    <Divider sx={{ mb: 3 }} />

                    {/* Cost Summary */}
                    <Box sx={{ mb: 3 }}>
                        <Grid container spacing={1}>
                            {isFromPackage ? (
                                <Grid item xs={12}>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        p: 2,
                                        backgroundColor: 'info.light',
                                        borderRadius: 2
                                    }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            جلسة من الباقة (مدفوعة مسبقاً)
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            ✓
                                        </Typography>
                                    </Box>
                                </Grid>
                            ) : (
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography>تكلفة الوقت</Typography>
                                        <Typography sx={{ fontWeight: 600 }}>
                                            {session.hours_cost?.toFixed(2)} {settings.currency || 'جنيه'}
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}

                            {beverages.length > 0 && (
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography>تكلفة المشروبات</Typography>
                                        <Typography sx={{ fontWeight: 600 }}>
                                            {session.beverages_cost} {settings.currency || 'جنيه'}
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    p: 2,
                                    backgroundColor: 'success.light',
                                    borderRadius: 2
                                }}>
                                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                        الإجمالي
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                        {session.total_cost?.toFixed(2)} {settings.currency || 'جنيه'}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                    <Typography variant="body2" color="text.secondary">طريقة الدفع</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {session.payment_method === 'cash' ? 'كاش' : 'كارت'}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Footer */}
                    <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body2" color="text.secondary">
                            شكراً لزيارتكم - نتمنى لكم تجربة ممتعة ومثمرة
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            Horus Coworking Space Management System
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

export default InvoiceDialog;
