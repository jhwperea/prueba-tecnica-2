import { useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { showSuccess, showError } from 'services/ToastService';
import { saveClientAPI } from 'api/requests/clientsApi';
import { saveBikeAPI } from 'api/requests/bikesApi';

import BaseDialog from 'ui-component/extended/BaseDialog';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import GenericFormSection from 'ui-component/extended/GenericFormSection';

// Registro rápido combinado: crea un Cliente y una Moto en un solo paso,
// equivalente a "QuickClientBikeModal" de la app original.
const QuickRegisterDialog = forwardRef(({ onSuccess }, ref) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const methods = useForm({
    defaultValues: {
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      plate: '',
      brand: '',
      model: '',
      cylinder: '',
    },
  });

  const { handleSubmit, reset } = methods;

  const clientFields = useMemo(
    () => [
      { key: 'clientName', name: 'clientName', type: 'text', label: 'Nombre Completo', required: true, validation: { required: 'El nombre es requerido' }, grid: { xs: 12, sm: 6 } },
      { key: 'clientPhone', name: 'clientPhone', type: 'text', label: 'Teléfono', required: true, validation: { required: 'El teléfono es requerido' }, grid: { xs: 12, sm: 6 } },
      { key: 'clientEmail', name: 'clientEmail', type: 'text', label: 'Correo Electrónico (Opcional)', grid: { xs: 12 }, props: { type: 'email' } },
    ],
    []
  );

  const bikeFields = useMemo(
    () => [
      { key: 'plate', name: 'plate', type: 'text', label: 'Placa', required: true, validation: { required: 'La placa es requerida' }, grid: { xs: 12, sm: 6 } },
      { key: 'brand', name: 'brand', type: 'text', label: 'Marca', required: true, validation: { required: 'La marca es requerida' }, grid: { xs: 12, sm: 6 } },
      { key: 'model', name: 'model', type: 'text', label: 'Modelo', required: true, validation: { required: 'El modelo es requerido' }, grid: { xs: 12, sm: 6 } },
      { key: 'cylinder', name: 'cylinder', type: 'text', label: 'Cilindraje (cc)', grid: { xs: 12, sm: 6 } },
    ],
    []
  );

  const open = (initialPlate = '') => {
    reset({ clientName: '', clientPhone: '', clientEmail: '', plate: initialPlate, brand: '', model: '', cylinder: '' });
    setVisible(true);
  };

  useImperativeHandle(ref, () => ({ open }));

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const { data: clientData } = await saveClientAPI({
        cliId: 0,
        name: formData.clientName,
        phone: formData.clientPhone,
        email: formData.clientEmail || null,
        staId: 1,
      });

      const { data: bikeData } = await saveBikeAPI({
        bikId: 0,
        plate: formData.plate,
        brand: formData.brand,
        model: formData.model,
        cylinder: formData.cylinder || null,
        cliId: clientData.cliId,
        staId: 1,
      });

      setVisible(false);
      showSuccess('Cliente y moto registrados correctamente.');

      onSuccess({
        id: bikeData.bikId,
        placa: formData.plate.toUpperCase(),
        brand: formData.brand,
        model: formData.model,
        cylinder: formData.cylinder,
        client: {
          name: formData.clientName,
          phone: formData.clientPhone,
          email: formData.clientEmail,
        },
      });
    } catch (err) {
      console.error('Error en registro rápido:', err);
      showError(err.response?.data?.message || 'Error al registrar cliente y motocicleta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseDialog
      open={visible}
      onClose={() => setVisible(false)}
      title="Registro Rápido de Cliente y Moto"
      maxWidth="sm"
      loading={loading}
      actions={
        <>
          <Button onClick={() => setVisible(false)}>Cancelar</Button>
          <Button variant="contained" color="secondary" onClick={handleSubmit(onSubmit)} disabled={loading}>
            Registrar y Seleccionar
          </Button>
        </>
      }
    >
      {!loading && (
        <FormProvider {...methods}>
          <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }}>
            1. Datos del Cliente
          </Typography>
          <GenericFormSection fields={clientFields} />
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" color="secondary">
            2. Datos de la Motocicleta
          </Typography>
          <GenericFormSection fields={bikeFields} />
        </FormProvider>
      )}
    </BaseDialog>
  );
});

export default QuickRegisterDialog;
