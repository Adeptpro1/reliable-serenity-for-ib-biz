"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { withAuth } from "@/middlewares/withAuth";
import { motion } from "framer-motion";
import { UPDATE_USER_PROFILE, DELETE_USER } from "../../graphql/mutations/user/auth";
import { useAuth } from "../../contexts/AuthContext";
import ChangePassword from "../authComponents/ChangePassword";
import { formatList, formatLabel } from "@/utils/formatters";
import toast from "react-hot-toast";

const EditProfile = ({ userData }) => {
  const { refetchUser } = useAuth();
  const formatDateToMMDDYYYY = (input) => {
    const date = new Date(input);
    if (isNaN(date.getTime())) return ""; // Invalid date fallback

    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();

    return `${mm}/${dd}/${yyyy}`;
  };

  const maxDobDate = new Date();
  maxDobDate.setFullYear(maxDobDate.getFullYear() - 15);
  const maxDobString = maxDobDate.toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    phone: userData.phone || "",
    lg: userData.lg || "",
    city: userData.city || "",
    town: userData.town || "",
    state: userData.state || "",
    gender: userData.gender || "",
    dob: userData?.dob
      ? (() => {
          const parsedDate = new Date(Number(userData.dob));
          return isNaN(parsedDate.getTime())
            ? ""
            : parsedDate.toISOString().split("T")[0];
        })()
      : "",
  });

  const [validationErrors, setValidationErrors] = useState({});

  const [updateUser, { loading }] = useMutation(UPDATE_USER_PROFILE, {
    onCompleted: () => {
      toast.success("Profile updated successfully!");
      refetchUser(); // Refresh user data in auth context
    },
    onError: (error) => {
      if (
        error.networkError ||
        error.message?.toLowerCase().includes("network")
      ) {
        toast.error("Network Error. Please check your internet connection.");
      } else {
        toast.error(error.message || "Failed to update profile.");
      }
    },
  });

  const validateProfile = () => {
    const errors = {};

    // First name: min 3 chars, letters only (no numbers)
    if (formData.firstName.trim() && formData.firstName.trim().length < 3) {
      errors.firstName = "First name must be at least 3 characters";
    } else if (formData.firstName.trim() && !/^[a-zA-Z\s\-']+$/.test(formData.firstName.trim())) {
      errors.firstName = "First name can only contain letters";
    }

    // Last name: min 3 chars, letters only (no numbers)
    if (formData.lastName.trim() && formData.lastName.trim().length < 3) {
      errors.lastName = "Last name must be at least 3 characters";
    } else if (formData.lastName.trim() && !/^[a-zA-Z\s\-']+$/.test(formData.lastName.trim())) {
      errors.lastName = "Last name can only contain letters";
    }

    // Phone: optional, but must match Nigerian format if provided
    if (formData.phone.trim()) {
      const cleaned = formData.phone.trim();
      const digitsOnly = cleaned.replace(/\D/g, "");
      if (
        !/^(\+?\d[\d\s\-()]{8,18}\d)$/.test(cleaned) ||
        digitsOnly.length < 10 ||
        digitsOnly.length > 15
      ) {
        errors.phone =
          "Please enter a valid Nigerian phone number (e.g. 08012345678 or +2348012345678)";
      }
    }

    // DOB validation: At least 15 years old
    if (formData.dob) {
      const selectedDate = new Date(formData.dob);
      if (selectedDate > maxDobDate) {
        errors.dob = "You must be at least 15 years old";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfile()) return;

    try {
      // Debug: Check if we have a token
      const token = localStorage.getItem("userToken");

      const input = { ...formData };

      // Remove empty string fields that are enums
      ["gender", "lg", "city", "town", "state"].forEach((field) => {
        if (!input[field]) delete input[field];
      });

      // Only include dob if it exists
      if (formData.dob) {
        input.dob = new Date(formData.dob).toISOString();
      }

      const result = await updateUser({
        variables: { input },
      });

    } catch (err) {
      console.error("Error updating profile:", err); // Add debug logging
      if (err.networkError || err.message?.toLowerCase().includes("network")) {
        toast.error("Network Error. Please check your internet connection.");
      } else {
        toast.error(
          err.message || "An error occurred while updating your profile",
        );
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear validation error as user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const isNonIbadan = formData.lg === "I_DO_NOT_STAY_IN_OYO";

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
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      city: isNonIbadan ? "" : prev.city,
      town: isNonIbadan ? "" : prev.town,
      state: isNonIbadan ? prev.state : "",
    }));
  }, [isNonIbadan]);

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const [deleteUser, { loading: deletingUser }] = useMutation(DELETE_USER, {
    onCompleted: () => {
      toast.success("Account deleted successfully.");
      localStorage.removeItem("userToken");
      window.location.href = "/";
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete account.");
    },
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              style={{ marginBottom: "5px" }}
            >
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              maxLength={30}
              value={formData.firstName}
              onChange={handleChange}
              className={`appearance-none rounded-lg relative block w-full border ${
                validationErrors.firstName ? "border-red-400" : "border-gray-300"
              } bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
              style={{ padding: "10px", marginBottom: "2px" }}
            />
            {validationErrors.firstName && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.firstName}</p>
            )}
            <div className="flex justify-end pr-1">
              <span className={`text-[10px] ${formData.firstName.length >= 30 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                {formData.firstName.length}/30
              </span>
            </div>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              style={{ marginBottom: "5px" }}
            >
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              maxLength={30}
              value={formData.lastName}
              onChange={handleChange}
              className={`appearance-none rounded-lg relative block w-full border ${
                validationErrors.lastName ? "border-red-400" : "border-gray-300"
              } bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
              style={{ padding: "10px", marginBottom: "2px" }}
            />
            {validationErrors.lastName && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.lastName}</p>
            )}
            <div className="flex justify-end pr-1">
              <span className={`text-[10px] ${formData.lastName.length >= 30 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                {formData.lastName.length}/30
              </span>
            </div>
          </div>
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            style={{ marginBottom: "5px" }}
          >
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            maxLength={20}
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. 08012345678"
            className={`appearance-none rounded-lg relative block w-full border ${
              validationErrors.phone ? "border-red-400" : "border-gray-300"
            } bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
            style={{ padding: "10px", marginBottom: "2px" }}
          />
          {validationErrors.phone ? (
            <p className="text-xs text-red-600 mt-1">{validationErrors.phone}</p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">Optional — Nigerian format only (e.g. 08012345678)</p>
          )}
          <div className="flex justify-end pr-1">
            <span className={`text-[10px] ${formData.phone.length >= 20 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
              {formData.phone.length}/20
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              style={{ marginBottom: "5px" }}
            >
              Local Government
            </label>
            <select
              name="lg"
              value={formData.lg}
              onChange={handleChange}
              className="appearance-none rounded-lg relative block w-full border border-gray-300 bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              style={{ padding: "10px", marginBottom: "5px" }}
            >
              <option value="">Select LG</option>
              {formatList(lgOptions).map((option) => (
                <option key={option} value={option.replace(/ /g, "_")}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              style={{ marginBottom: "5px" }}
            >
              City
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={isNonIbadan}
              className={`appearance-none rounded-lg relative block w-full border border-gray-300 bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                isNonIbadan ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              style={{ padding: "10px", marginBottom: "5px" }}
            >
              <option value="">Select City</option>
              {formatList(cityOptions).map((option) => (
                <option key={option} value={option.replace(/ /g, "_")}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              style={{ marginBottom: "5px" }}
            >
              Town
            </label>
            <select
              name="town"
              value={formData.town}
              onChange={handleChange}
              disabled={isNonIbadan}
              className={`appearance-none rounded-lg relative block w-full border border-gray-300 bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                isNonIbadan ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              style={{ padding: "10px", marginBottom: "5px" }}
            >
              <option value="">Select Town</option>
              {formatList(townOptions).map((option) => (
                <option key={option} value={option.replace(/ /g, "_")}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              style={{ marginBottom: "5px" }}
            >
              State
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={!isNonIbadan}
              className={`appearance-none rounded-lg relative block w-full border border-gray-300 bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                !isNonIbadan ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              style={{ padding: "10px", marginBottom: "5px" }}
            >
              <option value="">Select State</option>
              {formatList(stateOptions).map((option) => (
                <option key={option} value={option.replace(/ /g, "_")}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              style={{ marginBottom: "5px" }}
            >
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="appearance-none rounded-lg relative block w-full border border-gray-300 bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              style={{ padding: "10px", marginBottom: "5px" }}
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            style={{ marginBottom: "5px" }}
          >
            Date of Birth {formatDateToMMDDYYYY(Number(userData.dob))}
          </label>
          <input
            type="date"
            name="dob"
            max={maxDobString}
            value={formData.dob}
            onChange={handleChange}
            className={`appearance-none rounded-lg relative block w-full border ${
              validationErrors.dob ? "border-red-400" : "border-gray-300"
            } bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
            style={{ padding: "10px", marginBottom: "5px" }}
          />
          {validationErrors.dob && (
            <p className="text-xs text-red-600 mt-1">{validationErrors.dob}</p>
          )}
        </div>

        <div className="text-sm flex justify-start" style={{ padding: "10px" }}>
          <button
            type="button"
            onClick={() => setShowChangePasswordModal(true)}
            className="font-medium hover:text-blue-500 transition-colors duration-200"
            style={{ color: "purple" }}
          >
            Change Password
          </button>
        </div>

        <div>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            style={{
              padding: "10px",
              background: "linear-gradient(to right, purple, #D22730)",
              marginTop: "5px",
              width: "100%",
            }}
            className={`group relative flex justify-center border border-transparent text-sm font-medium rounded-lg text-white ${
              loading ? "cursor-not-allowed" : "hover:bg-blue-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl`}
          >
            {loading ? "Updating Profile..." : "Update Profile"}
          </motion.button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="mt-12 border border-red-200 rounded-xl bg-red-50/30 p-6">
        <h3 className="text-lg font-semibold text-red-700 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-600 mb-4">
          Permanently delete your account and all associated data, including businesses, notices, products, and analytics. This action is irreversible.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
        >
          Delete Account
        </button>
      </div>

      {/* Forgot Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowChangePasswordModal(false)}
          ></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-50 bg-white rounded-xl shadow-2xl max-w-md w-full m-4"
            style={{ margin: "20px", padding: "10px" }}
          >
            <ChangePassword onClose={() => setShowChangePasswordModal(false)} />
          </motion.div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteModal(false);
              setConfirmText("");
            }}
          ></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-50 bg-white rounded-xl shadow-2xl max-w-md w-full m-4 p-6"
          >
            <h3 className="text-xl font-bold text-red-700 mb-3">Delete Your Account?</h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              All your data will be deleted alongside your account, and all related data to you will be permanently deleted, including businesses, notices, products, analytics, images, and videos. This action is irreversible.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Type <span className="font-bold text-red-600">DELETE MY ACCOUNT</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="appearance-none rounded-lg relative block w-full border border-gray-300 bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 p-2 text-sm"
              />
            </div>
            <div className="flex space-x-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmText("");
                }}
                disabled={deletingUser}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (confirmText !== "DELETE MY ACCOUNT") {
                    toast.error("Please type the exact confirmation phrase");
                    return;
                  }
                  await deleteUser();
                }}
                disabled={deletingUser || confirmText !== "DELETE MY ACCOUNT"}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors duration-200 ${
                  deletingUser || confirmText !== "DELETE MY ACCOUNT"
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 shadow-md shadow-red-200"
                }`}
              >
                {deletingUser ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default withAuth(EditProfile);
