import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function Copyright() {
  return (
    <Typography
      variant="body2"
      align="center"
      sx={{
        color: 'text.secondary',
      }}
    >
      Liga Tenis Málaga
    </Typography>
  );
}

export default function App() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2 }}>
          Liga Tenis Málaga
        </Typography>
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
          Temporadas, Ciclos y Resultados
        </Typography>
      </Box>
    </Container>
  );
}
