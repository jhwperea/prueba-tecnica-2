import { useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { showSuccess, showError } from 'services/ToastService';
import { getClientsAPI } from 'api/requests/clientsApi';
import { saveBikeAPI } from 'api/requests/bikesApi';

import BaseDialog from 'ui-component/extended/BaseDialog';
import Button from '@mui/material/Button';

import GenericFormSection from 'ui-component/extended/GenericFormSection';
import { STATUS_OPTIONS } from 'utils/constants';

const BikeDialog = forwardRef(({ addItem, updateItem }, ref) => {
  const [visible, setVisible] = useState(false);
  const [bikId, setBikId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState('');

  const methods = useForm({
    defaultValues: {
      cliId: '',
      plate: '',
      brand: '',
      model: '',
      cylinder: '',
      staId: 1,
    },
  });

  const { handleSubmit, reset } = methods;

  const fields = useMemo(
    () => [
      {
        key: 'cliId',
        name: 'cliId',
        type: 'socketDropdown',
        label: 'Cliente Propietario',
        required: true,
        validation: { required: 'El cliente propietario es requerido' },
        grid: { xs: 12 },
        fetchApi: getClientsAPI,
        socketEvent: 'refresh-clients',
        props: { onOptionChange: (opt) => setClientName(opt.label) },
      },
      { key: 'plate', name: 'plate', type: 'text', label: 'Placa', required: true, validation: { required: 'La placa es requerida' }, grid: { xs: 12, sm: 6 }, props: { style: { textTransform: 'uppercase' } } },
      { key: 'brand', name: 'brand', type: 'text', label: 'Marca', required: true, validation: { required: 'La marca es requerida' }, grid: { xs: 12, sm: 6 } },
      { key: 'model', name: 'model', type: 'text', label: 'Modelo', required: true, validation: { required: 'El modelo es requerido' }, grid: { xs: 12, sm: 6 } },
      { key: 'cylinder', name: 'cylinder', type: 'text', label: 'Cilindraje (cc)', grid: { xs: 12, sm: 6 } },
      { key: 'staId', name: 'staId', type: 'selectButton', label: 'Estado', options: STATUS_OPTIONS, grid: { xs: 12 } },
    ],
    []
  );

  const newBike = () => {
    setBikId(0);
    setClientName('');
    reset({ cliId: '', plate: '', brand: '', model: '', cylinder: '', staId: 1 });
    setVisible(true);
  };

  const editBike = (item) => {
    setBikId(item.bikId);
    setClientName(item.clientName || '');
    reset({
      cliId: item.cliId || '',
      plate: item.plate || '',
      brand: item.brand || '',
      model: item.model || '',
      cylinder: item.cylinder || '',
      staId: item.staId || 1,
    });
    setVisible(true);
  };

  useImperativeHandle(ref, () => ({ newBike, editBike }));

  const onSubmit = async (formData) => {
    const payload = { bikId, ...formData };

    setLoading(true);
    try {
      const { data } = await saveBikeAPI(payload);

      const bikeItem = {
        bikId: bikId > 0 ? bikId : data.bikId,
        cliId: formData.cliId,
        plate: formData.plate.toUpperCase(),
        brand: formData.brand,
        model: formData.model,
        cylinder: formData.cylinder,
        staId: formData.staId,
        statusName: formData.staId === 1 ? 'Activo' : 'Inactivo',
        clientName,
      };

      if (bikId > 0) {
        updateItem(bikeItem);
      } else {
        addItem(bikeItem);
      }

      setVisible(false);
      showSuccess(data.message || 'Moto guardada con éxito.');
    } catch (err) {
      console.error('Error saving bike:', err);
      showError(err.response?.data?.message || 'Error al guardar la moto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseDialog
      open={visible}
      onClose={() => setVisible(false)}
      title={bikId ? 'Editar Moto' : 'Nueva Moto'}
      maxWidth="sm"
      loading={loading}
      actions={
        <>
          <Button onClick={() => setVisible(false)}>Cancelar</Button>
          <Button variant="contained" color="secondary" onClick={handleSubmit(onSubmit)} disabled={loading}>
            {bikId ? 'Guardar Cambios' : 'Guardar'}
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

export default BikeDialog;
