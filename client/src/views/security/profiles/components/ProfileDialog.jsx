import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { showSuccess, showError } from 'services/ToastService';
import { getModulesAPI, saveProfileAPI } from 'api/requests/profilesApi';

import GenericFormSection from 'ui-component/extended/GenericFormSection';
import { STATUS_OPTIONS } from 'utils/constants';
import Box from '@mui/material/Box';
import BaseDialog from 'ui-component/extended/BaseDialog';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';

import { IconChevronRight, IconChevronLeft } from '@tabler/icons-react';


const fieldsConfig = [
  { key: 'name', name: 'name', type: 'text', label: 'Nombre del Perfil', required: true, validation: { required: 'El nombre es requerido' }, grid: { xs: 12, sm: 8 } },
  { key: 'staId', name: 'staId', type: 'selectButton', label: 'Estado', options: STATUS_OPTIONS, grid: { xs: 12, sm: 4 } },
]

const ProfileDialog = forwardRef(({ addItem, updateItem }, ref) => {
  const [visible, setVisible] = useState(false);
  const [proId, setProId] = useState(0);
  const [loading, setLoading] = useState(false);

  const [unassociated, setUnassociated] = useState([]);
  const [associated, setAssociated] = useState([]);
  const [checked, setChecked] = useState([]);
  const [originalAssociated, setOriginalAssociated] = useState([]);

  const methods = useForm({
    defaultValues: { name: '', staId: 1 },
  });

  const { handleSubmit, reset } = methods;

  const getModules = async (id = 0) => {
    setLoading(true);
    try {
      const { data } = await getModulesAPI(id);
      setAssociated(data.associated || []);
      setUnassociated(data.unassociated || []);
      setOriginalAssociated(data.associated || []);
    } catch (err) {
      console.error('Error fetching modules:', err);
    } finally {
      setLoading(false);
    }
  };

  const newProfile = () => {
    setProId(0);
    reset({ name: '', staId: 1 });
    setAssociated([]);
    setUnassociated([]);
    setOriginalAssociated([]);
    setChecked([]);
    setVisible(true);
    getModules(0);
  };

  const editProfile = (item) => {
    setProId(item.proId);
    reset({ name: item.name, staId: item.staId });
    setAssociated([]);
    setUnassociated([]);
    setOriginalAssociated([]);
    setChecked([]);
    setVisible(true);
    getModules(item.proId);
  };

  useImperativeHandle(ref, () => ({
    newProfile,
    editProfile,
  }));

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };

  const handleCheckedRight = () => {
    const checkedToAssociate = unassociated.filter((v) => checked.includes(v.pagId));
    setAssociated((prev) => [...prev, ...checkedToAssociate]);
    setUnassociated((prev) => prev.filter((v) => !checked.includes(v.pagId)));
    setChecked((prev) => prev.filter((id) => !unassociated.map((v) => v.pagId).includes(id)));
  };

  const handleCheckedLeft = () => {
    const checkedToUnassociate = associated.filter((v) => checked.includes(v.pagId));
    setUnassociated((prev) => [...prev, ...checkedToUnassociate]);
    setAssociated((prev) => prev.filter((v) => !checked.includes(v.pagId)));
    setChecked((prev) => prev.filter((id) => !associated.map((v) => v.pagId).includes(id)));
  };

  const onSubmit = async (formData) => {
    const payload = {
      proId,
      name: formData.name,
      staId: formData.staId,
      modules: associated.map((m) => m.pagId),
      previousModules: originalAssociated.map((m) => m.pagId),
    };

    try {
      const { data } = await saveProfileAPI(payload);

      const profileItem = {
        proId: proId > 0 ? proId : data.proId,
        name: formData.name,
        staId: formData.staId,
        statusName: formData.staId === 1 ? 'Activo' : 'Inactivo',
      };

      if (proId > 0) {
        updateItem({ idField: 'proId', ...profileItem });
      } else {
        addItem(profileItem);
      }

      setVisible(false);
      showSuccess(data.message || 'Perfil guardado con éxito.');
    } catch (err) {
      console.error('Error saving profile:', err);
      showError(err.response?.data?.message || 'Error al guardar el perfil');
    }
  };

  const customList = (title, items) => (
    <Paper sx={{ width: '100%', height: 260, overflow: 'auto', border: '1px solid #e0e0e0' }}>
      <Box sx={{ p: 1, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {title} ({items.length})
        </Typography>
      </Box>
      <List dense component="div" role="list">
        {items.map((value) => {
          const labelId = `transfer-list-item-${value.pagId}-label`;
          return (
            <ListItem
              key={value.pagId}
              role="listitem"
              button
              onClick={handleToggle(value.pagId)}
              sx={{ py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Checkbox
                  checked={checked.indexOf(value.pagId) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                  size="small"
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value.description} />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );

  return (
    <BaseDialog
      open={visible}
      onClose={() => setVisible(false)}
      title={proId ? 'Editar Perfil' : 'Nuevo Perfil'}
      maxWidth="md"
      loading={loading}
      actions={
        <>
          <Button onClick={() => setVisible(false)}>Cancelar</Button>
          <Button variant="contained" color="secondary" onClick={handleSubmit(onSubmit)} disabled={loading}>
            {proId ? 'Guardar Cambios' : 'Guardar'}
          </Button>
        </>
      }
    >
      <FormProvider {...methods}>
        <GenericFormSection
          fields={fieldsConfig}
        />
      </FormProvider>

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
          Acceso a Módulos/Páginas
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ flex: 5 }}>
            {customList('Páginas no asignadas', unassociated)}
          </Box>
          <Stack spacing={1} alignItems="center" sx={{ flex: '0 0 auto' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCheckedRight}
              disabled={unassociated.filter((v) => checked.includes(v.pagId)).length === 0}
              aria-label="move selected right"
            >
              <IconChevronRight size={18} />
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCheckedLeft}
              disabled={associated.filter((v) => checked.includes(v.pagId)).length === 0}
              aria-label="move selected left"
            >
              <IconChevronLeft size={18} />
            </Button>
          </Stack>
          <Box sx={{ flex: 5 }}>
            {customList('Páginas asignadas', associated)}
          </Box>
        </Stack>
      </Box>
    </BaseDialog>
  );
});

export default ProfileDialog;
