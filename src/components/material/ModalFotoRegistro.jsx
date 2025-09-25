import { Dialog, DialogTitle, DialogContent, IconButton, Grid } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function ModalFotosRegistro({ open, onClose, imagenes = [] }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Fotos del Registro
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          {imagenes.map((url, idx) => (
            <Grid item xs={6} sm={4} md={3} key={idx}>
              <img
                src={url}
                alt={`etiqueta-${idx}`}
                style={{
                  width: "100%",
                  height: 150,
                  objectFit: "cover",
                  borderRadius: 8,
                  cursor: "pointer",
                  boxShadow: "0 0 6px rgba(0,0,0,0.2)"
                }}
                onClick={() => window.open(url, "_blank")}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
