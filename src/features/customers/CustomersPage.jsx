import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
    InputLabel, Select, MenuItem, Grid, Alert,
} from '@mui/material';
import { Add, Edit, CardGiftcard } from '@mui/icons-material';
import dayjs from 'dayjs';

const { electronAPI } = window;

function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [dialog, setDialog] = useState({ open: false, mode: 'add', data: {} });
    const [searchTerm, setSearchTerm] = useState('');
    const [packageDialog, setPackageDialog] = useState({ open: false, customer: null });
    const [packages, setPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');

    useEffect(() => {
        loadCustomers();
        loadPackages();
    }, []);

    const loadPackages = async () => {
        try {
            const data = await electronAPI.getAvailablePackages();
            setPackages(data);
        } catch (error) {
            console.error('Error loading packages:', error);
        }
    };

    const loadCustomers = async () => {
        try {
            const data = await electronAPI.getCustomers();
            setCustomers(data);
        } catch (error) {
            console.error('Error loading customers:', error);
        }
    };

    const handleSave = async () => {
        try {
            if (dialog.mode === 'add') {
                await electronAPI.createCustomer(dialog.data);
            } else {
                await electronAPI.updateCustomer(dialog.data.id, dialog.data);
            }
            setDialog({ open: false, mode: 'add', data: {} });
            loadCustomers();
        } catch (error) {
            alert('حدث خطأ');
        }
    };

    const handlePurchasePackage = async () => {
        if (!selectedPackage) {
            alert('يرجى اختيار الباقة');
            return;
        }

        try {
            await electronAPI.purchasePackage(
                packageDialog.customer.id,
                selectedPackage,
                paymentMethod
            );
            setPackageDialog({ open: false, customer: null });
            setSelectedPackage('');
            setPaymentMethod('cash');
            loadCustomers();
            alert('تم شراء الباقة بنجاح');
        } catch (error) {
            alert('حدث خطأ في شراء الباقة');
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.includes(searchTerm) || c.phone.includes(searchTerm)
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>إدارة العملاء</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setDialog({ open: true, mode: 'add', data: { type: 'student' } })}>
                    إضافة عميل جديد
                </Button>
            </Box>

            <Card elevation={3}>
                <CardContent>
                    <TextField
                        fullWidth
                        label="بحث (الاسم أو رقم الهاتف)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ mb: 3 }}
                    />

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>الاسم</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>رقم الهاتف</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>النوع</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>الباقة النشطة</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>إجمالي الساعات</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>إجمالي المدفوعات</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>تاريخ التسجيل</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>إجراءات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredCustomers.map((customer) => (
                                    <TableRow key={customer.id} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>{customer.name}</TableCell>
                                        <TableCell>{customer.phone}</TableCell>
                                        <TableCell>
                                            <Chip label={customer.type === 'student' ? 'طالب' : 'موظف'}
                                                color={customer.type === 'student' ? 'info' : 'warning'} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            {customer.package_name ? (
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{customer.package_name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{customer.remaining_hours} ساعة متبقية</Typography>
                                                </Box>
                                            ) : (
                                                <Typography variant="caption" color="text.secondary">بدون باقة</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>{customer.total_hours_used?.toFixed(2) || 0} ساعة</TableCell>
                                        <TableCell>{customer.total_amount_paid?.toFixed(2) || 0} جنيه</TableCell>
                                        <TableCell>{dayjs(customer.registration_date).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell>
                                            <IconButton size="small" color="primary" onClick={() => setDialog({ open: true, mode: 'edit', data: customer })}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton size="small" color="secondary"
                                                onClick={() => setPackageDialog({ open: true, customer })}
                                                title="شراء باقة">
                                                <CardGiftcard />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {filteredCustomers.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography color="text.secondary">لا توجد نتائج</Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Dialog */}
            <Dialog open={dialog.open} onClose={() => setDialog({ ...dialog, open: false })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>{dialog.mode === 'add' ? 'إضافة عميل جديد' : 'تعديل بيانات العميل'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="الاسم الكامل" value={dialog.data.name || ''}
                                onChange={(e) => setDialog({ ...dialog, data: { ...dialog.data, name: e.target.value } })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="رقم الهاتف" value={dialog.data.phone || ''} inputProps={{ maxLength: 11 }}
                                onChange={(e) => setDialog({ ...dialog, data: { ...dialog.data, phone: e.target.value } })} />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>نوع العميل</InputLabel>
                                <Select value={dialog.data.type || 'student'} label="نوع العميل"
                                    onChange={(e) => setDialog({ ...dialog, data: { ...dialog.data, type: e.target.value } })}>
                                    <MenuItem value="student">طالب</MenuItem>
                                    <MenuItem value="employee">موظف</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog({ ...dialog, open: false })}>إلغاء</Button>
                    <Button variant="contained" onClick={handleSave}>حفظ</Button>
                </DialogActions>
            </Dialog>

            {/* Package Purchase Dialog */}
            <Dialog open={packageDialog.open} onClose={() => setPackageDialog({ open: false, customer: null })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>شراء باقة</DialogTitle>
                <DialogContent>
                    {packageDialog.customer && (
                        <Box sx={{ pt: 2 }}>
                            <Alert severity="info" sx={{ mb: 3 }}>
                                <Typography variant="body2"><strong>العميل:</strong> {packageDialog.customer.name}</Typography>
                                <Typography variant="body2"><strong>النوع:</strong> {packageDialog.customer.type === 'student' ? 'طالب' : 'موظف'}</Typography>
                            </Alert>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>الباقة</InputLabel>
                                        <Select value={selectedPackage} label="الباقة"
                                            onChange={(e) => setSelectedPackage(e.target.value)}>
                                            {packages
                                                .filter(pkg => pkg.customer_type === packageDialog.customer.type || pkg.customer_type === 'all')
                                                .map((pkg) => (
                                                    <MenuItem key={pkg.id} value={pkg.id}>
                                                        {pkg.name} - {pkg.total_hours} ساعة - {pkg.price} جنيه
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>طريقة الدفع</InputLabel>
                                        <Select value={paymentMethod} label="طريقة الدفع"
                                            onChange={(e) => setPaymentMethod(e.target.value)}>
                                            <MenuItem value="cash">كاش</MenuItem>
                                            <MenuItem value="card">كارت</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPackageDialog({ open: false, customer: null })}>إلغاء</Button>
                    <Button variant="contained" onClick={handlePurchasePackage}>شراء الباقة</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default CustomersPage;
