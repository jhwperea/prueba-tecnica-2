import React, { useEffect, useState, useCallback } from 'react';
import { showSuccess, showError } from 'services/ToastService';
import httpCliente from 'api/services/httpCliente';

// Material-UI components
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

// Tabler icons
import { IconSearch, IconShield, IconX } from '@tabler/icons-react';

export default function PermissionsDrawer({ visible, setVisible, title, prfId, opc, usuId }) {
  const [ventanas, setVentanas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [permisos, setPermisos] = useState({});
  const [permisosAdd, setPermisosAdd] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  const fetchPermissions = useCallback(async (venIds, initialPermisos) => {
    try {
      const isProfile = opc === 1;
      const endpoint = isProfile
        ? 'security/permissions/get_permissions_profile'
        : 'security/permissions/get_permissions_user_window';

      const payload = isProfile 
        ? { pagIds: venIds, proId: prfId } 
        : { pagIds: venIds, useId: usuId };

      const { data } = await httpCliente.post(endpoint, payload);

      const nextPermisos = { ...initialPermisos };
      data.forEach((perm) => {
        if (!nextPermisos[perm.pagId]) {
          nextPermisos[perm.pagId] = [];
        }
        nextPermisos[perm.pagId].push(perm);
      });

      setPermisos(nextPermisos);
      const assignedPerms = data.filter((p) => p.assigned === 1 || p.assigned === true);
      setPermisosAdd(assignedPerms.map((p) => p.perId));
    } catch (err) {
      console.error('Error fetching permissions details:', err);
    }
  }, [opc, prfId, usuId]);

  const fetchVentanas = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await httpCliente.get('security/permissions/get_windows_profile', { proId: prfId, useId: usuId });

      if (!data || data.length === 0) {
        setVentanas([]);
        setLoading(false);
        return;
      }

      // Filter pages that have a valid parentDescription and are not "Sin Grupo"
      const filtered = data.filter(
        (v) => v.parentDescription && v.parentDescription !== 'Sin Grupo'
      );

      setVentanas(filtered);
      const pagIds = filtered.map((v) => v.pagId);
      await fetchPermissions(pagIds, {});
    } catch (err) {
      console.error('Error fetching windows list:', err);
    } finally {
      setLoading(false);
    }
  }, [prfId, usuId, fetchPermissions]);

  useEffect(() => {
    if (visible) {
      fetchVentanas();
      setSelectedGroup('');
      setSearchTerm('');
    }
  }, [visible, fetchVentanas]);

  // Group windows by parentDescription
  const grouped = ventanas.reduce((acc, v) => {
    const key = v.parentDescription;
    if (!acc[key]) acc[key] = [];
    acc[key].push(v);
    return acc;
  }, {});

  const groups = Object.keys(grouped).map((name) => ({
    name,
    pagOrder: grouped[name][0]?.pagOrder || 0
  })).sort((a, b) => a.pagOrder - b.pagOrder);

  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0].name);
    }
  }, [groups, selectedGroup]);

  const handleAccessAll = (pagId) => {
    const pagePerms = permisos[pagId] || [];
    const isAllSelected = pagePerms.every((p) => permisosAdd.includes(p.perId));

    if (isAllSelected) {
      // Remove all permissions of this page
      const perIdsToRemove = pagePerms.map((p) => p.perId);
      setPermisosAdd((prev) => prev.filter((id) => !perIdsToRemove.includes(id)));
    } else {
      // Add all permissions of this page
      const perIdsToAdd = pagePerms.map((p) => p.perId);
      setPermisosAdd((prev) => [...new Set([...prev, ...perIdsToAdd])]);
    }
  };

  const handleTogglePermission = (perId) => {
    setPermisosAdd((prev) =>
      prev.includes(perId) ? prev.filter((id) => id !== perId) : [...prev, perId]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const isProfile = opc === 1;
      const endpoint = isProfile
        ? 'security/permissions/update_permissions_profile'
        : 'security/permissions/update_permissions_user';

      const payload = isProfile 
        ? { permissions: permisosAdd, proId: prfId } 
        : { permissions: permisosAdd, useId: usuId };

      const { data } = await httpCliente.post(endpoint, payload);

      showSuccess(data.message || 'Permisos guardados correctamente.');
      setVisible(false);
    } catch (err) {
      console.error('Error saving permissions:', err);
      showError('Error al guardar los permisos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={visible}
      onClose={() => setVisible(false)}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 450 }, p: 3, display: 'flex', flexDirection: 'column' }
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h3">{title}</Typography>
        <IconButton onClick={() => setVisible(false)} size="small">
          <IconX size={20} />
        </IconButton>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {loading && (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ flexGrow: 1, gap: 2 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">Obteniendo datos...</Typography>
        </Box>
      )}

      {!loading && ventanas.length === 0 && (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ flexGrow: 1, gap: 2 }}>
          <Typography variant="body1" align="center" color="text.secondary">
            No hay ventanas disponibles para asignar permisos.
          </Typography>
        </Box>
      )}

      {!loading && ventanas.length > 0 && (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', gap: 2 }}>
          <FormControl fullWidth size="small" sx={{ mt: 0.75 }}>
            <InputLabel id="select-group-label">Grupo de Módulos</InputLabel>
            <Select
              labelId="select-group-label"
              value={selectedGroup}
              label="Grupo de Módulos"
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              {groups.map((g) => (
                <MenuItem key={g.name} value={g.name}>
                  {g.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedGroup && (
            <TextField
              size="small"
              placeholder="Buscar permiso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={16} />
                  </InputAdornment>
                )
              }}
              fullWidth
            />
          )}

          <Divider />

          {/* List of Modules & Permissions */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
            {selectedGroup && grouped[selectedGroup] ? (
              grouped[selectedGroup]
                .filter(({ pagId }) => {
                  if (!searchTerm) return true;
                  const perms = permisos[pagId] || [];
                  return perms.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
                })
                .map(({ pagId, description }) => {
                  const pagePerms = permisos[pagId] || [];
                  const isAllSelected = pagePerms.length > 0 && pagePerms.every((p) => permisosAdd.includes(p.perId));

                  return (
                    <Box key={pagId} sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'grey.200' }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {description}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="small"
                              checked={isAllSelected}
                              onChange={() => handleAccessAll(pagId)}
                            />
                          }
                          label={<Typography variant="caption">Acceso total</Typography>}
                          sx={{ m: 0 }}
                        />
                      </Stack>
                      <Divider sx={{ my: 1 }} />
                      <Stack spacing={1}>
                        {pagePerms.map(({ perId, name }) => (
                          <Stack key={perId} direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <IconShield size={16} style={{ color: '#0eb0e9' }} />
                              <Typography variant="body2">{name}</Typography>
                            </Stack>
                            <Switch
                              size="small"
                              checked={permisosAdd.includes(perId)}
                              onChange={() => handleTogglePermission(perId)}
                            />
                          </Stack>
                        ))}
                        {pagePerms.length === 0 && (
                          <Typography variant="caption" color="text.secondary">
                            No hay permisos de acción configurados.
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  );
                })
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                Seleccione un grupo para visualizar los módulos.
              </Typography>
            )}
          </Box>

          {/* Footer buttons */}
          <Box sx={{ pt: 2, mt: 'auto' }}>
            <Button
              variant="contained"
              fullWidth
              color="secondary"
              onClick={handleSave}
              disabled={loading}
              sx={{ py: 1.25 }}
            >
              Guardar Permisos
            </Button>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
