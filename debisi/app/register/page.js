"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import img from "../../images/backg.png";
import logo from "../../images/debisi_logo.png";
import { useMutation } from "@apollo/client";
import { REGISTER_USER } from "@/api/queries/auth/auth";
import PolicyModal from "@/components/authComponents/PolicyModal";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { auth as firebaseAuth } from "@/config/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { formatList, formatLabel } from "@/utils/formatters";

// Add custom styles for compact form
const compactFormStyles = `
  .compact-form {
    max-height: 85vh;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }
  
  .compact-form::-webkit-scrollbar {
    width: 6px;
  }
  
  .compact-form::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .compact-form::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }
  
  .compact-form::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.7);
  }
  
  .compact-input {
    padding: 8px !important;
    margin-bottom: 3px !important;
  }
  
  .compact-label {
    margin-bottom: 4px !important;
  }
  
  @media (max-height: 700px) {
    .compact-form {
      max-height: 80vh;
    }
  }
`;

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  // const [error, setError] = useState(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "USER",
    gender: "",
    lg: "",
    city: null,
    state: null,
    town: null,
    agreeToPolicy: false,
    dateOfBirth: "",
  });

  const [registerMutation, { loading: mutationLoading }] = useMutation(
    REGISTER_USER,
    {
      onCompleted: () => {
        router.push("/login");
      },
      // Error handling is handled in handleSubmit catch block
    },
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Add LG and City options
  const lgOptions = [
    "I_DO_NOT_STAY_IN_OYO",
    "Afijio",
    "Akinyele",
    "Atiba",
    "Atisbo",
    "Egbeda",
    "Ibadan_North",
    "Ibadan_North_East",
    "Ibadan_North_West",
    "Ibadan_South_East",
    "Ibadan_South_West",
    "Ibarapa_Central",
    "Ibarapa_East",
    "Ibarapa_North",
    "Ido",
    "Irepo",
    "Iseyin",
    "Itesiwaju",
    "Iwajowa",
    "Kajola",
    "Lagelu",
    "Ogbomosho_North",
    "Ogbomosho_South",
    "Ogo_Oluwa",
    "Olorunsogo",
    "Oluyole",
    "Ona_Ara",
    "Orelope",
    "Ori_Ire",
    "Oyo_East",
    "Oyo_West",
    "Saki_East",
    "Saki_West",
    "Surulere",
  ];

  const stateOptions = [
    "OUTSIDE_NIGERIA",
    "Abia",
    "Adamawa",
    "Akwa_Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross_River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ];

  const cityOptions = ["Ibadan", "Ogbomosho", "Oyo", "Iseyin", "Saki"];

  const townOptions = [
    "Adegbayi",
    "Adeoyo",
    "Agbowo",
    "Agodi",
    "Ago_Are",
    "Akanran",
    "Akinyele",
    "Ajibode",
    "Akobo",
    "Alakia",
    "Alalubosa",
    "Apata",
    "Apete",
    "Apatere",
    "Apomu",
    "Awe",
    "Bashorun",
    "Beere",
    "Bodija",
    "Challenge",
    "Dugbe",
    "Egbeda",
    "Eleyele",
    "Eruwa",
    "Felele",
    "Fiditi",
    "Foko",
    "Idi_Ayunre",
    "Idere",
    "Igbo_Ora",
    "Igboho",
    "Igbeti",
    "Ilero",
    "Ilora",
    "Jobele",
    "Jericho",
    "Kisi",
    "Labiran",
    "Lalupon",
    "Lanlate",
    "Mokola",
    "Monatan",
    "Moniya",
    "Oja_ba",
    "Oje",
    "Ojoo",
    "OkeAdo",
    "OkeBola",
    "OkeOffa",
    "OkePadi",
    "Okeho",
    "Olanla",
    "Ologuneru",
    "Olodo",
    "Olorunda",
    "Olorunsogo",
    "Olojuoro",
    "Oluyole",
    "Omi_Adio",
    "Onireke",
    "Orogun",
    "Osekan",
    "Otu",
    "Podo",
    "Samonda",
    "Sango",
    "Sepeteri",
    "Tede",
    "UI",
    "Yemetu",
  ];

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }
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
    if (formData.phone && !/^\d{10,15}$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }
    if (!formData.lg.trim()) {
      errors.lg = "Local Government is required";
    }
    if (formData.lg !== "I_DO_NOT_STAY_IN_OYO" && !formData.city.trim()) {
      errors.city = "City is required";
    } else {
      delete errors.city; // Clear city error if not applicable
    }
    if (formData.lg !== "I_DO_NOT_STAY_IN_OYO" && !formData.city.trim()) {
      errors.city = "Town is required";
    } else {
      delete errors.town; // Clear city error if not applicable
    }
    if (formData.lg === "I_DO_NOT_STAY_IN_OYO" && !formData.state.trim()) {
      errors.state = "State is required";
    } else {
      delete errors.state; // Clear state error if not applicable
    }
    if (!formData.dateOfBirth.trim()) {
      errors.dateOfBirth = "Date of birth is required";
    }
    if (!formData.gender.trim()) {
      errors.gender = "Gender is required";
    }
    if (!formData.agreeToPolicy) {
      errors.agreeToPolicy = "You must agree to the policy to continue";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (formData.lg === "I_DO_NOT_STAY_IN_OYO") {
      setValidationErrors((prev) => ({
        ...prev,
        city: undefined,
        town: undefined,
      }));
    } else {
      setValidationErrors((prev) => ({ ...prev, state: undefined }));
    }
  }, [formData.lg]);

  useEffect(() => {
    if (formData.lg === "I_DO_NOT_STAY_IN_OYO") {
      setFormData((prev) => ({ ...prev, city: null, town: null })); // Set city to null
      setValidationErrors((prev) => ({
        ...prev,
        city: undefined,
        town: undefined,
      })); // Clear city error
    } else {
      setFormData((prev) => ({ ...prev, state: null })); // Set state to null
      setValidationErrors((prev) => ({ ...prev, state: undefined })); // Clear state error
    }
  }, [formData.lg]);

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

    // Clear general error when user starts typing (No-op since using toasts)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // 1. Register in Firebase
      // Imports are at the top of the file
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        formData.email,
        formData.password,
      );
      const firebaseUser = userCredential.user;

      // 2. Send verification email
      await sendEmailVerification(firebaseUser);

      // 3. Sync with Prisma backend
      const { town, city, state, password, ...otherFields } = formData;
      await registerMutation({
        variables: {
          ...otherFields,
          firebaseUid: firebaseUser.uid,
          town: town || undefined,
          city: city || undefined,
          state: state || undefined,
          dob: new Date(formData.dateOfBirth).toISOString(),
          agreedToPolicy: formData.agreeToPolicy,
        },
      });
      toast.success(
        "Account created successfully! Please check your email to verify.",
      );
      router.push("/login");
    } catch (err) {
      console.error("Registration error:", err);
      setIsSubmitting(false);

      if (err.code === "auth/email-already-in-use") {
        toast.error(
          "This email is already registered. Please try logging in instead.",
        );
      } else if (err.code === "auth/network-request-failed") {
        toast.error("Network Error. Please check your internet connection.");
      } else if (err.networkError || err.graphQLErrors) {
        toast.error(
          "Account created, but database sync failed. Please login to complete your profile.",
        );
        setTimeout(() => router.push("/login"), 3000);
      } else {
        toast.error(err.message || "An unexpected error occurred");
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-6 sm:py-8 px-2 sm:px-0">
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
      <PolicyModal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
      />

      <div
        className="relative z-10 flex flex-col items-center w-full max-w-md"
        style={{ margin: "8px" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-white/80 backdrop-blur-md rounded-xl shadow-2xl compact-form"
          style={{ padding: "16px" }}
        >
          <style jsx>{compactFormStyles}</style>
          <div className="text-center">
            {/* Add the logo here */}
            <Image
              src={logo}
              alt="Logo"
              width={30}
              height={30}
              style={{ marginLeft: "auto", marginRight: "auto" }}
            />
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Create Account
            </h2>
            <p className="text-sm text-gray-600" style={{ margin: "5px" }}>
              Please fill in your details to sign up
            </p>
          </div>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            {/* {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-red-50 p-4 border border-red-200"
            >
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )} */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 compact-label"
                  >
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`appearance-none rounded-lg relative block w-full border compact-input ${
                        validationErrors.firstName
                          ? "border-red-300"
                          : "border-gray-300"
                      } bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                      placeholder="First Name"
                    />
                    {validationErrors.firstName && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-1 text-sm text-red-600"
                      >
                        {validationErrors.firstName}
                      </motion.p>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                    style={{ marginBottom: "5px" }}
                  >
                    Last Name
                  </label>
                  <div className="relative">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`appearance-none rounded-lg relative block w-full border ${
                        validationErrors.lastName
                          ? "border-red-300"
                          : "border-gray-300"
                      } bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                      placeholder="Last Name"
                      style={{ padding: "10px", marginBottom: "5px" }}
                    />
                    {validationErrors.lastName && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-1 text-sm text-red-600"
                      >
                        {validationErrors.lastName}
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-gray-700"
                    style={{ marginBottom: "5px" }}
                  >
                    Date of Birth
                  </label>
                  <div className="relative">
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={`appearance-none rounded-lg relative block w-full border ${
                        validationErrors.dateOfBirth
                          ? "border-red-300"
                          : "border-gray-300"
                      } bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                      style={{ padding: "10px", marginBottom: "5px" }}
                    />
                    {validationErrors.dateOfBirth && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-1 text-sm text-red-600"
                      >
                        {validationErrors.dateOfBirth}
                      </motion.p>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700"
                    style={{ marginBottom: "5px" }}
                  >
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      id="gender"
                      name="gender"
                      required
                      value={formData.gender}
                      onChange={handleChange}
                      className={`appearance-none rounded-lg relative block w-full border ${
                        validationErrors.gender
                          ? "border-red-300"
                          : "border-gray-300"
                      } bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                      style={{ padding: "10px", marginBottom: "5px" }}
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      {/* <option value="Other">Other</option> */}
                    </select>
                    {validationErrors.gender && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-1 text-sm text-red-600"
                      >
                        {validationErrors.gender}
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>
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
                    className={`appearance-none rounded-lg relative block w-full border ${
                      validationErrors.email
                        ? "border-red-300"
                        : "border-gray-300"
                    } bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    placeholder="youremail@example.com"
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

              <div>
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
                    className={`appearance-none rounded-lg relative block w-full border ${
                      validationErrors.password
                        ? "border-red-300"
                        : "border-gray-300"
                    } bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    placeholder="Password"
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

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                  style={{ marginBottom: "5px" }}
                >
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className={`appearance-none rounded-lg relative block w-full border ${
                      validationErrors.phone
                        ? "border-red-300"
                        : "border-gray-300"
                    } bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    placeholder="08012345678"
                    style={{ padding: "10px", marginBottom: "5px" }}
                  />
                  {validationErrors.phone && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {validationErrors.phone}
                    </motion.p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="lg"
                  className="block text-sm font-medium text-gray-700"
                  style={{ marginBottom: "5px" }}
                >
                  Local Government (Where you live)
                </label>
                <div className="relative">
                  <select
                    id="lg"
                    name="lg"
                    required
                    value={formData.lg}
                    onChange={handleChange}
                    className={`appearance-none rounded-lg relative block w-full border ${
                      validationErrors.lg ? "border-red-300" : "border-gray-300"
                    } bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    style={{ padding: "10px", marginBottom: "5px" }}
                  >
                    <option value="">Select Local Government</option>
                    {formatList(lgOptions).map((option) => (
                      <option key={option} value={option.replace(/ /g, "_")}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {validationErrors.lg && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {validationErrors.lg}
                    </motion.p>
                  )}
                </div>
              </div>

              {formData.lg === "I_DO_NOT_STAY_IN_OYO" ? (
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700"
                    style={{ marginBottom: "5px" }}
                  >
                    State
                  </label>
                  <div className="relative">
                    <select
                      id="state"
                      name="state"
                      required
                      value={formData.state || ""}
                      onChange={handleChange}
                      className={`appearance-none rounded-lg relative block w-full border ${
                        validationErrors.state
                          ? "border-red-300"
                          : "border-gray-300"
                      } bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                      style={{ padding: "10px", marginBottom: "5px" }}
                    >
                      <option value="">Select State</option>
                      {formatList(stateOptions).map((option) => (
                        <option key={option} value={option.replace(/ /g, "_")}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {validationErrors.state && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-1 text-sm text-red-600"
                      >
                        {validationErrors.state}
                      </motion.p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                    style={{ marginBottom: "5px" }}
                  >
                    City (Where you live)
                  </label>
                  <div className="relative">
                    <select
                      id="city"
                      name="city"
                      required
                      value={formData.city || ""}
                      onChange={handleChange}
                      className={`appearance-none rounded-lg relative block w-full border ${
                        validationErrors.city
                          ? "border-red-300"
                          : "border-gray-300"
                      } bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                      style={{ padding: "10px", marginBottom: "10px" }}
                    >
                      <option value="">Select City</option>
                      {formatList(cityOptions).map((option) => (
                        <option key={option} value={option.replace(/ /g, "_")}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {validationErrors.city && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-1 text-sm text-red-600"
                      >
                        {validationErrors.city}
                      </motion.p>
                    )}
                  </div>

                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                    style={{ marginBottom: "5px" }}
                  >
                    Town (Where you live)
                  </label>
                  <div className="relative">
                    <select
                      id="town"
                      name="town"
                      required
                      value={formData.town || ""}
                      onChange={handleChange}
                      className={`appearance-none rounded-lg relative block w-full border ${
                        validationErrors.town
                          ? "border-red-300"
                          : "border-gray-300"
                      } bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                      style={{ padding: "10px", marginBottom: "10px" }}
                    >
                      <option value="">Select Town</option>
                      {formatList(townOptions).map((option) => (
                        <option key={option} value={option.replace(/ /g, "_")}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {validationErrors.town && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-1 text-sm text-red-600"
                      >
                        {validationErrors.town}
                      </motion.p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex gap-2">
                  <input
                    id="agreeToPolicy"
                    name="agreeToPolicy"
                    type="checkbox"
                    checked={formData.agreeToPolicy}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200 flex-shrink-0"
                  />
                  <label
                    htmlFor="agreeToPolicy"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setShowPolicyModal(true)}
                      className="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
                    >
                      <span style={{ fontStyle: "italic", color: "purple" }}>
                        Debisi Policy Agreement
                      </span>
                    </button>
                  </label>
                </div>
                {validationErrors.agreeToPolicy && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-600"
                  >
                    {validationErrors.agreeToPolicy}
                  </motion.p>
                )}
              </div>

              <div className="" style={{ marginTop: "5px" }}>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    padding: "10px",
                    background: "linear-gradient(to right, purple, #D22730)",
                    marginTop: "5px",
                  }}
                  className={`group relative w-full flex justify-center border border-transparent text-sm font-medium rounded-lg text-white ${
                    isSubmitting ? "cursor-not-allowed" : "hover:bg-blue-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl`}
                >
                  {isSubmitting ? (
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
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </motion.button>
              </div>
            </div>

            <div
              className="text-center text-sm text-gray-600"
              style={{ marginTop: "10px" }}
            >
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium hover:text-blue-500 transition-colors duration-200"
                style={{ color: "purple" }}
              >
                Sign in
              </Link>
            </div>
          </form>
        </motion.div>

        <button
          onClick={() => router.push("/")}
          style={{ marginTop: "24px", padding: "10px 20px" }}
          className="flex items-center text-sm font-medium text-white hover:text-purple-200 transition-colors duration-200 group bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          &nbsp; Go back home
        </button>
      </div>
    </div>
  );
}
