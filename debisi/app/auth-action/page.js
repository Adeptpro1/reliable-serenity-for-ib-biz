"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import DynamicHeader from '@/components/layoutComponents/DynamicHeader';
import Footer from '@/components/layoutComponents/Footer';

const AuthActionContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL Parameters from Firebase
  const mode = searchParams.get('mode'); // resetPassword, verifyEmail, recoverEmail
  const oobCode = searchParams.get('oobCode');

  // State Management
  const [status, setStatus] = useState('loading'); // loading, success, error, form
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!mode || !oobCode) {
      setStatus('error');
      setErrorMessage('Invalid or expired link.');
      return;
    }

    if (mode === 'verifyEmail') {
      handleVerifyEmail();
    } else if (mode === 'resetPassword') {
      setStatus('form');
    } else if (mode === 'recoverEmail') {
      handleRecoverEmail();
    } else {
      setStatus('error');
      setErrorMessage('Unknown request type.');
    }
  }, [mode, oobCode]);

  // Handler: Email Verification
  const handleVerifyEmail = async () => {
    try {
      const { applyActionCode } = await import('firebase/auth');
      const { auth } = await import('@/config/firebase');
      await applyActionCode(auth, oobCode);
      setStatus('success');
      toast.success("Email verified! Redirecting to login...");
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || "Failed to verify email.");
    }
  };

  // Handler: Email Recovery
  const handleRecoverEmail = async () => {
    try {
      const { checkActionCode, applyActionCode } = await import('firebase/auth');
      const { auth } = await import('@/config/firebase');
      await applyActionCode(auth, oobCode);
      setStatus('success');
      toast.success("Account recovered. Please reset your password if needed.");
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || "Failed to recover account.");
    }
  };

  // Handler: Password Reset Submission
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { confirmPasswordReset } = await import('firebase/auth');
      const { auth } = await import('@/config/firebase');
      await confirmPasswordReset(auth, oobCode, password);
      setStatus('success');
      toast.success("Password reset successful! Redirecting to login...");
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      toast.error(err.message || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DynamicHeader />
      <div className="flex-1 flex items-center justify-center" style={{ padding: '16px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Top Decorative Border */}
          <div className="h-2" style={{ background: 'linear-gradient(to right, #D22730, purple)' }}></div>
          
          <div style={{ padding: '32px' }}>
            {/* --- LOADING STATE --- */}
            {status === 'loading' && (
              <div className="text-center py-8">
                <div className="flex justify-center" style={{ marginBottom: '24px' }}>
                  <div className="h-16 w-16 rounded-full border-4 border-gray-100 border-t-purple-600 animate-spin"></div>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Processing Request...</h2>
              </div>
            )}

            {/* --- SUCCESS STATE --- */}
            {status === 'success' && (
              <div className="text-center">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900" style={{ marginBottom: '8px' }}>Action Successful!</h2>
                <p className="text-gray-500" style={{ marginBottom: '32px' }}>Everything is confirmed. Redirecting you to the login page now.</p>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-3 rounded-xl text-white font-bold shadow-lg"
                  style={{ background: 'linear-gradient(to right, #D22730, purple)' }}
                >
                  Go to Login Now
                </button>
              </div>
            )}

            {/* --- ERROR STATE --- */}
            {status === 'error' && (
              <div className="text-center">
                <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900" style={{ marginBottom: '8px' }}>Link Expired</h2>
                <p className="text-gray-500" style={{ marginBottom: '32px' }}>{errorMessage}</p>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-3 rounded-xl text-white font-bold shadow-lg"
                  style={{ background: 'linear-gradient(to right, #D22730, purple)' }}
                >
                  Back to Login
                </button>
              </div>
            )}

            {/* --- PASSWORD RESET FORM --- */}
            {status === 'form' && (
              <>
                <h2 className="text-3xl font-extrabold text-gray-900" style={{ marginBottom: '8px' }}>Reset Password</h2>
                <p className="text-gray-500" style={{ marginBottom: '32px' }}>Secure your account by entering a new password below.</p>

                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700" style={{ marginBottom: '8px' }}>New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        style={{ padding: '12px 16px' }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700" style={{ marginBottom: '8px' }}>Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        style={{ padding: '12px 16px' }}
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        {showConfirmPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-xl text-white font-bold text-lg shadow-lg"
                    style={{
                      padding: '16px',
                      background: 'linear-gradient(to right, #D22730, purple)',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? 'Saving...' : 'Update Password'}
                  </motion.button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default function UnifiedAuthActionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthActionContent />
    </Suspense>
  );
}
