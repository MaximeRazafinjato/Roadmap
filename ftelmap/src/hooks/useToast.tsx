import { toast } from 'sonner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

export interface ToastOptions {
  duration?: number;
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
}

export const useToast = () => {
  const showSuccess = (message: string, options?: ToastOptions) => {
    toast.success(message, {
      duration: options?.duration ?? 4000,
      position: options?.position ?? 'bottom-right',
      icon: <CheckCircleIcon sx={{ color: '#10b981' }} />,
      style: {
        background: '#f0fdf4',
        border: '1px solid #86efac',
        color: '#166534',
      },
    });
  };

  const showError = (message: string, options?: ToastOptions) => {
    toast.error(message, {
      duration: options?.duration ?? 5000,
      position: options?.position ?? 'bottom-right',
      icon: <ErrorIcon sx={{ color: '#ef4444' }} />,
      style: {
        background: '#fef2f2',
        border: '1px solid #fca5a5',
        color: '#991b1b',
      },
    });
  };

  const showInfo = (message: string, options?: ToastOptions) => {
    toast.info(message, {
      duration: options?.duration ?? 4000,
      position: options?.position ?? 'bottom-right',
      icon: <InfoIcon sx={{ color: '#3b82f6' }} />,
      style: {
        background: '#eff6ff',
        border: '1px solid #93c5fd',
        color: '#1e40af',
      },
    });
  };

  const showWarning = (message: string, options?: ToastOptions) => {
    toast.warning(message, {
      duration: options?.duration ?? 4000,
      position: options?.position ?? 'bottom-right',
      icon: <WarningIcon sx={{ color: '#f59e0b' }} />,
      style: {
        background: '#fffbeb',
        border: '1px solid #fcd34d',
        color: '#92400e',
      },
    });
  };

  const showPromise = <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    options?: ToastOptions
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      position: options?.position ?? 'bottom-right',
    });
  };

  const dismiss = (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  return {
    success: showSuccess,
    error: showError,
    info: showInfo,
    warning: showWarning,
    promise: showPromise,
    dismiss,
  };
};
