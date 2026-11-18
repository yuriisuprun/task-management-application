import React, { ReactNode } from 'react';

type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  children?: ReactNode;
}

const icons: Record<AlertType, string> = {
  error: '❌',
  success: '✅',
  warning: '⚠️',
  info: 'ℹ️',
};

export const Alert: React.FC<AlertProps> = ({ type, message, onClose, children }) => {
  return (
    <div className={`alert alert-${type}`}>
      <span className="alert-icon">{icons[type]}</span>
      <div className="alert-content">
        {children || <p>{message}</p>}
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Close alert">
          ×
        </button>
      )}
    </div>
  );
};
