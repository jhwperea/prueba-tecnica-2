import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultConfig = {
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'light',
};

export const showSuccess = (message, sticky = false) => {
  toast.success(message, {
    ...defaultConfig,
    autoClose: sticky ? false : defaultConfig.autoClose,
    theme: 'colored',
  });
};

export const showInfo = (message, sticky = false) => {
  toast.info(message, {
    ...defaultConfig,
    autoClose: sticky ? false : defaultConfig.autoClose,
    theme: 'colored',
  });
};

export const showWarn = (message, sticky = false) => {
  toast.warn(message, {
    ...defaultConfig,
    autoClose: sticky ? false : defaultConfig.autoClose,
    theme: 'colored',
  });
};

export const showError = (message, sticky = false) => {
  toast.error(message, {
    ...defaultConfig,
    autoClose: sticky ? false : defaultConfig.autoClose,
    theme: 'colored',
  });
};

export const showObligatorios = (isValid) => {
  if (!isValid) {
    showInfo('Hay información obligatoria por ingresar. Verificar');
  }
};

export const showPromise = (promise, { pending, success, error }) => {
  return toast.promise(promise, { pending, success, error });
};
