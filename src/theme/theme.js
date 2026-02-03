import { createTheme, alpha } from '@mui/material/styles';
import { arEG } from '@mui/material/locale';

// 🎨 DESIGN SYSTEM: PROFESSIONAL BLUE (V1 REFINED)
// Reverting to the high-trust Royal Blue palette from the original version.

const palette = {
    primary: {
        main: '#1565C0', // Royal Blue
        light: '#42A5F5', // Sky Blue
        dark: '#0D47A1',  // Dark Blue
        contrastText: '#FFFFFF',
    },
    secondary: {
        main: '#FFB300', // Amber (for accents)
        light: '#FFCA28',
        dark: '#FFA000',
        contrastText: '#000000',
    },
    neutral: {
        900: '#1A2027', // Dark Grey (Text Primary)
        500: '#5F6368', // Muted Text
        200: '#E0E3E7', // Borders
        100: '#F3F6F9', // Backgrounds
        50: '#F8FAFC',  // Cards
        white: '#FFFFFF',
    },
    success: { main: '#2E7D32' },
    warning: { main: '#ED6C02' },
    error: { main: '#D32F2F' },
};

const theme = createTheme(
    {
        direction: 'rtl',
        palette: {
            mode: 'light',
            primary: palette.primary,
            secondary: palette.secondary,
            text: {
                primary: palette.neutral[900],
                secondary: palette.neutral[500],
            },
            background: {
                default: palette.neutral[100],
                paper: palette.neutral.white,
            },
            divider: palette.neutral[200],
            neutral: palette.neutral,
        },
        typography: {
            fontFamily: '"Cairo", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: { fontWeight: 700, color: palette.neutral[900] },
            h2: { fontWeight: 700, color: palette.neutral[900] },
            h3: { fontWeight: 700, color: palette.neutral[900] },
            h4: { fontWeight: 700 },
            h5: { fontWeight: 700 },
            h6: { fontWeight: 700 },
            button: { fontWeight: 700 },
        },
        shape: {
            borderRadius: 12,
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        borderRadius: 8,
                        padding: '8px 20px',
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: '0px 2px 8px rgba(21, 101, 192, 0.2)',
                            transform: 'translateY(-1px)',
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                        border: `1px solid ${palette.neutral[200]}`,
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: '#FFFFFF',
                        color: palette.neutral[900],
                        boxShadow: '0px 1px 0px #E0E3E7',
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundColor: '#FFFFFF',
                        color: palette.neutral[900],
                        borderLeft: '1px solid #E0E3E7',
                    },
                },
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        margin: '4px 8px',
                        borderRadius: 8,
                        '&.Mui-selected': {
                            backgroundColor: alpha(palette.primary.main, 0.08),
                            color: palette.primary.main,
                            '&:hover': {
                                backgroundColor: alpha(palette.primary.main, 0.12),
                            },
                            '& .MuiListItemIcon-root': {
                                color: palette.primary.main,
                            },
                            '& .MuiListItemText-primary': {
                                fontWeight: 700,
                            },
                        },
                    },
                },
            },
            MuiListItemIcon: {
                styleOverrides: {
                    root: {
                        color: palette.neutral[500],
                        minWidth: 40,
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 8,
                        },
                    },
                },
            },
        },
    },
    arEG
);

export default theme;
