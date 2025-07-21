import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import {eliminarEnvio} from '../../utils/eliminarEnvio';
import {cancelarEnvio} from '../../utils/cancelarEnvio';
import { useSnackbar } from 'notistack';

export default function ModalEliminarEnvio({ envio, onClose}) {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleConfirmar = async () => {
    setLoading(true);
    try {
      if (envio.estado === 'Pendiente') {
        await eliminarEnvio(envio.id);
        enqueueSnackbar('Envío eliminado correctamente.', { variant: 'success' });
      } else {
        await cancelarEnvio(envio.id);
        enqueueSnackbar('Envío cancelado correctamente.', { variant: 'success' });
      }

       // Refrescar tabla
      onClose?.();  // Cerrar modal
    } catch (error) {
      enqueueSnackbar('Ocurrió un error al procesar la acción.', { variant: 'error' });
      console.error("Error al eliminar/cancelar envío:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={Boolean(envio)} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmar acción</DialogTitle>
      <DialogContent>
        <Typography>
          ¿Estás seguro de que querés {envio?.estado === 'Pendiente' ? 'eliminar' : 'cancelar'} el envío a:
        </Typography>
        <Typography fontWeight="bold" mt={1}>
          {envio?.recieverName} – {envio?.recieverAddress}
        </Typography>
        <Typography mt={2}>
          Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          No
        </Button>
        <Button
          onClick={handleConfirmar}
          color={envio?.estado === 'Pendiente' ? 'error' : 'warning'}
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : envio?.estado === 'Pendiente' ? 'Eliminar' : 'Si'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
