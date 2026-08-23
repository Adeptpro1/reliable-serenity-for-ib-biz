import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiEye, HiEyeOff } from 'react-icons/hi';

const ChangePassword = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError("");
    setMessage("");
    try {
      const { updatePassword, EmailAuthProvider, reauthenticateWithCredential } = await import('firebase/auth');
      const { auth } = await import('../../config/firebase');
      const user = auth.currentUser;

      if (!user) {
        throw new Error("No user is currently signed in.");
      }

      // Re-authenticate user first (required for password changes)
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      setMessage("Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error('Change password error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-xl" style={{padding: '5px'}}>
      <div className="flex justify-between items-center" style={{ marginBottom: '10px'}}>
        <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <p className="text-sm text-gray-600" style={{ marginBottom: '10px'}}>
        Enter your new password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-red-50 p-4 border border-red-200"
          >
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-green-50 p-4 border border-green-200"
          >
            <p className="text-sm text-green-700">{message}</p>
          </motion.div>
        )}

        <div>
          <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700" style={{ marginBottom: '5px'}}>
            Old Password
          </label>
          <div className="relative">
            <input
              id="oldPassword"
              type={showOldPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                setError('');
                setMessage('');
              }}
              placeholder="Enter your old password"
              required
              className="appearance-none rounded-lg relative block w-full border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              style={{ padding: '10px', paddingRight: '40px', marginBottom: '10px'}}
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3 top-[10px] text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              {showOldPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700" style={{ marginBottom: '5px'}}>
            New Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError('');
                setMessage('');
              }}
              placeholder="Enter your new password"
              required
              className="appearance-none rounded-lg relative block w-full border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              style={{ padding: '10px', paddingRight: '40px', marginBottom: '10px'}}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-[10px] text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              {showNewPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700" style={{ marginBottom: '5px'}}>
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
                setMessage('');
              }}
              placeholder="Confirm your new password"
              required
              className="appearance-none rounded-lg relative block w-full border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              style={{ padding: '10px', paddingRight: '40px', marginBottom: '10px'}}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[10px] text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              {showConfirmPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
            </button>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          style={{
            padding: '10px',
            background: 'linear-gradient(to right, #D22730, purple)',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
          className={`w-full flex justify-center border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isLoading ? 'opacity-50' : ''
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save New Password'
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default ChangePassword;
