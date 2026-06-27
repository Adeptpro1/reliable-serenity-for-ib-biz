"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import img from "../../images/backg.png";
import ForgotPassword from "@/components/authComponents/ForgotPassword";
import logo from "../../images/debisi_logo.png";
import { useAuth } from '../../contexts/AuthContext';
import ResendEmail from "@/components/authComponents/ResendEmail";
import toast from "react-hot-toast";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import { REGISTER_USER } from "@/api/queries/auth/auth";
import PolicyModal from "@/components/authComponents/PolicyModal";
import { auth as firebaseAuth } from "@/config/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function Login() {
  const router = useRouter();
  const { login: authLogin } = useAuth(); // check here
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [registerMutation] = useMutation(REGISTER_USER);


  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    // Clear general error when user starts typing
    if (error) setError(null);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const firebaseUser = result.user;

      // Split Google displayName into first / last name
      const displayName = firebaseUser.displayName || "";
      const nameParts = displayName.trim().split(/\s+/);
      const firstName = nameParts[0] || "User";
      const lastName = nameParts.slice(1).join(" ") || "Account";

      // registerUser handles both new and existing users (upsert on backend)
      await registerMutation({
        variables: {
          firstName,
          lastName,
          email: firebaseUser.email,
          firebaseUid: firebaseUser.uid,
          agreedToPolicy: true,
        },
      });

      toast.success(`Welcome back, ${firstName}! 🎉`);
    } catch (err) {
      console.error("Google sign-in error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        // user dismissed — no toast needed
      } else if (err.code === "auth/network-request-failed") {
        toast.error("Network error. Please check your internet connection.");
      } else {
        toast.error(err.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const loginPromise = authLogin(formData.email, formData.password);
      
      await toast.promise(loginPromise, {
        loading: 'Signing in...',
        success: 'Welcome back!',
        error: (err) => {
          if (err.code === 'auth/email-not-verified') {
            return (
              <div className="flex flex-col items-start gap-1">
                <span>Kindly check your email or spam folder for the verification link.</span>
                <button 
                  onClick={() => setShowResendModal(true)} 
                  className="text-purple-600 font-medium hover:underline text-sm"
                >
                  Resend verification link
                </button>
              </div>
            );
          }
          if (
            err.code === 'auth/wrong-password' || 
            err.code === 'auth/user-not-found' || 
            err.code === 'auth/invalid-credential' || 
            err.code === 'auth/invalid-login-credentials'
          ) {
            return 'Invalid credentials. Please check your email and password.';
          }
          if (err.code === 'auth/network-request-failed') {
            return 'Network Error. Please check your internet connection.';
          }
          return err.message || 'Login failed';
        },
      }, {
        duration: 6000,
      });
      // AuthContext handles the state and redirect will be handled by useEffect
    } catch (err) {
      console.error('Login error:', err);
      // We no longer auto-show the modal; the toast has a button instead.
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for user changes to redirect to dashboard
  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      router.push(`/dashboard/${user.id}`);
    }
  }, [user, router]);

  return (
    <div
      className="relative flex items-center justify-center min-h-screen py-6 px-2 sm:px-0"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={img}
          alt="Background"
          fill
          className="object-cover"
          quality={100}
          priority
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      {/* Policy Modal */}
      <PolicyModal isOpen={showPolicyModal} onClose={() => setShowPolicyModal(false)} />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm" style={{ margin: "8px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full bg-white/85 backdrop-blur-md rounded-2xl shadow-2xl"
          style={{ padding: "28px 24px" }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <Image
              src={logo}
              alt="Logo"
              width={34}
              height={34}
              style={{ marginLeft: "auto", marginRight: "auto", marginBottom: "10px" }}
            />
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Please sign in to your account
            </p>
          </div>

          {/* ─── Google Sign-In ─── */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting || isLoading}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 shadow-sm"
            style={{ padding: "10px 16px", marginBottom: "4px" }}
          >
            {isGoogleSubmitting ? (
              <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {isGoogleSubmitting ? "Signing in..." : "Continue with Google"}
          </button>

          {/* ─── Policy note for Google ─── */}
          <p className="text-center text-xs text-gray-400 mb-4">
            By continuing with Google, you agree to our{" "}
            <button
              type="button"
              onClick={() => setShowPolicyModal(true)}
              className="underline text-purple-600 hover:text-purple-500"
            >
              Policy
            </button>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none rounded-lg block w-full border ${
                    validationErrors.email ? "border-red-400" : "border-gray-300"
                  } bg-white/60 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all`}
                  placeholder="Enter your email"
                  style={{ padding: "9px 12px" }}
                />
                {validationErrors.email && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-600"
                  >
                    {validationErrors.email}
                  </motion.p>
                )}
              </div>
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none rounded-lg block w-full border ${
                    validationErrors.password ? "border-red-400" : "border-gray-300"
                  } bg-white/60 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all pr-10`}
                  placeholder="Enter your password"
                  style={{ padding: "9px 12px" }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
                {validationErrors.password && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-600"
                  >
                    {validationErrors.password}
                  </motion.p>
                )}
              </div>
            </div>
          </form>

          <div className="text-sm flex justify-end mt-2 mb-2 sm:mt-4">
            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(true)}
              className="font-medium hover:text-purple-500 transition-colors duration-200"
              style={{ color: "purple" }}
            >
              Forgot your password?
            </button>
          </div>

          <div className="" style={{ marginTop: "5px" }}>
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{
                padding: "10px",
                background: "linear-gradient(to right, purple, #D22730)",
                marginTop: "5px",
              }}
              className={`group relative w-full flex justify-center border border-transparent text-sm font-medium rounded-lg text-white ${isLoading ? "cursor-not-allowed" : "hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl`}
            >
              {isLoading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              {isLoading ? "Signing in..." : "Sign in"}
            </motion.button>
          </div>

          <div
            className="text-center text-sm text-gray-600"
            style={{ marginTop: "10px" }}
          >
            Ready to get listed?{" "}
            <Link
              href="/register"
              className="font-medium hover:text-purple-500 transition-colors duration-200"
              style={{ color: "purple" }}
            >
              Sign up
            </Link>
          </div>
        </motion.div>

        {/* Back home */}
        <button
          onClick={() => router.push('/')}
          style={{ marginTop: '24px', padding: '10px 20px' }}
          className="flex items-center text-sm font-medium text-white hover:text-purple-200 transition-colors duration-200 group bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          &nbsp; Go back home
        </button>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowForgotPasswordModal(false)}
          ></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-50 bg-white rounded-xl shadow-2xl max-w-md w-full m-4"
            style={{ margin: "20px", padding: "10px" }}
          >
            <ForgotPassword onClose={() => setShowForgotPasswordModal(false)} />
          </motion.div>
        </div>
      )}

      {/* Resend Verification Modal */}
      {showResendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowResendModal(false)}
          ></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-50 bg-white rounded-xl shadow-2xl max-w-md w-full m-4"
            style={{ margin: "20px", padding: "10px" }}
          >
            <ResendEmail 
              onClose={() => setShowResendModal(false)} 
              defaultEmail={formData.email}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
