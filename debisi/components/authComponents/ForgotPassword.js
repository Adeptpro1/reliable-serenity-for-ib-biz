import React, { useState } from "react";
import { motion } from "framer-motion";

const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) return;

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      const { auth } = await import('../../config/firebase');
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset link has been sent to your email.");
    } catch (error) {
      console.error('Password reset error:', error);
      if (error.code === 'auth/network-request-failed') {
        setError("Network Error. Please check your internet connection.");
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="max-w-md w-full bg-white rounded-xl"
      style={{ padding: "5px" }}
    >
      <div
        className="flex justify-between items-center"
        style={{ marginBottom: "10px" }}
      >
        <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <p className="text-sm text-gray-600" style={{ marginBottom: "10px" }}>
      Enter your email address and we&aposll send you a link to reset your
        password.
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
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
            style={{ marginBottom: "5px" }}
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
              setMessage("");
            }}
            placeholder="Enter your email"
            required
            className="appearance-none rounded-lg relative block w-full border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            style={{ padding: "10px", marginBottom: "10px" }}
          />
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          style={{
            padding: "10px",
            background: "linear-gradient(to right, #D22730, purple)",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
          className={`w-full flex justify-center border border-transparent rounded-md shadow-sm text-sm 
            font-medium text-white ${
              isLoading ? "opacity-50" : ""
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200`}
        >
          {isLoading ? (
            <>
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
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default ForgotPassword;
