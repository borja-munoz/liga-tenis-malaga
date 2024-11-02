import { Box, CircularProgress, Typography, styled } from "@mui/material";

const StyledTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

export default function LoadingMessage() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <div className="zoom-in-out-box"></div>
    </Box>
  );
}