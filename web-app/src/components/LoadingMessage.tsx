import { Box } from "@mui/material";
import imgUrl from '/tennis-ball.svg';

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
      <div 
        className="zoom-in-out-box"
        style={{
          backgroundImage: `url("${imgUrl}")`
        }}
      >
      </div>
    </Box>
  );
}