import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';

import { IconEdit, IconTrash, IconPlus, IconFilter } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import FilterPopper from 'ui-component/extended/FilterPopper';
import DataTable from 'ui-component/extended/DataTable';
import StatusChip from 'ui-component/extended/StatusChip';
import BikeDialog from './components/BikeDialog';
import { paginationBikesAPI, deleteBikeAPI } from 'api/requests/bikesApi';
import { useAuth } from 'contexts/authContext';
import { config as permConfig } from 'contexts/permissions/permissionsConfig';

export default function BikesPage() {
  const { hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('plate');
  const [sortOrder, setSortOrder] = useState(1);

  const initialFilters = { plate: '', brand: '' };
  const [filters, setFilters] = useState(initialFilters);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const filterOpen = Boolean(filterAnchorEl);

  const handleSetFilters = (nextFilters) => {
    setFilters(nextFilters);
    setPage(0);
  };

  const handleToggleFilters = (event) => setFilterAnchorEl((prev) => (prev ? null : event.currentTarget));
  const handleCloseFilters = () => setFilterAnchorEl(null);

  const canCreate = hasPermission(permConfig.taller.bikes.create);
  const canEdit = hasPermission(permConfig.taller.bikes.edit);
  const canDelete = hasPermission(permConfig.taller.bikes.delete);

  const bikeFormRef = useRef(null);

  const handleNewBike = () => bikeFormRef.current?.newBike();
  const handleEditBike = (item) => bikeFormRef.current?.editBike(item);

  const handleAddBike = (item) => {
    setRows((prev) => [item, ...prev]);
    setTotal((prev) => prev + 1);
  };

  const handleUpdateBike = (item) => {
    setRows((prev) => prev.map((row) => (row.bikId === item.bikId ? { ...row, ...item } : row)));
  };

  const fetchBikes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await paginationBikesAPI({
        plate: filters.plate,
        brand: filters.brand,
        rows: rowsPerPage,
        first: page * rowsPerPage,
        sortField,
        sortOrder,
      });
      setRows(data.results ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error('Error cargando motos:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.plate, filters.brand, page, rowsPerPage, sortField, sortOrder]);

  useEffect(() => {
    fetchBikes();
  }, [fetchBikes]);

  // Permite llegar desde el Dashboard con el formulario de creación ya abierto
  useEffect(() => {
    if (location.state?.autoNew) {
      bikeFormRef.current?.newBike();
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

  const handleDelete = async (bikId) => {
    try {
      await deleteBikeAPI({ bikId });
      fetchBikes();
    } catch (err) {
      console.error('Error eliminando moto:', err);
    }
  };

  const filterOptions = useMemo(
    () => [
      { type: 'input', key: 'plate', label: 'Placa', filtro: filters.plate, grid: { xs: 12, sm: 6 } },
      { type: 'input', key: 'brand', label: 'Marca', filtro: filters.brand, grid: { xs: 12, sm: 6 } },
    ],
    [filters]
  );

  const columns = [
    { id: 'plate', label: 'Placa', sortable: true },
    { id: 'brand', label: 'Marca', sortable: true },
    { id: 'model', label: 'Modelo', sortable: true },
    { id: 'cylinder', label: 'Cilindraje' },
    { id: 'clientName', label: 'Propietario', sortable: true },
    {
      id: 'status',
      label: 'Estado',
      render: (row) => <StatusChip staId={row.staId} label={row.statusName} />,
    },
  ];

  const actionItems = (row) => [
    ...(canEdit ? [{ label: 'Editar', icon: <IconEdit size={16} />, command: () => handleEditBike(row), color: '#fda53a' }] : []),
    ...(canDelete
      ? [
          {
            label: 'Eliminar',
            icon: <IconTrash size={16} />,
            command: () => handleDelete(row.bikId),
            color: '#f43f51',
            confirm: `¿Está seguro de eliminar la moto de placa "${row.plate}"?`,
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
            <Button variant="contained" startIcon={<IconPlus size={16} />} size="small" onClick={handleNewBike}>
              Nueva Moto
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
        keyExtractor={(row) => row.bikId}
        cardTitleRender={(row) => row.plate}
        actions={actionItems}
      />

      <BikeDialog ref={bikeFormRef} addItem={handleAddBike} updateItem={handleUpdateBike} />
    </MainCard>
  );
}
