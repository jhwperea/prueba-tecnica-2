import Chip from '@mui/material/Chip';

const STATUS_LABELS = {
  RECIBIDA: 'Recibida',
  DIAGNOSTICO: 'Diagnóstico',
  EN_PROCESO: 'En Proceso',
  LISTA: 'Lista para Entrega',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
};

const STATUS_COLORS = {
  RECIBIDA: 'info',
  DIAGNOSTICO: 'warning',
  EN_PROCESO: 'primary',
  LISTA: 'secondary',
  ENTREGADA: 'success',
  CANCELADA: 'error',
};

export default function OrderStatusChip({ status, size = 'small' }) {
  return <Chip label={STATUS_LABELS[status] || status} color={STATUS_COLORS[status] || 'default'} size={size} />;
}
