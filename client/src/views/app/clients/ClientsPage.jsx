import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';

import { IconEdit, IconTrash, IconPlus, IconFilter, IconMotorbike } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import FilterPopper from 'ui-component/extended/FilterPopper';
import DataTable from 'ui-component/extended/DataTable';
import StatusChip from 'ui-component/extended/StatusChip';
import ClientDialog from './components/ClientDialog';
import { paginationClientsAPI, deleteClientAPI } from 'api/requests/clientsApi';
import { useAuth } from 'contexts/authContext';
import { config as permConfig } from 'contexts/permissions/permissionsConfig';
import { STATUS_OPTIONS } from 'utils/constants';

export default function ClientsPage() {
  const { hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState(1);

  const initialFilters = { name: '', phone: '', email: '' };
  const [filters, setFilters] = useState(initialFilters);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const filterOpen = Boolean(filterAnchorEl);

  const handleSetFilters = (nextFilters) => {
    setFilters(nextFilters);
    setPage(0);
  };

  const handleToggleFilters = (event) => {
    setFilterAnchorEl((prev) => (prev ? null : event.currentTarget));
  };

  const handleCloseFilters = () => setFilterAnchorEl(null);

  const canCreate = hasPermission(permConfig.taller.clients.create);
  const canEdit = hasPermission(permConfig.taller.clients.edit);
  const canDelete = hasPermission(permConfig.taller.clients.delete);

  const clientFormRef = useRef(null);

  const handleNewClient = () => clientFormRef.current?.newClient();
  const handleEditClient = (item) => clientFormRef.current?.editClient(item);

  const handleAddClient = (item) => {
    setRows((prev) => [item, ...prev]);
    setTotal((prev) => prev + 1);
  };

  const handleUpdateClient = (item) => {
    setRows((prev) => prev.map((row) => (row.cliId === item.cliId ? { ...row, ...item } : row)));
  };

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await paginationClientsAPI({
        name: filters.name,
        phone: filters.phone,
        email: filters.email,
        rows: rowsPerPage,
        first: page * rowsPerPage,
        sortField,
        sortOrder,
      });
      setRows(data.results ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error('Error cargando clientes:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.name, filters.phone, filters.email, page, rowsPerPage, sortField, sortOrder]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Permite llegar desde el Dashboard con el formulario de creación ya abierto
  useEffect(() => {
    if (location.state?.autoNew) {
      clientFormRef.current?.newClient();
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

  const handleDelete = async (cliId) => {
    try {
      await deleteClientAPI({ cliId });
      fetchClients();
    } catch (err) {
      console.error('Error eliminando cliente:', err);
    }
  };

  const filterOptions = useMemo(
    () => [
      { type: 'input', key: 'name', label: 'Nombre', filtro: filters.name, grid: { xs: 12, sm: 6 } },
      { type: 'input', key: 'phone', label: 'Teléfono', filtro: filters.phone, grid: { xs: 12, sm: 6 } },
      { type: 'input', key: 'email', label: 'Correo', filtro: filters.email, grid: { xs: 12 } },
    ],
    [filters]
  );

  const columns = [
    { id: 'name', label: 'Nombre', sortable: true },
    { id: 'phone', label: 'Teléfono', sortable: true },
    { id: 'email', label: 'Correo', sortable: true },
    {
      id: 'bikesCount',
      label: 'Motos',
      render: (row) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <IconMotorbike size={16} />
          <span>{row.bikesCount ?? 0}</span>
        </Stack>
      ),
    },
    {
      id: 'status',
      label: 'Estado',
      render: (row) => <StatusChip staId={row.staId} label={row.statusName} />,
    },
  ];

  const actionItems = (row) => [
    ...(canEdit ? [{ label: 'Editar', icon: <IconEdit size={16} />, command: () => handleEditClient(row), color: '#fda53a' }] : []),
    ...(canDelete
      ? [
          {
            label: 'Eliminar',
            icon: <IconTrash size={16} />,
            command: () => handleDelete(row.cliId),
            color: '#f43f51',
            confirm: `¿Está seguro de eliminar el cliente "${row.name}"?`,
          },
        ]
      : []),
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
            <Button variant="contained" startIcon={<IconPlus size={16} />} size="small" onClick={handleNewClient}>
              Nuevo Cliente
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
        keyExtractor={(row) => row.cliId}
        cardTitleRender={(row) => row.name}
        actions={actionItems}
      />

      <ClientDialog ref={clientFormRef} addItem={handleAddClient} updateItem={handleUpdateClient} />
    </MainCard>
  );
}
