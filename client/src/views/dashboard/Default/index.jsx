import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';

import CardGrid from 'ui-component/cards/CardGrid';
import MainCard from 'ui-component/cards/MainCard';
import OrderStatusChip from 'views/app/workorders/components/OrderStatusChip';
import { gridSpacing } from 'store/constant';

import { getClientsAPI } from 'api/requests/clientsApi';
import { getBikesAPI } from 'api/requests/bikesApi';
import { paginationWorkOrdersAPI } from 'api/requests/workOrdersApi';

import {
  IconUserCircle,
  IconMotorbike,
  IconClipboardList,
  IconCircleCheck,
  IconPlus,
} from '@tabler/icons-react';

const ACTIVE_STATUSES = ['RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA'];
const STATUS_ORDER = ['RECIBIDA', 'DIAGNOSTICO', 'EN_PROCESO', 'LISTA', 'ENTREGADA', 'CANCELADA'];
const STATUS_LABELS = {
  RECIBIDA: 'Recibida',
  DIAGNOSTICO: 'Diagnóstico',
  EN_PROCESO: 'En Proceso',
  LISTA: 'Lista para Entrega',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
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

export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [clientsCount, setClientsCount] = useState(0);
  const [bikesCount, setBikesCount] = useState(0);
  const [orders, setOrders] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [clientsRes, bikesRes, ordersRes] = await Promise.all([
        getClientsAPI(),
        getBikesAPI(),
        paginationWorkOrdersAPI({ rows: 1000, first: 0, sortField: 'entryDate', sortOrder: -1 }),
      ]);
      setClientsCount((clientsRes.data ?? []).length);
      setBikesCount((bikesRes.data ?? []).length);
      setOrders(ordersRes.data?.results ?? []);
    } catch (err) {
      console.error('Error cargando datos del dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0]));
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status] += 1;
    });
    return counts;
  }, [orders]);

  const activeOrdersCount = useMemo(
    () => orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
    [orders],
  );

  const deliveredCount = statusCounts.ENTREGADA;

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders]);

  const kpiCards = [
    {
      titulo: 'Clientes',
      icono: <IconUserCircle size={22} />,
      backgroundColor: '#eef2ff',
      backgroundColorIcon: '#4f46e5',
      contador: clientsCount,
      subtitulo: 'Registrados en el taller',
      onClick: () => navigate('/taller/clients'),
    },
    {
      titulo: 'Motos',
      icono: <IconMotorbike size={22} />,
      backgroundColor: '#f0fdf4',
      backgroundColorIcon: '#16a34a',
      contador: bikesCount,
      subtitulo: 'Registradas en el taller',
      onClick: () => navigate('/taller/bikes'),
    },
    {
      titulo: 'Órdenes Activas',
      icono: <IconClipboardList size={22} />,
      backgroundColor: '#fffbeb',
      backgroundColorIcon: '#d97706',
      contador: activeOrdersCount,
      subtitulo: 'En proceso ahora mismo',
      onClick: () => navigate('/taller/work-orders'),
    },
    {
      titulo: 'Entregadas',
      icono: <IconCircleCheck size={22} />,
      backgroundColor: '#f0fdfa',
      backgroundColorIcon: '#0d9488',
      contador: deliveredCount,
      subtitulo: 'Órdenes finalizadas',
      onClick: () => navigate('/taller/work-orders'),
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" sx={{ py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={gridSpacing}>
      {kpiCards.map((card, index) => (
        <Grid key={index} size={{ lg: 3, md: 6, sm: 6, xs: 12 }}>
          <CardGrid {...card} isButton />
        </Grid>
      ))}

      <Grid size={{ xs: 12 }}>
        <MainCard title="Accesos Rápidos">
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<IconPlus size={16} />}
              onClick={() => navigate('/taller/work-orders', { state: { autoNew: true } })}
            >
              Nueva Orden
            </Button>
            <Button
              variant="outlined"
              startIcon={<IconPlus size={16} />}
              onClick={() => navigate('/taller/clients', { state: { autoNew: true } })}
            >
              Nuevo Cliente
            </Button>
            <Button
              variant="outlined"
              startIcon={<IconPlus size={16} />}
              onClick={() => navigate('/taller/bikes', { state: { autoNew: true } })}
            >
              Nueva Moto
            </Button>
          </Stack>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <MainCard title="Órdenes por Estado">
          <Stack spacing={1.5}>
            {STATUS_ORDER.map((status) => (
              <Stack key={status} direction="row" alignItems="center" justifyContent="space-between">
                <OrderStatusChip status={status} />
                <Typography variant="h4">{statusCounts[status]}</Typography>
              </Stack>
            ))}
          </Stack>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <MainCard title="Órdenes Recientes">
          {recentOrders.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Todavía no hay órdenes de trabajo registradas.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Placa</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Ingreso</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow
                    key={order.ordId}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/taller/work-orders/${order.ordId}`)}
                  >
                    <TableCell>{order.bike?.placa}</TableCell>
                    <TableCell>{order.bike?.client?.name}</TableCell>
                    <TableCell>
                      <OrderStatusChip status={order.status} />
                    </TableCell>
                    <TableCell align="right">{formatCurrency(order.total)}</TableCell>
                    <TableCell>{formatDate(order.entryDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}
