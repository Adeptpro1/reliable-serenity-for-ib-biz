"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { withAuth } from "@/middlewares/withAuth";
import { motion } from "framer-motion";
import { UPDATE_USER_PROFILE } from "../../api/mutations/user/auth";
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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        // context: {
        //   headers: {
        //     authorization: `Bearer ${token}`
        //   }
        // }
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
              className="appearance-none rounded-lg relative block w-full border border-gray-300 bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              style={{ padding: "10px", marginBottom: "2px" }}
            />
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
              className="appearance-none rounded-lg relative block w-full border border-gray-300 bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              style={{ padding: "10px", marginBottom: "2px" }}
            />
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
            className="appearance-none rounded-lg relative block w-full border border-gray-300 bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            style={{ padding: "10px", marginBottom: "2px" }}
          />
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
            value={formData.dob}
            onChange={handleChange}
            className="appearance-none rounded-lg relative block w-full border border-gray-300 bg-white/50 backdrop-blur-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            style={{ padding: "10px", marginBottom: "5px" }}
          />
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
    </div>
  );
};

export default withAuth(EditProfile);
