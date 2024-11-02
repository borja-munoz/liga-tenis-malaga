import { Box } from "@mui/material";

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