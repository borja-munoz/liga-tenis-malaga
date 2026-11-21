import { createTheme } from '@mui/material/styles';

// "Night Session" theme: deep navy + yellow, chrome accents.
// Most layout styling lives in style.css; the theme covers the MUI pieces
// we still use (Autocomplete popup, modal, baseline).
const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFD60A',
      contrastText: '#0B1B3F',
    },
    secondary: {
      main: '#C6D0E6',
    },
    background: {
      default: '#0B1B3F',
      paper: '#0E2250',
    },
    text: {
      primary: '#EEF2FB',
      secondary: '#A9B6D3',
    },
    error: {
      main: '#FF6B6B',
    },
  },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    h1: { fontFamily: '"Sora", system-ui, sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Sora", system-ui, sans-serif', fontWeight: 800 },
    h3: { fontFamily: '"Sora", system-ui, sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Sora", system-ui, sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Sora", system-ui, sans-serif', fontWeight: 700 },
    h6: { fontFamily: '"Sora", system-ui, sans-serif', fontWeight: 700 },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: '100vh',
          backgroundColor: '#050D22',
          backgroundImage:
            'radial-gradient(120% 60% at 50% -10%, #1E3A7A 0%, #0B1B3F 45%, #050D22 100%)',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          marginTop: 8,
          backgroundColor: '#0E2250',
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          borderRadius: 14,
          boxShadow: '0 18px 40px rgba(0, 0, 0, 0.5)',
        },
        listbox: {
          padding: 6,
        },
        option: {
          borderRadius: 10,
          minHeight: 44,
          '&.Mui-focused': {
            backgroundColor: 'rgba(255, 214, 10, 0.14) !important',
          },
          '&[aria-selected="true"]': {
            color: '#FFD60A',
            fontWeight: 600,
          },
        },
        noOptions: {
          color: '#A9B6D3',
        },
      },
    },
  },
});

export default theme;
