import React from 'react';

interface AlertProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: 'info' | 'warning' | 'error' | 'success' | 'destructive';
  children?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ title, description, variant = 'info', children }) => {
  const base = 'w-full rounded-md p-3 flex items-start space-x-3';
  const variantClass = {
    info: 'bg-blue-50 text-blue-800',
    success: 'bg-emerald-50 text-emerald-800',
    warning: 'bg-amber-50 text-amber-800',
    error: 'bg-red-50 text-red-800',
    destructive: 'bg-red-50 text-red-800',
  }[variant];

  return (
    <div className={`${base} ${variantClass}`} role="status">
      <div className="flex-1">
        {title && <div className="font-semibold">{title}</div>}
        {description && <div className="text-sm">{description}</div>}
        {children}
      </div>
    </div>
  );
};

export const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-sm text-gray-700">{children}</div>
);

export default Alert;
