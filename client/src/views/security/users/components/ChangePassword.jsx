import { useState, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useAuth } from 'contexts/authContext';
import { showSuccess, showError } from 'services/ToastService';
import GenericFormSection from 'ui-component/extended/GenericFormSection';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { updatePasswordAPI } from 'api/requests/usersApi';

export const ChangePassword = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const methods = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  });

  const { handleSubmit, reset, watch } = methods;

  const passwordFields = useMemo(() => [
    {
      key: 'currentPassword', name: 'currentPassword', type: 'password',
      label: 'Contraseña actual',
      validation: { required: 'La contraseña actual es requerida' },
      grid: { xs: 12 }
    },
    {
      key: 'newPassword', name: 'newPassword', type: 'password',
      label: 'Contraseña nueva',
      validation: {
        required: 'La contraseña nueva es requerida',
        minLength: { value: 8, message: 'Debe tener al menos 8 caracteres' }
      },
      grid: { xs: 12 }
    },
    {
      key: 'confirmPassword', name: 'confirmPassword', type: 'password',
      label: 'Confirmar contraseña',
      validation: {
        required: 'Debe confirmar la contraseña',
        validate: (value) => value === watch('newPassword') || 'Las contraseñas no coinciden'
      },
      grid: { xs: 12 }
    },
  ], []);

  const onSubmit = async ({ currentPassword, newPassword }) => {
    setLoading(true);
    try {
      const { data } = await updatePasswordAPI({
        currentPassword,
        newPassword,
        useId: user.useId,
      });
      showSuccess(data.message);
      reset();
    } catch (error) {
      showError(error.response?.data?.message || 'Error al actualizar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <GenericFormSection fields={passwordFields} />
      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={loading}>
          Actualizar Contraseña
        </Button>
      </Stack>
    </FormProvider>
  );
};
