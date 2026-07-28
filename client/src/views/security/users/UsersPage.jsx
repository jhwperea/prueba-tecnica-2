import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';

import { IconEdit, IconTrash, IconPlus, IconKey, IconFilter } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import FilterPopper from 'ui-component/extended/FilterPopper';
import DataTable from 'ui-component/extended/DataTable';
import StatusChip from 'ui-component/extended/StatusChip';
import UserDialog from './components/UserDialog';
import PermissionsDrawer from '../profiles/components/PermissionsDrawer';
import { paginationUsersAPI, deleteUserAPI } from 'api/requests/usersApi';
import { useAuth } from 'contexts/authContext';
import { config as permConfig } from 'contexts/permissions/permissionsConfig';
import { STATUS_OPTIONS } from 'utils/constants';

export default function UsersPage() {
  const { user, hasPermission } = useAuth();

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState(1);

  const initialFilters = { name: '', lastName: '', identification: '', email: '' };
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

  const handleCloseFilters = () => {
    setFilterAnchorEl(null);
  };

  const canCreate = hasPermission(permConfig.security.users.create);
  const canEdit = hasPermission(permConfig.security.users.edit);
  const canDelete = hasPermission(permConfig.security.users.delete);
  const canAssignPermission = hasPermission(permConfig.security.users.assignPermission);

  // console.log({ canCreate, canEdit, canDelete, canAssignPermission })

  const userFormRef = useRef(null);
  const [permissionsVisible, setPermissionsVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleNewUser = () => userFormRef.current?.newUser();
  const handleEditUser = (item) => userFormRef.current?.editUser(item);

  const handleAddUser = (item) => {
    setRows((prev) => [item, ...prev]);
    setTotal((prev) => prev + 1);
  };

  const handleUpdateUser = (item) => {
    setRows((prev) => prev.map((row) => (row.useId === item.useId ? { ...row, ...item } : row)));
  };

  const handleOpenPermissions = (item) => {
    setSelectedUser(item);
    setPermissionsVisible(true);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await paginationUsersAPI({
        useId: user?.useId,
        name: filters.name,
        email: filters.email,
        lastName: filters.lastName,
        identification: filters.identification,
        username: '',
        staId: '',
        proId: '',
        rows: rowsPerPage,
        first: page * rowsPerPage,
        sortField,
        sortOrder
      });
      setRows(data.results ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoading(false);
    }
  }, [user, filters.name, filters.lastName, filters.identification, filters.email, page, rowsPerPage, sortField, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((o) => (o === 1 ? -1 : 1));
    } else {
      setSortField(field);
      setSortOrder(1);
    }
    setPage(0);
  };

  const handleDelete = async (useId) => {
    try {
      await deleteUserAPI({ useId });
      fetchUsers();
    } catch (err) {
      console.error('Error eliminando usuario:', err);
    }
  };

  const filterOptions = useMemo(() => [
      { type: 'input', key: 'name', label: 'Nombre', filtro: filters.name, grid: { xs: 12, sm: 6 } },
      { type: 'input', key: 'lastName', label: 'Apellido', filtro: filters.lastName, grid: { xs: 12, sm: 6 } },
      { type: 'input', key: 'identification', label: 'NIT / CC', filtro: filters.identification, grid: { xs: 12, sm: 6 } },
      { type: 'input', key: 'email', label: 'Correo', filtro: filters.email, grid: { xs: 12, sm: 6 } },
      {
        type: 'dropdown',
        key: 'staId',
        label: 'Estado',
        filtro: filters.staId,
        grid: { xs: 12, sm: 6 },
        props: {
            options: STATUS_OPTIONS,
          },
      },
    ], [filters]);

  const columns = [
    { id: 'name', label: 'Nombre', sortable: true },
    { id: 'lastName', label: 'Apellido' },
    { id: 'identification', label: 'NIT / CC' },
    { id: 'email', label: 'Correo' },
    { id: 'profile', label: 'Perfil', render: (row) => row.profileName },
    {
      id: 'status',
      label: 'Estado',
      render: (row) => (
        <StatusChip staId={row.staId} label={row.statusName} />
      ),
    },
  ];

  const actionItems = (row) => [
    ...(canAssignPermission
      ? [{ label: 'Permisos', icon: <IconKey size={16} />, command: () => handleOpenPermissions(row), color: '#0eb0e9' }]
      : []),
    ...(canEdit
      ? [{ label: 'Editar', icon: <IconEdit size={16} />, command: () => handleEditUser(row), color: '#fda53a' }]
      : []),
    ...(canDelete
      ? [{ label: 'Eliminar', icon: <IconTrash size={16} />, command: () => handleDelete(row.useId), color: '#f43f51', confirm: `¿Está seguro de eliminar el usuario "${row.name} ${row.lastName}"?` }]
      : []),
  ];

  const activeFilterCount = Object.values(filters).filter((v) => v !== '' && v != null).length;

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={2}>
          <Badge badgeContent={activeFilterCount} color="primary" size="small">
            <Button
              variant="outlined"
              size="small"
              startIcon={<IconFilter size={16} />}
              onClick={handleToggleFilters}
            >
              Filtros
            </Button>
          </Badge>
          {canCreate && (
            <Button variant="contained" startIcon={<IconPlus size={16} />} size="small" onClick={handleNewUser}>
              Nuevo Usuario
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
        onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        keyExtractor={(row) => row.useId}
        cardTitleRender={(row) => `${row.name} ${row.lastName}`}
        actions={actionItems}
      />

      <UserDialog ref={userFormRef} addItem={handleAddUser} updateItem={handleUpdateUser} />
      <PermissionsDrawer
        visible={permissionsVisible}
        setVisible={setPermissionsVisible}
        title={`Permisos usuario: ${selectedUser?.name ?? ''} ${selectedUser?.lastName ?? ''}`}
        opc={2}
        usuId={selectedUser?.useId}
      />
    </MainCard>
  );
}
