import { useState, useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useAuth } from 'contexts/authContext';
import { showSuccess, showError } from 'services/ToastService';
import BaseDialog from 'ui-component/extended/BaseDialog';
import GenericFormSection from 'ui-component/extended/GenericFormSection';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Accordion from 'ui-component/extended/Accordion';
import { getBasicInformationAPI, updateAccountAPI } from 'api/requests/usersApi';
import { ChangePassword } from './ChangePassword';
import Divider from '@mui/material/Divider';

export const AccountSettings = ({ visible, setVisible }) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const methods = useForm({
    defaultValues: { name: '', lastName: '', username: '', email: '' }
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (visible && user?.useId) {
      getBasicInformationAPI({ useId: user.useId })
        .then(({ data }) => {
          reset({
            name: data.name || '',
            lastName: data.lastName || '',
            username: data.username || '',
            email: data.email || '',
          });
        })
        .catch((error) => {
          showError(error.response?.data?.message || 'Error al obtener información');
        });
    }
  }, [visible, user?.useId, reset]);

  const basicFields = useMemo(() => [
    { key: 'name', name: 'name', type: 'text', label: 'Nombre', grid: { xs: 12, sm: 6 } },
    { key: 'lastName', name: 'lastName', type: 'text', label: 'Apellido', grid: { xs: 12, sm: 6 } },
    { key: 'username', name: 'username', type: 'text', label: 'Usuario', grid: { xs: 12, sm: 6 } },
    { key: 'email', name: 'email', type: 'text', label: 'Correo Electrónico', grid: { xs: 12, sm: 6 } },
  ], []);

  const accordionData = useMemo(() => [
    { id: 'change-password', title: 'Cambiar contraseña', content: <ChangePassword /> },
  ], []);

  const onSubmit = async ({ name, lastName, username, email }) => {
    setSaving(true);
    try {
      const { data } = await updateAccountAPI({ name, lastName, username, email, useId: user.useId });
      showSuccess(data.message);
      setVisible(false);
    } catch (error) {
      showError(error.response?.data?.message || 'Error al guardar los datos');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseDialog
      open={visible}
      onClose={() => { setVisible(false); reset(); }}
      title="Configuración de Cuenta"
      maxWidth="sm"
      actions={
        <>
          <Button onClick={() => { setVisible(false); reset(); }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={saving}>
            Guardar
          </Button>
        </>
      }
    >
      <FormProvider {...methods}>
        <GenericFormSection fields={basicFields} />
      </FormProvider>
      <Divider sx={{ my: 2 }} />
      <Box
        sx={{
          mt: 2,
          '& .MuiAccordion-root': {
            bgcolor: 'grey.100',
            '&:before': { display: 'none' },
            borderRadius: 1,
          },
          '& .MuiAccordionSummary-root': {
            bgcolor: 'grey.200',
            borderTopLeftRadius: 1,
            borderTopRightRadius: 1,
          },
        }}
      >
        <Accordion data={accordionData} />
      </Box>
    </BaseDialog>
  );
};
