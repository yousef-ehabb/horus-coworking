import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Chip,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Groups as GroupsIcon,
    EventAvailable as EventAvailableIcon,
    CardGiftcard as CardGiftcardIcon,
    LocalCafe as LocalCafeIcon,
    AccountBalance as AccountBalanceIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Menu as MenuIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import DashboardPage from '../features/dashboard/DashboardPage';
import CustomersPage from '../features/customers/CustomersPage';
import SessionsPage from '../features/sessions/SessionsPage';
import PackagesPage from '../features/packages/PackagesPage';
import BeveragesPage from '../features/beverages/BeveragesPage';
import AccountingPage from '../features/accounting/AccountingPage';
import SettingsPage from '../features/settings/SettingsPage';

dayjs.locale('ar');

const drawerWidth = 260;

const menuItems = [
    { text: 'لوحة التحكم', icon: <DashboardIcon />, path: '/' },
    { text: 'الجلسات', icon: <EventAvailableIcon />, path: '/sessions' },
    { text: 'العملاء', icon: <GroupsIcon />, path: '/customers' },
    { text: 'الباقات', icon: <CardGiftcardIcon />, path: '/packages' },
    { text: 'المشروبات', icon: <LocalCafeIcon />, path: '/beverages' },
    { text: 'الحسابات', icon: <AccountBalanceIcon />, path: '/accounting' },
    { text: 'الإعدادات', icon: <SettingsIcon />, path: '/settings' },
];

function MainLayout({ onLogout }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(dayjs());
    const navigate = useNavigate();
    const location = useLocation();

    // تحديث الوقت كل ثانية
    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(dayjs());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <Box>
            {/* Spacer removed - Sidebar Full Height */}

            {/* Branding - Restored to Sidebar */}
            <Box
                sx={{
                    background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                    color: 'white',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Box
                    component="img"
                    src="./icon.png"
                    alt="Horus Icon"
                    sx={{
                        height: 40,
                        width: 40,
                        backgroundColor: 'white',
                        p: 0.5,
                        borderRadius: 2,
                    }}
                />
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'white' }}>
                    حورس
                </Typography>
            </Box>

            <List sx={{ px: 1, pt: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                            sx={{
                                borderRadius: 2,
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: location.pathname === item.path ? 'white' : 'primary.main',
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontWeight: location.pathname === item.path ? 600 : 500,
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <List sx={{ px: 1 }}>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={onLogout}
                        sx={{
                            borderRadius: 2,
                            color: 'error.main',
                            '&:hover': {
                                backgroundColor: 'error.lighter',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ color: 'error.main' }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="تسجيل الخروج" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: '100%',
                    left: 0,
                    right: 0,
                    paddingRight: { sm: `${drawerWidth}px` },
                    backgroundColor: 'white',
                    color: 'text.primary',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ ml: 2, display: { sm: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {menuItems.find(item => item.path === location.pathname)?.text || 'حورس'}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                            label={currentTime.format('hh:mm:ss A')}
                            color="secondary"
                            sx={{ fontWeight: 600 }}
                        />
                        <Chip
                            label={currentTime.format('dddd، D MMMM YYYY')}
                            color="primary"
                            variant="outlined"
                        />
                    </Box>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    backgroundColor: 'background.default',
                }}
            >
                <Toolbar /> {/* Spacer */}

                <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/customers" element={<CustomersPage />} />
                    <Route path="/sessions" element={<SessionsPage />} />
                    <Route path="/packages" element={<PackagesPage />} />
                    <Route path="/beverages" element={<BeveragesPage />} />
                    <Route path="/accounting" element={<AccountingPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
            </Box>
        </Box>
    );
}

export default MainLayout;
