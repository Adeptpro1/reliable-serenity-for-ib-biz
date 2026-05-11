import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function RegistrationSuccessModal({ isOpen, onClose }) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    router.push("/login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      ></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative z-50 bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Registration Successful!
          </h3>
          
          <div className="space-y-4 text-gray-600">
            <p className="text-lg">
              Your account has been created successfully.
            </p>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mt-4">
              <p className="font-bold text-blue-900 text-lg mb-2">
                Verify Your Email
              </p>
              <p className="text-sm text-blue-800 leading-relaxed">
                We&apos;ve sent a verification link to your email address. 
                <br /><br />
                Please check your <span className="font-bold">Inbox</span> or <span className="font-bold">Spam folder</span> to verify your account so you can log in to your dashboard.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full mt-8 py-4 px-6 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-lg"
            style={{
              background: "linear-gradient(to right, purple, #D22730)",
              boxShadow: "0 10px 20px -5px rgba(210, 39, 48, 0.4)",
            }}
          >
            Proceed to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
