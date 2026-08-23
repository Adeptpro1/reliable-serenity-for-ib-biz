import { toast } from 'react-hot-toast';

// Success toast notifications
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    duration: 4000,
    ...options,
  });
};

// Error toast notifications
export const showError = (message, options = {}) => {
  return toast.error(message, {
    duration: 5000,
    ...options,
  });
};

// Info toast notifications
export const showInfo = (message, options = {}) => {
  return toast(message, {
    duration: 4000,
    ...options,
  });
};

// Loading toast notifications
export const showLoading = (message = 'Loading...', options = {}) => {
  return toast.loading(message, {
    ...options,
  });
};

// Dismiss a specific toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Common success messages
export const successMessages = {
  login: 'Successfully logged in!',
  logout: 'Successfully logged out!',
  register: 'Account created successfully!',
  profileUpdate: 'Profile updated successfully!',
  businessCreated: 'Business created successfully!',
  businessUpdated: 'Business updated successfully!',
  businessDeleted: 'Business deleted successfully!',
  adSubmitted: 'Advertisement request submitted successfully!',
  paymentSuccess: 'Payment completed successfully!',
  fileUploaded: 'File uploaded successfully!',
  dataSaved: 'Data saved successfully!',
  emailSent: 'Email sent successfully!',
  passwordReset: 'Password reset email sent!',
  passwordChanged: 'Password changed successfully!',
};

// Common error messages
export const errorMessages = {
  login: 'Login failed. Please check your credentials.',
  logout: 'Logout failed. Please try again.',
  register: 'Registration failed. Please try again.',
  profileUpdate: 'Failed to update profile. Please try again.',
  businessCreated: 'Failed to create business. Please try again.',
  businessUpdated: 'Failed to update business. Please try again.',
  businessDeleted: 'Failed to delete business. Please try again.',
  adSubmitted: 'Failed to submit advertisement request. Please try again.',
  paymentFailed: 'Payment failed. Please try again.',
  fileUpload: 'File upload failed. Please try again.',
  dataSave: 'Failed to save data. Please try again.',
  emailSend: 'Failed to send email. Please try again.',
  passwordReset: 'Failed to send password reset email. Please try again.',
  passwordChange: 'Failed to change password. Please try again.',
  networkError: 'Network error. Please check your connection.',
  serverError: 'Server error. Please try again later.',
  validationError: 'Please check your input and try again.',
  unauthorized: 'You are not authorized to perform this action.',
  notFound: 'The requested resource was not found.',
};

// Helper function to show API response toasts
export const handleApiResponse = (response, successMessage, errorMessage) => {
  if (response.success || response.ok) {
    showSuccess(successMessage);
    return true;
  } else {
    showError(errorMessage || response.message || 'An error occurred');
    return false;
  }
};

// Helper function to show GraphQL response toasts
export const handleGraphQLResponse = (data, errors, successMessage, errorMessage) => {
  if (errors && errors.length > 0) {
    showError(errorMessage || errors[0].message || 'An error occurred');
    return false;
  } else {
    showSuccess(successMessage);
    return true;
  }
};

// Helper function to show async operation toasts
export const handleAsyncOperation = async (operation, successMessage, errorMessage) => {
  const loadingToast = showLoading('Processing...');
  
  try {
    const result = await operation();
    dismissToast(loadingToast);
    showSuccess(successMessage);
    return { success: true, data: result };
  } catch (error) {
    dismissToast(loadingToast);
    showError(errorMessage || error.message || 'An error occurred');
    return { success: false, error };
  }
}; 
