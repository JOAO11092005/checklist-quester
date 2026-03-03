import { toast } from 'react-toastify';

// Configurações padrão do seu estilo "Elite"
const defaultOptions = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "dark",
};

export const notify = {
  success: (msg) => toast.success(msg, {
    ...defaultOptions,
    className: 'toast-success-custom',
  }),
  
  error: (msg) => toast.error(msg, {
    ...defaultOptions,
    className: 'toast-error-custom',
  }),

  info: (msg) => toast.info(msg, {
    ...defaultOptions,
    className: 'toast-info-custom',
  }),
};