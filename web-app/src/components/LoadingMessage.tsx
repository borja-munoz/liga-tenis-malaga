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
      <CircularProgress sx={{ marginBottom: "10px" }} />
      <StyledTypography variant="h3">Loading database...</StyledTypography>
    </Box>
  );
}