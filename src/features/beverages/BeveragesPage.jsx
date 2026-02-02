import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Grid, IconButton, Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

const { electronAPI } = window;

function BeveragesPage() {
    const [beverages, setBeverages] = useState([]);
    const [dialog, setDialog] = useState({ open: false, mode: 'add', data: {} });

    useEffect(() => {
        loadBeverages();
    }, []);

    const loadBeverages = async () => {
        try {
            const data = await electronAPI.getBeverages();
            setBeverages(data);
        } catch (error) {
            console.error('Error loading beverages:', error);
        }
    };

    const handleSave = async () => {
        try {
            if (dialog.mode === 'add') {
                await electronAPI.createBeverage(dialog.data);
            } else {
                await electronAPI.updateBeverage(dialog.data.id, dialog.data);
            }
            setDialog({ open: false, mode: 'add', data: {} });
            loadBeverages();
        } catch (error) {
            alert('حدث خطأ');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المشروب؟')) {
            try {
                await electronAPI.deleteBeverage(id);
                loadBeverages();
            } catch (error) {
                alert('حدث خطأ');
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>إدارة المشروبات</Typography>
                <Button variant="contained" startIcon={<Add />}
                    onClick={() => setDialog({ open: true, mode: 'add', data: { isAvailable: true } })}>
                    إضافة مشروب جديد
                </Button>
            </Box>

            <Card elevation={3}>
                <CardContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>اسم المشروب</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>السعر</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>الحالة</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>إجراءات</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {beverages.map((beverage) => (
                                    <TableRow key={beverage.id} hover>
                                        <TableCell sx={{ fontWeight: 600, fontSize: '1.1rem' }}>{beverage.name}</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'success.main', fontSize: '1.1rem' }}>
                                            {beverage.price} جنيه
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={beverage.is_available ? 'متاح' : 'غير متاح'}
                                                color={beverage.is_available ? 'success' : 'default'} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton size="small" color="primary"
                                                onClick={() => setDialog({ open: true, mode: 'edit', data: beverage })}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(beverage.id)}>
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Dialog */}
            <Dialog open={dialog.open} onClose={() => setDialog({ ...dialog, open: false })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {dialog.mode === 'add' ? 'إضافة مشروب جديد' : 'تعديل المشروب'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="اسم المشروب" value={dialog.data.name || ''}
                                onChange={(e) => setDialog({ ...dialog, data: { ...dialog.data, name: e.target.value } })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="السعر (جنيه)" type="number" value={dialog.data.price || ''}
                                onChange={(e) => setDialog({ ...dialog, data: { ...dialog.data, price: parseFloat(e.target.value) } })} />
                        </Grid>
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

export default BeveragesPage;
