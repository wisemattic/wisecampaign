import React, { createContext, useContext } from 'react';
import { Toaster, toast } from 'react-hot-toast';

// Toast Type Enum (Optional)
export const ToastType = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

// Create the Toast Context
const ToastContext = createContext();

// Custom Hook to use Toast Context
export const useToast = () => {
  return useContext(ToastContext);
};

// Toast Provider component
export const ToastProvider = ({ children }) => {
  const showToast = (message, type = ToastType.SUCCESS, duration = 3000) => {
    const toastOptions = {
      duration,
    };

    switch (type) {
      case ToastType.SUCCESS:
        toast.success(message, toastOptions);
        break;
      case ToastType.WARNING:
        toast.error(message, toastOptions); // Using error for warning as react-hot-toast has no default warning
        break;
      case ToastType.ERROR:
        toast.error(message, toastOptions);
        break;
      default:
        toast(message, toastOptions);
        break;
    }
  };

  const hideToast = () => {
    toast.dismiss();
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toaster position="top-right" containerStyle={{marginTop: '30px'}} />
    </ToastContext.Provider>
  );
};