import { useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { showSuccess, showError } from 'services/ToastService';
import { saveClientAPI } from 'api/requests/clientsApi';

import BaseDialog from 'ui-component/extended/BaseDialog';
import Button from '@mui/material/Button';

import GenericFormSection from 'ui-component/extended/GenericFormSection';
import { STATUS_OPTIONS } from 'utils/constants';

const ClientDialog = forwardRef(({ addItem, updateItem }, ref) => {
  const [visible, setVisible] = useState(false);
  const [cliId, setCliId] = useState(0);
  const [loading, setLoading] = useState(false);

  const methods = useForm({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      staId: 1,
    },
  });

  const { handleSubmit, reset } = methods;

  const fields = useMemo(
    () => [
      { key: 'name', name: 'name', type: 'text', label: 'Nombre Completo', required: true, validation: { required: 'El nombre es requerido' }, grid: { xs: 12 } },
      { key: 'phone', name: 'phone', type: 'text', label: 'Teléfono', required: true, validation: { required: 'El teléfono es requerido' }, grid: { xs: 12, sm: 6 } },
      { key: 'email', name: 'email', type: 'text', label: 'Correo Electrónico', grid: { xs: 12, sm: 6 }, props: { type: 'email' } },
      { key: 'staId', name: 'staId', type: 'selectButton', label: 'Estado', options: STATUS_OPTIONS, grid: { xs: 12 } },
    ],
    []
  );

  const newClient = () => {
    setCliId(0);
    reset({ name: '', phone: '', email: '', staId: 1 });
    setVisible(true);
  };

  const editClient = (item) => {
    setCliId(item.cliId);
    reset({
      name: item.name || '',
      phone: item.phone || '',
      email: item.email || '',
      staId: item.staId || 1,
    });
    setVisible(true);
  };

  useImperativeHandle(ref, () => ({ newClient, editClient }));

  const onSubmit = async (formData) => {
    const payload = { cliId, ...formData };

    setLoading(true);
    try {
      const { data } = await saveClientAPI(payload);

      const clientItem = {
        cliId: cliId > 0 ? cliId : data.cliId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        staId: formData.staId,
        statusName: formData.staId === 1 ? 'Activo' : 'Inactivo',
        bikesCount: 0,
      };

      if (cliId > 0) {
        updateItem(clientItem);
      } else {
        addItem(clientItem);
      }

      setVisible(false);
      showSuccess(data.message || 'Cliente guardado con éxito.');
    } catch (err) {
      console.error('Error saving client:', err);
      showError(err.response?.data?.message || 'Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseDialog
      open={visible}
      onClose={() => setVisible(false)}
      title={cliId ? 'Editar Cliente' : 'Nuevo Cliente'}
      maxWidth="sm"
      loading={loading}
      actions={
        <>
          <Button onClick={() => setVisible(false)}>Cancelar</Button>
          <Button variant="contained" color="secondary" onClick={handleSubmit(onSubmit)} disabled={loading}>
            {cliId ? 'Guardar Cambios' : 'Guardar'}
          </Button>
        </>
      }
    >
      {!loading && (
        <FormProvider {...methods}>
          <GenericFormSection fields={fields} />
        </FormProvider>
      )}
    </BaseDialog>
  );
});

export default ClientDialog;
