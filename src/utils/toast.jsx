// Arquivo: src/utils/toast.js (ou onde você preferir salvar)
import { toast } from 'react-toastify';
import './ToastifyCustom.css'
const defaultOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "dark",
};

const EarthIcon = () => <img src="https://cdn-icons-png.flaticon.com/512/921/921490.png" alt="Terra" className="toast-icon-img" />;
const ErrorIcon = () => <img src="https://cdn-icons-png.flaticon.com/512/2879/2879395.png" alt="Erro" className="toast-icon-img" />;
const SatelliteIcon = () => <img src="https://cdn-icons-png.flaticon.com/512/10479/10479796.png" alt="Satélite" className="toast-icon-img" />;

export const notify = {
  success: (msg) => toast.success(msg, { ...defaultOptions, className: 'toast-spacex-success', icon: <EarthIcon /> }),
  error: (msg) => toast.error(msg, { ...defaultOptions, className: 'toast-spacex-error', icon: <ErrorIcon /> }),
  info: (msg) => toast.info(msg, { ...defaultOptions, className: 'toast-spacex-info', icon: <SatelliteIcon /> }),
};