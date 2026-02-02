import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Tab, Tabs, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Button, Chip, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, Grid, FormControl,
    InputLabel, Select, MenuItem, IconButton,
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import dayjs from 'dayjs';

const { electronAPI } = window;

function PackagesPage() {
    const [tab, setTab] = useState(0);
    const [packages, setPackages] = useState([]);
    const [customerPackages, setCustomerPackages] = useState([]);
    const [dialog, setDialog] = useState({ open: false, mode: 'add', data: {} });

    useEffect(() => {
        loadData();
    }, [tab]);

    const loadData = async () => {
        try {
            const pkgs = await electronAPI.getAvailablePackages();
            setPackages(pkgs);

            if (tab === 1) {
                const cp = await electronAPI.getAllCustomerPackages();
                setCustomerPackages(cp);
            }
        } catch (error) {
            console.error('Error loading packages:', error);
        }
    };

    const handleSave = async () => {
        try {
            if (dialog.mode === 'add') {
                await electronAPI.createPackage(dialog.data);
            } else {
                await electronAPI.updatePackage(dialog.data.id, dialog.data);
            }
            setDialog({ open: false, mode: 'add', data: {} });
            loadData();
        } catch (error) {
            alert('حدث خطأ');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>إدارة الباقات</Typography>
                {tab === 0 && (
                    <Button variant="contained" startIcon={<Add />}
                        onClick={() => setDialog({ open: true, mode: 'add', data: { customerType: 'student', isActive: true } })}>
                        إضافة باقة جديدة
                    </Button>
                )}
            </Box>

            <Card elevation={3}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="الباقات المتاحة" />
                    <Tab label="اشتراكات العملاء" />
                </Tabs>

                <CardContent>
                    {tab === 0 && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>اسم الباقة</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>عدد الساعات</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>السعر</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>سعر الساعة</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>النوع</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>الحالة</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>إجراءات</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {packages.map((pkg) => (
                                        <TableRow key={pkg.id} hover>
                                            <TableCell sx={{ fontWeight: 600 }}>{pkg.name}</TableCell>
                                            <TableCell>{pkg.total_hours} ساعة</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>{pkg.price} جنيه</TableCell>
                                            <TableCell>{(pkg.price / pkg.total_hours).toFixed(2)} جنيه</TableCell>
                                            <TableCell>
                                                <Chip label={pkg.customer_type === 'student' ? 'طلاب' : pkg.customer_type === 'employee' ? 'موظفين' : 'الكل'}
                                                    color={pkg.customer_type === 'student' ? 'info' : 'warning'} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={pkg.is_active ? 'نشط' : 'معطل'}
                                                    color={pkg.is_active ? 'success' : 'default'} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="primary" onClick={() => setDialog({ open: true, mode: 'edit', data: pkg })}>
                                                    <Edit />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {tab === 1 && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>العميل</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>رقم الهاتف</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>الباقة</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>إجمالي الساعات</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>الساعات المتبقية</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>المبلغ المدفوع</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>تاريخ الشراء</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>الحالة</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {customerPackages.map((cp) => (
                                        <TableRow key={cp.id} hover>
                                            <TableCell sx={{ fontWeight: 600 }}>{cp.customer_name}</TableCell>
                                            <TableCell>{cp.customer_phone}</TableCell>
                                            <TableCell>{cp.package_name}</TableCell>
                                            <TableCell>{cp.total_hours} ساعة</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                    {cp.remaining_hours.toFixed(2)} ساعة
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{cp.price_paid} جنيه</TableCell>
                                            <TableCell>{dayjs(cp.purchase_date).format('DD/MM/YYYY')}</TableCell>
                                            <TableCell>
                                                <Chip label={cp.status === 'active' ? 'نشط' : 'مستهلك'}
                                                    color={cp.status === 'active' ? 'success' : 'default'} size="small" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Dialog */}
            <Dialog open={dialog.open} onClose={() => setDialog({ ...dialog, open: false })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {dialog.mode === 'add' ? 'إضافة باقة جديدة' : 'تعديل الباقة'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="اسم الباقة" value={dialog.data.name || ''}
                                onChange={(e) => setDialog({ ...dialog, data: { ...dialog.data, name: e.target.value } })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="عدد الساعات" type="number" value={dialog.data.totalHours || dialog.data.total_hours || ''}
                                onChange={(e) => setDialog({ ...dialog, data: { ...dialog.data, totalHours: parseInt(e.target.value) } })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="السعر (جنيه)" type="number" value={dialog.data.price || ''}
                                onChange={(e) => setDialog({ ...dialog, data: { ...dialog.data, price: parseFloat(e.target.value) } })} />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>نوع العميل</InputLabel>
                                <Select value={dialog.data.customerType || dialog.data.customer_type || 'student'} label="نوع العميل"
                                    onChange={(e) => setDialog({ ...dialog, data: { ...dialog.data, customerType: e.target.value } })}>
                                    <MenuItem value="student">طلاب</MenuItem>
                                    <MenuItem value="employee">موظفين</MenuItem>
                                    <MenuItem value="all">الكل</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        {dialog.mode === 'edit' && (
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>الحالة</InputLabel>
                                    <Select value={dialog.data.isActive !== undefined ? dialog.data.isActive : dialog.data.is_active} label="الحالة"
                                        onChange={(e) => setDialog({ ...dialog, data: { ...dialog.data, isActive: e.target.value } })}>
                                        <MenuItem value={true}>نشط</MenuItem>
                                        <MenuItem value={false}>معطل</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog({ ...dialog, open: false })}>إلغاء</Button>
                    <Button variant="contained" onClick={handleSave}>حفظ</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default PackagesPage;
