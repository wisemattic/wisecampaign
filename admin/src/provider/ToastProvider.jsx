import React, { useState, createContext, useContext } from 'react';

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
  const [toast, setToast] = useState(null);

  const showToast = (message, type = ToastType.SUCCESS, duration = 3000) => {
    // Store both message and type in toast state
    setToast({ message, type });

    // Hide toast after specified duration (default 3000ms)
    setTimeout(() => {
      setToast(null);
    }, duration);
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* Render Toast globally */}
      {toast && (
        <div className='wisecampaign-tw'>
        <div className="absolute top-4 right-4 z-[9999] max-w-xs">
          <div
            className={`${
              toast.type === ToastType.WARNING
                ? 'bg-yellow-500'
                : toast.type === ToastType.ERROR
                ? 'bg-red-500'
                : 'bg-green-600'
            } text-white px-6 py-3 rounded-lg shadow-md flex items-center`}
            role="alert"
          >
            <span className="flex-grow">{toast.message}</span>

            {/* Close Button */}
            <button
              onClick={hideToast}
              className="ml-4 text-white focus:outline-none"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};
