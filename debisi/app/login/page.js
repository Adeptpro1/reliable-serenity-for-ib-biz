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

  const [isLoading, setIsLoading] = useState(false);


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
      className="relative flex items-center justify-center"
      style={{ height: "100vh" }}
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

      <div className="relative z-10 flex flex-col items-center w-full max-w-md" style={{margin: "8px"}}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-white/80 backdrop-blur-md rounded-xl shadow-2xl"
          style={{ padding: "20px" }}
        >
          <div className="text-center">
          <Image
            src={logo}
            alt="Logo"
            width={30}
            height={30}
            style={{ marginLeft: "auto", marginRight: "auto" }}
          />
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm text-gray-600" style={{ margin: "5px" }}>
            Please sign in to your account
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-red-50 p-4 border border-red-200"
            >
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )} */}
          <div className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "5px" }}
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
                  className={`appearance-none rounded-lg relative block w-full border ${validationErrors.email
                      ? "border-red-300"
                      : "border-gray-300"
                    } bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                  placeholder="Enter your email"
                  style={{ padding: "10px", marginBottom: "5px" }}
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
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "5px" }}
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
                  className={`appearance-none rounded-lg relative block w-full border ${validationErrors.password
                      ? "border-red-300"
                      : "border-gray-300"
                    } bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                  placeholder="Enter your password"
                  style={{ padding: "10px", marginBottom: "5px" }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center"
                  style={{ paddingRight: "12px" }}
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
          </div>

          <div className="text-sm flex justify-end mt-2 mb-2 sm:mt-4">
            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(true)}
              className="font-medium hover:text-blue-500 transition-colors duration-200"
              style={{ color: "purple" }}
            >
              Forgot your password?
            </button>
          </div>

          <div className="" style={{ marginTop: "5px" }}>
            <motion.button
              type="submit"
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
            <a
              href="/register"
              className="font-medium hover:text-blue-500 transition-colors duration-200"
              style={{ color: "purple" }}
            >
              Sign up
            </a>
          </div>
        </form>
      </motion.div>

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
