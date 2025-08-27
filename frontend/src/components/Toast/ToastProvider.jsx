import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaTimes,
  FaExclamationCircle 
} from 'react-icons/fa';

// Create Toast Context
const ToastContext = createContext();

// Toast types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Toast icons mapping
const TOAST_ICONS = {
  [TOAST_TYPES.SUCCESS]: FaCheckCircle,
  [TOAST_TYPES.ERROR]: FaExclamationCircle,
  [TOAST_TYPES.WARNING]: FaExclamationTriangle,
  [TOAST_TYPES.INFO]: FaInfoCircle
};

// Toast colors mapping
const TOAST_COLORS = {
  [TOAST_TYPES.SUCCESS]: 'bg-green-600 border-green-500',
  [TOAST_TYPES.ERROR]: 'bg-red-600 border-red-500',
  [TOAST_TYPES.WARNING]: 'bg-yellow-600 border-yellow-500',
  [TOAST_TYPES.INFO]: 'bg-blue-600 border-blue-500'
};

// Individual Toast Component
const Toast = ({ toast, onRemove }) => {
  const Icon = TOAST_ICONS[toast.type];
  const colorClass = TOAST_COLORS[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
      className={`${colorClass} text-white p-4 rounded-lg shadow-lg border-l-4 min-w-80 max-w-md`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Icon className="text-xl mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            {toast.title && (
              <h4 className="font-semibold text-sm mb-1">{toast.title}</h4>
            )}
            <p className="text-sm opacity-90">{toast.message}</p>
          </div>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-white hover:text-gray-200 transition-colors ml-2 mt-0.5"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>
    </motion.div>
  );
};

Toast.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string,
    message: PropTypes.string.isRequired
  }).isRequired,
  onRemove: PropTypes.func.isRequired
};

// Toast Container Component
const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.array.isRequired,
  onRemove: PropTypes.func.isRequired
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = TOAST_TYPES.INFO, title = null, duration = 5000) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast = { id, message, type, title };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((message, title = 'Success', duration = 4000) => {
    return addToast(message, TOAST_TYPES.SUCCESS, title, duration);
  }, [addToast]);

  const error = useCallback((message, title = 'Error', duration = 6000) => {
    return addToast(message, TOAST_TYPES.ERROR, title, duration);
  }, [addToast]);

  const warning = useCallback((message, title = 'Warning', duration = 5000) => {
    return addToast(message, TOAST_TYPES.WARNING, title, duration);
  }, [addToast]);

  const info = useCallback((message, title = 'Info', duration = 4000) => {
    return addToast(message, TOAST_TYPES.INFO, title, duration);
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
