import { useCallback } from 'react';
import { 
  showSuccess, 
  showError, 
  showInfo, 
  showLoading, 
  dismissToast, 
  dismissAllToasts,
  successMessages,
  errorMessages,
  handleApiResponse,
  handleGraphQLResponse,
  handleAsyncOperation
} from '../utils/toast';

export const useToast = () => {
  const success = useCallback((message, options) => {
    return showSuccess(message, options);
  }, []);

  const error = useCallback((message, options) => {
    return showError(message, options);
  }, []);

  const info = useCallback((message, options) => {
    return showInfo(message, options);
  }, []);

  const loading = useCallback((message, options) => {
    return showLoading(message, options);
  }, []);

  const dismiss = useCallback((toastId) => {
    dismissToast(toastId);
  }, []);

  const dismissAll = useCallback(() => {
    dismissAllToasts();
  }, []);

  const handleResponse = useCallback((response, successMessage, errorMessage) => {
    return handleApiResponse(response, successMessage, errorMessage);
  }, []);

  const handleGraphQL = useCallback((data, errors, successMessage, errorMessage) => {
    return handleGraphQLResponse(data, errors, successMessage, errorMessage);
  }, []);

  const handleAsync = useCallback(async (operation, successMessage, errorMessage) => {
    return await handleAsyncOperation(operation, successMessage, errorMessage);
  }, []);

  return {
    success,
    error,
    info,
    loading,
    dismiss,
    dismissAll,
    handleResponse,
    handleGraphQL,
    handleAsync,
    messages: {
      success: successMessages,
      error: errorMessages,
    },
  };
}; 
