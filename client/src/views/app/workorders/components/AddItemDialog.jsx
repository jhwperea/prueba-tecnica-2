import { useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { showSuccess, showError } from 'services/ToastService';
import { addOrderItemAPI } from 'api/requests/workOrdersApi';

import BaseDialog from 'ui-component/extended/BaseDialog';
import Button from '@mui/material/Button';

import GenericFormSection from 'ui-component/extended/GenericFormSection';

const ITEM_TYPE_OPTIONS = [
  { value: 'REPUESTO', label: 'Repuesto' },
  { value: 'MANO_OBRA', label: 'Mano de Obra' },
];

const AddItemDialog = forwardRef(({ onAdded }, ref) => {
  const [visible, setVisible] = useState(false);
  const [ordId, setOrdId] = useState(0);
  const [loading, setLoading] = useState(false);

  const methods = useForm({
    defaultValues: { type: 'REPUESTO', description: '', count: 1, unitValue: 0 },
  });

  const { handleSubmit, reset } = methods;

  const fields = useMemo(
    () => [
      { key: 'type', name: 'type', type: 'dropdown', label: 'Tipo de Ítem', required: true, validation: { required: 'El tipo es requerido' }, grid: { xs: 12 }, options: ITEM_TYPE_OPTIONS },
      { key: 'description', name: 'description', type: 'text', label: 'Descripción', required: true, validation: { required: 'La descripción es requerida' }, grid: { xs: 12 } },
      { key: 'count', name: 'count', type: 'number', label: 'Cantidad', required: true, validation: { required: 'La cantidad es requerida', min: { value: 1, message: 'Debe ser mayor a 0' } }, grid: { xs: 12, sm: 6 } },
      { key: 'unitValue', name: 'unitValue', type: 'currency', label: 'Valor Unitario', required: true, validation: { required: 'El valor unitario es requerido' }, grid: { xs: 12, sm: 6 } },
    ],
    []
  );

  const open = (orderId) => {
    setOrdId(orderId);
    reset({ type: 'REPUESTO', description: '', count: 1, unitValue: 0 });
    setVisible(true);
  };

  useImperativeHandle(ref, () => ({ open }));

  const onSubmit = async (formData) => {
    if (Number(formData.count) <= 0) return;

    setLoading(true);
    try {
      const { data } = await addOrderItemAPI({
        ordId,
        type: formData.type,
        description: formData.description,
        count: formData.count,
        unitValue: formData.unitValue,
      });

      setVisible(false);
      showSuccess('Ítem agregado con éxito.');
      onAdded(data.workOrder);
    } catch (err) {
      console.error('Error adding item:', err);
      showError(err.response?.data?.message || 'Error al agregar el ítem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseDialog
      open={visible}
      onClose={() => setVisible(false)}
      title="Agregar Ítem a la Orden"
      maxWidth="xs"
      loading={loading}
      actions={
        <>
          <Button onClick={() => setVisible(false)}>Cancelar</Button>
          <Button variant="contained" color="secondary" onClick={handleSubmit(onSubmit)} disabled={loading}>
            {loading ? 'Guardando…' : 'Agregar Ítem'}
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

export default AddItemDialog;
