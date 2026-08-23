'use client';

import { useState } from 'react';
import { useToast } from '../../hooks/useToast';

const ToastExample = () => {
  const { 
    success, 
    error, 
    info, 
    loading, 
    dismiss, 
    dismissAll, 
    handleAsync, 
    messages 
  } = useToast();
  
  const [loadingToastId, setLoadingToastId] = useState(null);

  const handleSuccessToast = () => {
    success('This is a success message!');
  };

  const handleErrorToast = () => {
    error('This is an error message!');
  };

  const handleInfoToast = () => {
    info('This is an info message!');
  };

  const handleLoadingToast = () => {
    const toastId = loading('Processing your request...');
    setLoadingToastId(toastId);
  };

  const handleDismissLoading = () => {
    if (loadingToastId) {
      dismiss(loadingToastId);
      setLoadingToastId(null);
    }
  };

  const handleDismissAll = () => {
    dismissAll();
  };

  const handleAsyncOperation = async () => {
    const result = await handleAsync(
      async () => {
        // Simulate an async operation
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { data: 'Operation completed' };
      },
      'Async operation completed successfully!',
      'Async operation failed!'
    );
    
  };

  const handlePredefinedMessages = () => {
    success(messages.success.login);
  };

  const handlePredefinedError = () => {
    error(messages.error.networkError);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Toast Notification Examples</h2>
      
      <div className="space-y-3">
        <button
          onClick={handleSuccessToast}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Show Success Toast
        </button>
        
        <button
          onClick={handleErrorToast}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Show Error Toast
        </button>
        
        <button
          onClick={handleInfoToast}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Show Info Toast
        </button>
        
        <button
          onClick={handleLoadingToast}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Show Loading Toast
        </button>
        
        <button
          onClick={handleDismissLoading}
          disabled={!loadingToastId}
          className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Dismiss Loading Toast
        </button>
        
        <button
          onClick={handleDismissAll}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Dismiss All Toasts
        </button>
        
        <button
          onClick={handleAsyncOperation}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Async Operation with Toast
        </button>
        
        <button
          onClick={handlePredefinedMessages}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Predefined Success Message
        </button>
        
        <button
          onClick={handlePredefinedError}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Predefined Error Message
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Available Predefined Messages:</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div><strong>Success:</strong> login, logout, register, profileUpdate, businessCreated, etc.</div>
          <div><strong>Error:</strong> login, logout, register, networkError, serverError, etc.</div>
        </div>
      </div>
    </div>
  );
};

export default ToastExample; 