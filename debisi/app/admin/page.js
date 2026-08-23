"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import img from "../../images/backg.png";
import logo from "../../images/debisi_logo.png";
import { useAuth } from "../../contexts/AuthContext";
import { auth } from "../../config/firebase";
import { signOut } from "firebase/auth";
import { gql, useMutation } from "@apollo/client";

const CHECK_RATE_LIMIT = gql`
  mutation CheckAdminRateLimit($email: String!) {
    checkAdminLoginRateLimit(email: $email) {
      allowed
      remainingAttempts
      lockoutSeconds
    }
  }
`;

const RECORD_FAILED_LOGIN = gql`
  mutation RecordFailedAdminLogin($email: String!) {
    recordFailedAdminLogin(email: $email) {
      allowed
      remainingAttempts
      lockoutSeconds
    }
  }
`;

const RESET_RATE_LIMIT = gql`
  mutation ResetAdminRateLimit($email: String!) {
    resetAdminLoginRateLimit(email: $email)
  }
`;

export default function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [validationErrors, setValidationErrors] = useState({});

  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

  // Check lockout state on mount and ticker
  useEffect(() => {
    const checkLockout = () => {
      const lockoutUntil = Number(localStorage.getItem("admin_lockout_until") || 0);
      const now = Date.now();
      if (lockoutUntil > now) {
        setLockoutRemaining(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setLockoutRemaining(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatLockoutTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

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
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    // Clear general error when user starts typing
    if (error) setError(null);
  };

  const { login: authLogin, refetchUser } = useAuth();
  const [checkRateLimit] = useMutation(CHECK_RATE_LIMIT);
  const [recordFailedLogin] = useMutation(RECORD_FAILED_LOGIN);
  const [resetRateLimit] = useMutation(RESET_RATE_LIMIT);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    const attemptsKey = `admin_attempts_${formData.email.toLowerCase().trim()}`;
    let currentAttempts = Number(localStorage.getItem(attemptsKey) || 0);

    // 1. Check server-side rate limit before attempting login
    try {
      const checkRes = await checkRateLimit({ variables: { email: formData.email } });
      const checkData = checkRes?.data?.checkAdminLoginRateLimit;
      if (checkData && !checkData.allowed) {
        setLockoutRemaining(checkData.lockoutSeconds || 900);
        setError("Too many failed attempts. Portal locked.");
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Backend rate limit check skipped:", err.message);
    }

    try {
      await authLogin(formData.email, formData.password);

      // After Firebase login, fetch the backend user to check role
      const result = await refetchUser();
      const userRole = result?.data?.me?.role;

      if (userRole !== "ADMIN") {
        // Sign them out immediately — not an admin
        await signOut(auth);
        localStorage.removeItem("userToken");

        currentAttempts += 1;
        localStorage.setItem(attemptsKey, currentAttempts);
        if (currentAttempts >= MAX_ATTEMPTS) {
          const lockoutExpiry = Date.now() + LOCKOUT_DURATION_MS;
          localStorage.setItem("admin_lockout_until", lockoutExpiry);
          setLockoutRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000));
        }

        // Record failed attempt on server
        try {
          await recordFailedLogin({ variables: { email: formData.email } });
        } catch (e) {}

        setError("Access denied. This portal is for administrators only.");
        return;
      }

      // Login successful and role is ADMIN — clear attempts locally & on server
      localStorage.removeItem(attemptsKey);
      localStorage.removeItem("admin_lockout_until");
      try {
        await resetRateLimit({ variables: { email: formData.email } });
      } catch (e) {}

      router.replace("/admin/dashboard");
    } catch (err) {
      console.error('Admin login error:', err);
      currentAttempts += 1;
      localStorage.setItem(attemptsKey, currentAttempts);

      let serverRemaining = null;
      try {
        const failRes = await recordFailedLogin({ variables: { email: formData.email } });
        const failData = failRes?.data?.recordFailedAdminLogin;
        if (failData) {
          if (!failData.allowed) {
            setLockoutRemaining(failData.lockoutSeconds || 900);
          }
          serverRemaining = failData.remainingAttempts;
        }
      } catch (e) {}

      if (currentAttempts >= MAX_ATTEMPTS || (serverRemaining !== null && serverRemaining <= 0)) {
        const lockoutExpiry = Date.now() + LOCKOUT_DURATION_MS;
        localStorage.setItem("admin_lockout_until", lockoutExpiry);
        setLockoutRemaining(Math.ceil(LOCKOUT_DURATION_MS / 1000));
        setError(`Too many failed attempts. Portal locked for 15 minutes.`);
      } else {
        const remaining = serverRemaining !== null ? serverRemaining : (MAX_ATTEMPTS - currentAttempts);
        setError(`${err.message || "Invalid credentials"}. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining before 15-min lockout)`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center" style={{ height: '100vh' }}>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full m-4 bg-white/80 backdrop-blur-md rounded-xl shadow-2xl"
        style={{ padding: '20px', margin: '15px' }}
      >
        <div className="text-center">
          {/* Add the logo here */}
          <Image
            src={logo}
            alt="Logo"
            width={30}
            height={30}
            style={{ marginLeft: 'auto', marginRight: 'auto' }}
          />
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
            Dear Admin
          </h2>
          <p className="text-sm text-gray-600" style={{ margin: '5px' }}>
            Please sign in to your account
          </p>
        </div>

        {lockoutRemaining > 0 && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-center">
            <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Portal Locked</p>
            <p className="text-sm font-semibold text-rose-600 mt-1">
              Too many failed login attempts.
            </p>
            <p className="text-2xl font-black text-rose-800 mt-2 font-mono">
              {formatLockoutTimer(lockoutRemaining)}
            </p>
            <p className="text-xs text-rose-500 mt-1">Please wait before trying again.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && lockoutRemaining === 0 && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-red-50 p-4 border border-red-200"
            >
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700" style={{ marginBottom: '5px' }}>
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={lockoutRemaining > 0}
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none rounded-lg relative block w-full border ${validationErrors.email ? 'border-red-300' : 'border-gray-300'
                    } bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${lockoutRemaining > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Enter your email"
                  style={{ padding: '10px', marginBottom: '5px' }}
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700" style={{ marginBottom: '5px' }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={lockoutRemaining > 0}
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none rounded-lg relative block w-full border ${validationErrors.password ? 'border-red-300' : 'border-gray-300'
                    } bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${lockoutRemaining > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Enter your password"
                  style={{ padding: '10px', marginBottom: '5px' }}
                />
                <button
                  type="button"
                  disabled={lockoutRemaining > 0}
                  className="absolute inset-y-0 right-0 flex items-center"
                  style={{ paddingRight: '12px' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors duration-200">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors duration-200">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

          <div className="" style={{ marginTop: '25px' }}>
            <motion.button
              type="submit"
              disabled={isLoading || lockoutRemaining > 0}
              whileHover={{ scale: lockoutRemaining > 0 ? 1 : 1.01 }}
              whileTap={{ scale: lockoutRemaining > 0 ? 1 : 0.99 }}
              style={{ padding: '10px', background: lockoutRemaining > 0 ? "#94a3b8" : "linear-gradient(to right, black, var(--primaryColor))" }}
              className={`group relative w-full flex justify-center border border-transparent text-sm font-medium rounded-lg text-white ${isLoading || lockoutRemaining > 0 ? 'cursor-not-allowed opacity-75' : 'bg-purple-600 hover:bg-purple-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl`}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {lockoutRemaining > 0 ? `Locked (${formatLockoutTimer(lockoutRemaining)})` : isLoading ? "Signing in..." : "Sign in"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
