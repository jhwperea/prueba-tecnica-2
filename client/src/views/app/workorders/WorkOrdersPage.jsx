import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';

import { IconEye, IconPlus, IconFilter } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import FilterPopper from 'ui-component/extended/FilterPopper';
import DataTable from 'ui-component/extended/DataTable';
import OrderStatusChip from './components/OrderStatusChip';
import CreateOrderDialog from './components/CreateOrderDialog';
import { paginationWorkOrdersAPI } from 'api/requests/workOrdersApi';
import { useAuth } from 'contexts/authContext';
import { config as permConfig } from 'contexts/permissions/permissionsConfig';

const STATUS_FILTER_OPTIONS = [
  { value: 'RECIBIDA', label: 'Recibida' },
  { value: 'DIAGNOSTICO', label: 'Diagnóstico' },
  { value: 'EN_PROCESO', label: 'En Proceso' },
  { value: 'LISTA', label: 'Lista para Entrega' },
  { value: 'ENTREGADA', label: 'Entregada' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

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

export default function WorkOrdersPage() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('entryDate');
  const [sortOrder, setSortOrder] = useState(-1);

  const initialFilters = { plate: '', status: '' };
  const [filters, setFilters] = useState(initialFilters);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const filterOpen = Boolean(filterAnchorEl);

  const handleSetFilters = (nextFilters) => {
    setFilters(nextFilters);
    setPage(0);
  };

  const handleToggleFilters = (event) => setFilterAnchorEl((prev) => (prev ? null : event.currentTarget));
  const handleCloseFilters = () => setFilterAnchorEl(null);

  const canCreate = hasPermission(permConfig.taller.workOrders.create);

  const createDialogRef = useRef(null);
  const handleNewOrder = () => createDialogRef.current?.open();
  const handleOrderCreated = (order) => navigate(`/taller/work-orders/${order.ordId}`);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await paginationWorkOrdersAPI({
        status: filters.status,
        plate: filters.plate,
        rows: rowsPerPage,
        first: page * rowsPerPage,
        sortField,
        sortOrder,
      });
      setRows(data.results ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error('Error cargando órdenes de trabajo:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.plate, page, rowsPerPage, sortField, sortOrder]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Permite llegar desde el Dashboard con el formulario de creación ya abierto
  useEffect(() => {
    if (location.state?.autoNew) {
      createDialogRef.current?.open();
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((o) => (o === 1 ? -1 : 1));
    } else {
      setSortField(field);
      setSortOrder(1);
    }
    setPage(0);
  };

  const filterOptions = useMemo(
    () => [
      { type: 'input', key: 'plate', label: 'Placa', filtro: filters.plate, grid: { xs: 12, sm: 6 } },
      {
        type: 'dropdown',
        key: 'status',
        label: 'Estado',
        filtro: filters.status,
        grid: { xs: 12, sm: 6 },
        props: { options: STATUS_FILTER_OPTIONS },
      },
    ],
    [filters]
  );

  const columns = [
    { id: 'ordId', label: 'ID', sortable: true, render: (row) => `#${row.ordId}` },
    { id: 'placa', label: 'Placa / Moto', render: (row) => `${row.bike?.placa || ''} · ${row.bike?.brand || ''} ${row.bike?.model || ''}` },
    { id: 'clientName', label: 'Cliente', render: (row) => row.bike?.client?.name || 'N/A' },
    { id: 'entryDate', label: 'Fecha Ingreso', sortable: true, render: (row) => formatDate(row.entryDate) },
    { id: 'status', label: 'Estado', render: (row) => <OrderStatusChip status={row.status} /> },
    { id: 'total', label: 'Total', sortable: true, render: (row) => formatCurrency(row.total) },
  ];

  const actionItems = (row) => [
    { label: 'Ver Detalle', icon: <IconEye size={16} />, command: () => navigate(`/taller/work-orders/${row.ordId}`), color: '#2196f3' },
  ];

  const activeFilterCount = Object.values(filters).filter((v) => v !== '' && v != null).length;

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={2}>
          <Badge badgeContent={activeFilterCount} color="primary" size="small">
            <Button variant="outlined" size="small" startIcon={<IconFilter size={16} />} onClick={handleToggleFilters}>
              Filtros
            </Button>
          </Badge>
          {canCreate && (
            <Button variant="contained" startIcon={<IconPlus size={16} />} size="small" onClick={handleNewOrder}>
              Nueva Orden
            </Button>
          )}
        </Stack>
      }
    >
      <FilterPopper
        anchorEl={filterAnchorEl}
        open={filterOpen}
        onClose={handleCloseFilters}
        filters={filterOptions}
        setFilters={handleSetFilters}
        initialFilters={initialFilters}
      />

      <DataTable
        columns={columns}
        rows={rows}
        total={total}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(+e.target.value);
          setPage(0);
        }}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        keyExtractor={(row) => row.ordId}
        cardTitleRender={(row) => `Orden #${row.ordId} — ${row.bike?.placa || ''}`}
        actions={actionItems}
      />

      <CreateOrderDialog ref={createDialogRef} onCreated={handleOrderCreated} />
    </MainCard>
  );
}
