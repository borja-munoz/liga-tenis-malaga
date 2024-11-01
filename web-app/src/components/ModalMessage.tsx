import { useContext } from "react";

import { AppContext } from "../context";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

export type AppMessage = {
  type: 'success' | 'error';
  message: string;
};

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const messageColors = {
  success: "#22AA22",
  error: "#AA2222",
};

export default function ModalMessage() {
  const context = useContext(AppContext);

  return (
    <div>
      <Modal
        open={!!context.modalMessage}
        onClose={() => context.setModalMessage(null)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Liga Tenis Málaga
          </Typography>
          <Typography
            id="modal-modal-description"
            //@ts-ignore
            sx={{ mt: 2, color: messageColors[context.modalMessage?.type] ?? "#000000" }}
          >
            {context.modalMessage?.message}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}