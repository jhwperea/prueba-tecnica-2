import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { IconArrowLeft, IconPlus, IconTrash, IconArrowRight, IconLock, IconHistory, IconFilter } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import ConfirmDialog from 'ui-component/extended/ConfirmDialog';
import { getWorkOrderAPI, deleteOrderItemAPI } from 'api/requests/workOrdersApi';
import { useAuth } from 'contexts/authContext';
import { config as permConfig } from 'contexts/permissions/permissionsConfig';
import { showSuccess, showError } from 'services/ToastService';

import OrderStatusChip from './components/OrderStatusChip';
import AddItemDialog from './components/AddItemDialog';
import StatusChangeDialog from './components/StatusChangeDialog';

const STATUS_STEPS = ['RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA'];

const ALLOWED_NEXT_STATUS = {
  RECIBIDA: ['DIAGNOSTICO', 'CANCELADA'],
  DIAGNOSTICO: ['EN_PROCESO', 'CANCELADA'],
  EN_PROCESO: ['LISTA', 'CANCELADA'],
  LISTA: ['ENTREGADA', 'CANCELADA'],
  ENTREGADA: ['EN_PROCESO', 'LISTA', 'DIAGNOSTICO'], // Solo con permiso "revert"
  CANCELADA: [],
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function WorkOrderDetail() {
  const { ordId } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('detail');
  const [historyUserFilter, setHistoryUserFilter] = useState('');
  const [deleteItem, setDeleteItem] = useState(null);

  const addItemRef = useRef(null);
  const statusChangeRef = useRef(null);

  const canAddItem = hasPermission(permConfig.taller.workOrders.addItem);
  const canDeleteItem = hasPermission(permConfig.taller.workOrders.deleteItem);
  const canClose = hasPermission(permConfig.taller.workOrders.close);
  const canRevert = hasPermission(permConfig.taller.workOrders.revert);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getWorkOrderAPI({ ordId });
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || `No se encontró la orden de trabajo #${ordId}.`);
    } finally {
      setLoading(false);
    }
  }, [ordId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleOrderUpdated = (updatedOrder) => setOrder(updatedOrder);

  const handleDeleteItem = async () => {
    if (!deleteItem) return;
    try {
      const { data } = await deleteOrderItemAPI({ itemId: deleteItem.itemId });
      setOrder(data.workOrder);
      showSuccess('Ítem eliminado con éxito.');
    } catch (err) {
      showError(err.response?.data?.message || 'No se pudo eliminar el ítem.');
    } finally {
      setDeleteItem(null);
    }
  };

  const filteredHistory = useMemo(() => {
    if (!order?.history) return [];
    if (!historyUserFilter) return order.history;
    const q = historyUserFilter.toLowerCase();
    return order.history.filter(
      (h) => (h.userName || '').toLowerCase().includes(q) || (h.profileName || '').toLowerCase().includes(q)
    );
  }, [order, historyUserFilter]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box maxWidth={600} mx="auto" mt={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Orden no encontrada.'}
        </Alert>
        <Button startIcon={<IconArrowLeft size={16} />} onClick={() => navigate('/taller/work-orders')}>
          Volver al listado
        </Button>
      </Box>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const isTerminal = order.status === 'ENTREGADA' || order.status === 'CANCELADA';
  const isEntregada = order.status === 'ENTREGADA';

  let availableTransitions = ALLOWED_NEXT_STATUS[order.status] || [];
  availableTransitions = availableTransitions.filter((st) => {
    if (['ENTREGADA', 'CANCELADA'].includes(st)) return canClose;
    if (isEntregada) return canRevert;
    return true;
  });

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton onClick={() => navigate('/taller/work-orders')}>
            <IconArrowLeft size={20} />
          </IconButton>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h3">Orden #{order.ordId}</Typography>
              <OrderStatusChip status={order.status} />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Ingreso: {formatDate(order.entryDate)}
            </Typography>
          </Box>
        </Stack>

        <MainCard sx={{ px: 3, py: 1.5 }} border content={false}>
          <Typography variant="caption" color="success.main" fontWeight={700}>
            TOTAL DE LA ORDEN
          </Typography>
          <Typography variant="h3">{formatCurrency(order.total)}</Typography>
        </MainCard>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Detalle y Trabajos" value="detail" />
        <Tab label={`Historial de Cambios (${order.history?.length ?? 0})`} value="history" icon={<IconHistory size={16} />} iconPosition="start" />
      </Tabs>

      {tab === 'detail' && (
        <Stack spacing={2.5}>
          <MainCard title="Progreso de la Orden">
            {order.status === 'CANCELADA' ? (
              <Alert severity="error">Esta orden de trabajo se encuentra CANCELADA. No se permiten más cambios.</Alert>
            ) : isEntregada && !canRevert ? (
              <Alert severity="info" icon={<IconLock size={18} />}>
                Esta orden fue ENTREGADA. Solo un usuario Administrador puede revertir o reabrir su estado.
              </Alert>
            ) : (
              <Stepper activeStep={currentStepIndex} alternativeLabel>
                {STATUS_STEPS.map((st) => (
                  <Step key={st}>
                    <StepLabel>{st.replace('_', ' ')}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            )}

            {(!isTerminal || (isEntregada && canRevert)) && availableTransitions.length > 0 && (
              <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', mr: 1 }}>
                  {isEntregada ? 'Revertir estado (Exclusivo Admin):' : 'Avanzar/Cambiar estado:'}
                </Typography>
                {availableTransitions.map((nextSt) => (
                  <Button
                    key={nextSt}
                    size="small"
                    variant="contained"
                    color={nextSt === 'CANCELADA' ? 'error' : 'primary'}
                    startIcon={nextSt !== 'CANCELADA' ? <IconArrowRight size={16} /> : null}
                    onClick={() => statusChangeRef.current?.open(order.ordId, nextSt)}
                  >
                    {nextSt === 'CANCELADA' ? 'Cancelar Orden' : `Pasar a ${nextSt.replace('_', ' ')}`}
                  </Button>
                ))}
              </Stack>
            )}
          </MainCard>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <MainCard title="Datos de la Moto">
                <Typography variant="h4">{order.bike?.placa}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.bike?.brand} {order.bike?.model} {order.bike?.cylinder ? `(${order.bike?.cylinder} cc)` : ''}
                </Typography>
              </MainCard>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <MainCard title="Datos del Cliente">
                <Typography variant="subtitle1" fontWeight={700}>
                  {order.bike?.client?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tel: {order.bike?.client?.phone}
                </Typography>
                {order.bike?.client?.email && (
                  <Typography variant="body2" color="text.secondary">
                    {order.bike?.client?.email}
                  </Typography>
                )}
              </MainCard>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <MainCard title="Falla Reportada">
                <Typography variant="body2" fontStyle="italic">
                  &quot;{order.faultDescription}&quot;
                </Typography>
              </MainCard>
            </Grid>
          </Grid>

          <MainCard
            title="Ítems de Trabajo y Repuestos"
            secondary={
              !isTerminal &&
              canAddItem && (
                <Button size="small" variant="contained" startIcon={<IconPlus size={16} />} onClick={() => addItemRef.current?.open(order.ordId)}>
                  Agregar Ítem
                </Button>
              )
            }
          >
            {order.items && order.items.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Cantidad</TableCell>
                      <TableCell>Valor Unitario</TableCell>
                      <TableCell>Subtotal</TableCell>
                      {canDeleteItem && !isTerminal && <TableCell align="right">Eliminar</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item) => {
                      const subtotal = Number(item.count) * Number(item.unitValue);
                      return (
                        <TableRow key={item.itemId}>
                          <TableCell>
                            <Chip size="small" label={item.type.replace('_', ' ')} color={item.type === 'REPUESTO' ? 'secondary' : 'primary'} />
                          </TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.count}</TableCell>
                          <TableCell>{formatCurrency(item.unitValue)}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>{formatCurrency(subtotal)}</TableCell>
                          {canDeleteItem && !isTerminal && (
                            <TableCell align="right">
                              <IconButton size="small" color="error" onClick={() => setDeleteItem(item)}>
                                <IconTrash size={16} />
                              </IconButton>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  No hay ítems registrados en esta orden aún.
                </Typography>
              </Box>
            )}
          </MainCard>
        </Stack>
      )}

      {tab === 'history' && (
        <MainCard
          title="Historial de Cambios de Estado"
          secondary={
            <TextField
              size="small"
              placeholder="Filtrar por usuario..."
              value={historyUserFilter}
              onChange={(e) => setHistoryUserFilter(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><IconFilter size={14} /></InputAdornment> } }}
            />
          }
        >
          {filteredHistory.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {historyUserFilter ? 'No se encontraron eventos para el filtro especificado.' : 'No hay historial registrado para esta orden.'}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {filteredHistory.map((item) => (
                <Paper key={item.hisId} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={1}>
                    <Chip
                      size="small"
                      label={`${item.userName?.trim() || 'Usuario desconocido'} (${item.profileName || 'Sistema'})`}
                      color={item.profileName === 'Administrador' ? 'primary' : 'secondary'}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(item.createdAt)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Estado:
                    </Typography>
                    {item.fromStatus ? <OrderStatusChip status={item.fromStatus} /> : <Typography variant="caption" fontStyle="italic">Inicio</Typography>}
                    <IconArrowRight size={16} />
                    <OrderStatusChip status={item.toStatus} />
                  </Stack>
                  {item.note && (
                    <Typography variant="body2" sx={{ mt: 1, pl: 1.5, borderLeft: '3px solid', borderColor: 'primary.main' }}>
                      <strong>Nota:</strong> {item.note}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Stack>
          )}
        </MainCard>
      )}

      <AddItemDialog ref={addItemRef} onAdded={handleOrderUpdated} />
      <StatusChangeDialog ref={statusChangeRef} onChanged={handleOrderUpdated} />
      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDeleteItem}
        title="Eliminar Ítem"
        message={`¿Está seguro de eliminar el ítem "${deleteItem?.description}" de la orden?`}
      />
    </Stack>
  );
}
