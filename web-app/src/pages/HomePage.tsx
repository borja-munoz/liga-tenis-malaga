import { FormattedMessage } from "react-intl";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Link } from "react-router-dom";

export default function HomePage() {
  
  return(
    <Box maxWidth="xs" 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '50px'
      }}
    >
      <Typography variant="h2" color="primary">
        <FormattedMessage id="welcome" />
      </Typography>
      <Box>
        <Link to="/dashboard">Go to Dashboard</Link>
      </Box>
    </Box>
  );
}