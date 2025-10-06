import * as React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  loading = false
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case 'danger':
        return <XCircle className="h-6 w-6 text-red-600" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      default:
        return <Info className="h-6 w-6 text-blue-600" />;
    }
  };

  const getConfirmButtonClasses = () => {
    const base = "inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    
    switch (type) {
      case 'danger':
        return `${base} border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500`;
      case 'warning':
        return `${base} border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-yellow-500`;
      case 'success':
        return `${base} border-transparent text-white bg-green-600 hover:bg-green-700 focus:ring-green-500`;
      default:
        return `${base} border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-blue-50';
      case 'danger':
        return 'bg-red-50';
      case 'success':
        return 'bg-green-50';
      default:
        return 'bg-blue-50';
    }
  };

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) {
      onClose();
    } else if (e.key === 'Enter' && !loading) {
      handleConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={!loading ? onClose : undefined}
        />

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>

        <div 
          className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* Close button */}
          <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
            <button
              onClick={!loading ? onClose : undefined}
              disabled={loading}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            {/* Icon */}
            <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${getBgColor()} sm:mx-0 sm:h-10 sm:w-10`}>
              {getIcon()}
            </div>

            {/* Content */}
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 whitespace-pre-line">
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`w-full sm:ml-3 sm:w-auto ${getConfirmButtonClasses()}`}
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {confirmText}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for easier usage
export const useConfirmDialog = () => {
  const [dialog, setDialog] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'info' | 'warning' | 'danger' | 'success';
    onConfirm?: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const [loading, setLoading] = React.useState(false);

  const showConfirm = (options: Omit<typeof dialog, 'isOpen'>) => {
    setDialog({
      ...options,
      isOpen: true,
    });
  };

  const hideConfirm = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (dialog.onConfirm) {
      setLoading(true);
      try {
        await dialog.onConfirm();
        hideConfirm();
      } catch (error) {
        console.error('Confirm action failed:', error);
        setLoading(false);
        // Don't hide dialog on error, let user try again
      }
    } else {
      hideConfirm();
    }
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={dialog.isOpen}
      onClose={hideConfirm}
      onConfirm={handleConfirm}
      title={dialog.title}
      message={dialog.message}
      confirmText={dialog.confirmText}
      cancelText={dialog.cancelText}
      type={dialog.type}
      loading={loading}
    />
  );

  return {
    showConfirm,
    hideConfirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
};

export default ConfirmDialog;