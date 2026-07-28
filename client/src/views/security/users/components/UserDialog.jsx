import { useState, forwardRef, useImperativeHandle, useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { showSuccess, showInfo, showError } from 'services/ToastService';
import { getProfilesAPI } from 'api/requests/profilesApi';
import { saveUserAPI } from 'api/requests/usersApi';
import httpCliente from 'api/services/httpCliente';

import BaseDialog from 'ui-component/extended/BaseDialog';
import Button from '@mui/material/Button';

import GenericFormSection from 'ui-component/extended/GenericFormSection';
import { STATUS_OPTIONS } from 'utils/constants';
// import DocumentManagement from 'ui-component/DocumentManagement';

const UserDialog = forwardRef(({ addItem, updateItem }, ref) => {
  const [visible, setVisible] = useState(false);
  const [useId, setUseId] = useState(0);
  const [loading, setLoading] = useState(false);

  const [allPages, setAllPages] = useState([]);
  const [profileName, setProfileName] = useState('');

  const methods = useForm({
    defaultValues: {
      proId: '',
      name: '',
      lastName: '',
      identification: '',
      username: '',
      email: '',
      password: '',
      access: true,
      changePassword: false,
      staId: 1,
      usePages: [],
    },
  });

  const { handleSubmit, reset, watch } = methods;

  const access = watch('access');

  const fields = useMemo(() => {
    const list = [
      { key: 'proId', name: 'proId', type: 'socketDropdown', label: 'Perfil', required: true, validation: { required: 'El perfil es requerido' }, fetchApi: getProfilesAPI, socketEvent: 'refresh-profiles', grid: { xs: 12, sm: 6 }, props: { onOptionChange: (opt) => setProfileName(opt.label) } },
      { key: 'identification', name: 'identification', type: 'text', label: 'NIT / CC', grid: { xs: 12, sm: 6 } },
      { key: 'name', name: 'name', type: 'text', label: 'Nombre(s)', required: true, validation: { required: 'El nombre es requerido' }, grid: { xs: 12, sm: 6 } },
      { key: 'lastName', name: 'lastName', type: 'text', label: 'Apellido(s)', required: true, validation: { required: 'El apellido es requerido' }, grid: { xs: 12, sm: 6 } },
      { key: 'email', name: 'email', type: 'text', label: 'Correo Electrónico', required: true, validation: { required: 'El correo es requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' } }, grid: { xs: 12 }, props: { type: 'email' } },
      { key: 'access', name: 'access', type: 'inputSwitch', label: 'Acceso al sistema', grid: { xs: 12, sm: 6 } },
      { key: 'staId', name: 'staId', type: 'selectButton', label: 'Estado', options: STATUS_OPTIONS, grid: { xs: 12, sm: 6 } },
    ];

    if (access) {
      list.push(
        { key: 'changePassword', name: 'changePassword', type: 'inputSwitch', label: 'Pedir cambio de contraseña', grid: { xs: 6 } },
        { key: 'username', name: 'username', type: 'text', label: 'Usuario', grid: { xs: 12, sm: 6 } },
        { key: 'password', name: 'password', type: 'password', label: 'Contraseña', grid: { xs: 12, sm: 6 } },
        { key: 'usePages', name: 'usePages', type: 'multiselect', label: 'Páginas autorizadas', options: allPages.map(p => ({ value: p.id, label: p.description })), grid: { xs: 12 } },
      );
    }

    return list;
  }, [access, allPages]);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const { data } = await httpCliente.get('security/permissions/get_all_pages');
      setAllPages(data || []);
    } catch (err) {
      console.error('Error fetching lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPagesByProfile = async (profileId) => {
    if (!profileId || useId > 0) return;
    try {
      const { data } = await httpCliente.get('auth/get_windows_by_profile', { proId: profileId });
      reset((prev) => ({ ...prev, usePages: data.map((p) => p.pagId) }));
    } catch (err) {
      console.error('Error fetching profile pages:', err);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchLists();
    }
  }, [visible]);

  const proIdValue = watch('proId');
  useEffect(() => {
    if (proIdValue && useId === 0) {
      getPagesByProfile(proIdValue);
    }
  }, [proIdValue]);

  const newUser = () => {
    setUseId(0);
    setProfileName('');
    reset({
      proId: '',
      name: '',
      lastName: '',
      identification: '',
      username: '',
      email: '',
      password: '',
      access: true,
      changePassword: false,
      staId: 1,
      usePages: [],
    });
    setVisible(true);
  };

  const editUser = (item) => {
    setUseId(item.useId);
    setProfileName(item.profileName || '');
    reset({
      proId: item.proId || '',
      name: item.name || '',
      lastName: item.lastName || '',
      identification: item.identification || '',
      username: item.username || '',
      email: item.email || '',
      password: '',
      access: item.access === 1 || item.access === true,
      changePassword: item.changePassword === 1 || item.changePassword === true,
      staId: item.staId || 1,
      usePages: item.usePages ? item.usePages.split(',').map(Number) : [],
    });
    setVisible(true);
  };

  useImperativeHandle(ref, () => ({
    newUser,
    editUser,
  }));

  const onSubmit = async (formData) => {
    if (useId === 0 && !formData.password) {
      showInfo('La contraseña es requerida para nuevos usuarios.');
      return;
    }

    const payload = {
      useId,
      proId: formData.proId,
      name: formData.name,
      lastName: formData.lastName,
      identification: formData.identification || null,
      username: formData.access ? (formData.username || formData.email.split('@')[0]) : null,
      email: formData.email,
      password: formData.password || null,
      access: formData.access ? 1 : 0,
      changePassword: formData.access ? (formData.changePassword ? 1 : 0) : 0,
      staId: formData.staId,
      usePages: formData.access ? formData.usePages.join(',') : '',
    };

    setLoading(true);
    try {
      const { data } = await saveUserAPI(payload);

      const userItem = {
        useId: useId > 0 ? useId : data.useId,
        proId: formData.proId,
        name: formData.name,
        lastName: formData.lastName,
        identification: formData.identification,
        username: payload.username,
        email: formData.email,
        access: payload.access,
        changePassword: payload.changePassword,
        staId: formData.staId,
        statusName: formData.staId === 1 ? 'Activo' : 'Inactivo',
        profileName,
        usePages: payload.usePages,
      };

      if (useId > 0) {
        updateItem({ idField: 'useId', ...userItem });
      } else {
        addItem(userItem);
      }

      setVisible(false);
      showSuccess(data.message || 'Usuario guardado con éxito.');
    } catch (err) {
      console.error('Error saving user:', err);
      showError(err.response?.data?.message || 'Error al guardar el usuario');
    } finally {
      setLoading(false);
    }
  };

  // const docConfig = useMemo(() => ({ modulo: 'USERS', moduloId: useId }), [useId]);

  return (
    <BaseDialog
      open={visible}
      onClose={() => setVisible(false)}
      title={useId ? 'Editar Usuario' : 'Nuevo Usuario'}
      maxWidth="sm"
      loading={loading}
      actions={
        <>
          <Button onClick={() => setVisible(false)}>Cancelar</Button>
          <Button variant="contained" color="secondary" onClick={handleSubmit(onSubmit)} disabled={loading}>
            {useId ? 'Guardar Cambios' : 'Guardar'}
          </Button>
        </>
      }
    >
      {!loading && (
        <FormProvider {...methods}>
          <GenericFormSection fields={fields} />
        </FormProvider>
      )}

      {/* {useId > 0 && (
        <DocumentManagement
          docConfig={docConfig}
          multipleFiles={false}
        />
      )} */}
    </BaseDialog>
  );
});

export default UserDialog;
