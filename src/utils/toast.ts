import toast from 'react-hot-toast';

// Custom toast configuration
const toastConfig = {
  duration: 4000,
  position: 'top-right' as const,
  style: {
    background: '#1a1a2e',
    color: '#fff',
    border: '1px solid #ff6b35',
    borderRadius: '8px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  success: {
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
  },
};

export const showToast = {
  success: (message: string) => {
    toast.success(message, toastConfig);
  },

  error: (message: string) => {
    toast.error(message, toastConfig);
  },

  loading: (message: string) => {
    return toast.loading(message, toastConfig);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      toastConfig
    );
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};

// API Error handler
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unexpected error occurred';
};
