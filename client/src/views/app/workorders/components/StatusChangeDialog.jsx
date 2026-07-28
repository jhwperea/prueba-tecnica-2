import { useState, forwardRef, useImperativeHandle } from 'react';
import { showSuccess, showError } from 'services/ToastService';
import { updateOrderStatusAPI } from 'api/requests/workOrdersApi';

import BaseDialog from 'ui-component/extended/BaseDialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

const STATUS_LABELS = {
  RECIBIDA: 'Recibida',
  DIAGNOSTICO: 'Diagnóstico',
  EN_PROCESO: 'En Proceso',
  LISTA: 'Lista para Entrega',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
};

const StatusChangeDialog = forwardRef(({ onChanged }, ref) => {
  const [visible, setVisible] = useState(false);
  const [ordId, setOrdId] = useState(0);
  const [targetStatus, setTargetStatus] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const open = (orderId, nextStatus) => {
    setOrdId(orderId);
    setTargetStatus(nextStatus);
    setNote('');
    setError(null);
    setVisible(true);
  };

  useImperativeHandle(ref, () => ({ open }));

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await updateOrderStatusAPI({ ordId, toStatus: targetStatus, note });
      setVisible(false);
      showSuccess('Estado de la orden actualizado.');
      onChanged(data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al actualizar el estado de la orden.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseDialog
      open={visible}
      onClose={() => setVisible(false)}
      title="Confirmar Cambio de Estado"
      maxWidth="xs"
      actions={
        <>
          <Button onClick={() => setVisible(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="contained" color="secondary" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Guardando…' : 'Confirmar Cambio'}
          </Button>
        </>
      }
    >
      <Typography variant="body2" sx={{ mb: 2 }}>
        Vas a cambiar el estado de la orden a <strong>{STATUS_LABELS[targetStatus] || targetStatus}</strong>.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        label="Motivo o Nota de Cambio (Opcional)"
        multiline
        minRows={3}
        fullWidth
        size="small"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ej: Mantenimiento concluido. Pruebas de rodaje ok..."
      />
    </BaseDialog>
  );
});

export default StatusChangeDialog;
