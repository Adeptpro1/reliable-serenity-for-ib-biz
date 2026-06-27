import React, { useState, useRef } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { REGISTER_BUSINESS_WITH_DETAILS } from "@/graphql/queries/business/business";
import { UPLOAD_IMAGE } from "@/graphql/mutations/common";
import toast from "react-hot-toast";
import { formatList, formatLabel } from "@/utils/formatters";
import bnwLogo from "@/images/debisi_logo_bnw.png";
import { compressImage } from "@/utils/imageCompression";

const RegisterBusiness = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    watch,
  } = useForm();

  const businessName = watch("businessName", "");
  const description = watch("description", "");
  const phone = watch("phone", "");
  const primaryAddress = watch("primaryAddress", "");
  const additionalAddress = watch("additionalAddress", "");

  const [socialLinks, setSocialLinks] = useState([
    { contactType: "", url: "", isPrimary: false },
  ]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [registerBusinessWithDetails, { loading, error }] = useMutation(
    REGISTER_BUSINESS_WITH_DETAILS,
  );
  const [uploadImage] = useMutation(UPLOAD_IMAGE);

  // Constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];

  // Sample data - Replace with complete Oyo State data
  const oyoStateData = {
    towns: [
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
    ],
    cities: ["Ibadan", "Ogbomosho", "Oyo", "Iseyin", "Saki"],
    localGovernments: [
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
    ],
  };

  const businessCategories = [
    "AGRIBUSINESS",
    "MANUFACTURING",
    "RETAIL_WHOLESALE",
    "TECHNOLOGY",
    "HEALTHCARE",
    "EDUCATION",
    "TOURISM_HOSPITALITY",
    "REAL_ESTATE",
    "TRANSPORT_LOGISTICS",
    "FINANCIAL_SERVICES",
    "ENERGY",
    "MINING",
    "CREATIVE_ENTERTAINMENT",
    "PROFESSIONAL_SERVICES",
    "ENVIRONMENTAL_SERVICES",
    "SECURITY_SERVICES",
    "TELECOMMUNICATIONS",
    "MEDIA_PUBLISHING",
    "AUTOMOTIVE",
    "PERSONAL_SERVICES",
    "HOUSEHOLD_SERVICES",
    "AGRICULTURE",
    "BEAUTY_PERSONAL_CARE",
    "CONSTRUCTION",
    "ENERGY_UTILITIES",
    "ENTERTAINMENT_EVENTS",
    "FASHION_APPAREL",
    "FOOD_BEVERAGES",
    "GOVERNMENT_PUBLIC_SERVICES",
    "HOME_LIVING",
    "HOSPITALITY_TOURISM",
    "INDUSTRIAL_MANUFACTURING",
    "INFORMATION_TECHNOLOGY",
    "LEGAL_SERVICES",
    "LOGISTICS_TRANSPORTATION",
    "MARKETING_ADVERTISING",
    "MEDIA_COMMUNICATIONS",
    "NONPROFIT_COMMUNITY",
    "PET_ANIMAL_SERVICES",
    "RELIGIOUS_ORGANIZATIONS",
    "REPAIR_MAINTENANCE",
    "RETAIL_ECOMMERCE",
    "SAFETY_SECURITY",
    "SPORTS_FITNESS",
    "TRADES_ARTISANS",
    "WHOLESALE_DISTRIBUTION",
    "OTHER",
  ];

  const addSocialLink = () => {
    setSocialLinks([
      ...socialLinks,
      { contactType: "", url: "", isPrimary: false },
    ]);
  };

  // Helper that returns a base URL/prefix for a given contact type
  const getBaseUrlForContactType = (type) => {
    switch (type) {
      case "FACEBOOK":
        return "https://facebook.com/";
      case "TWITTER":
        return "https://X.com/";
      case "INSTAGRAM":
        return "https://instagram.com/";
      case "TIKTOK":
        return "https://tiktok.com/@";
      case "WEBSITE":
        return "https://";
      case "WHATSAPP":
        return "https://wa.me/";
      case "PHONE":
        return "tel:+234";
      case "TELEGRAM":
        return "https://t.me/";
      case "EMAIL":
        return "mailto:";
      case "OTHER":
      default:
        return "";
    }
  };

  const handleSocialLinkChange = (index, field, value) => {
    const updatedLinks = [...socialLinks];
    if (field === "isPrimary") {
      // Reset all other primary flags
      updatedLinks.forEach((link) => (link.isPrimary = false));
      updatedLinks[index].isPrimary = true;
    } else {
      // If user changed the contact type, and the url field is empty or previously matched a base
      if (field === "contactType") {
        const base = getBaseUrlForContactType(value);
        const currentUrl = updatedLinks[index].url || "";

        // If currentUrl is empty OR it exactly matches a previous base, prefill with the new base
        const previousTypeBase = getBaseUrlForContactType(
          updatedLinks[index].contactType,
        );
        const shouldPrefill =
          !currentUrl || (previousTypeBase && currentUrl === previousTypeBase);

        updatedLinks[index].contactType = value;
        updatedLinks[index].url = shouldPrefill ? base : currentUrl;
      } else {
        updatedLinks[index][field] = value;
      }
    }
    setSocialLinks(updatedLinks);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError("businessImage", {
          type: "size",
          message: "Image size should not exceed 5MB",
        });
        toast.error("Image size should not exceed 5MB");
        fileInputRef.current.value = "";
        setSelectedImage(null);
        setImagePreview(null);
        return;
      }

      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setError("businessImage", {
          type: "type",
          message: "Please upload a valid image file (JPEG, PNG, or GIF)",
        });
        toast.error("Invalid file type. Please upload JPEG, PNG, or GIF");
        fileInputRef.current.value = "";
        setSelectedImage(null);
        setImagePreview(null);
        return;
      }

      clearErrors("businessImage");
      setSelectedImage(file);

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    fileInputRef.current.value = "";
    clearErrors("businessImage");
  };

  const onSubmit = async (data) => {
    // Validate social links
    for (let i = 0; i < socialLinks.length; i++) {
      const link = socialLinks[i];
      const hasType = !!link.contactType;
      const hasUrl = !!link.url.trim();
      
      if (hasType && !hasUrl) {
        toast.error(`Please provide a URL for social link #${i + 1}`);
        return;
      }
      if (!hasType && hasUrl) {
        toast.error(`Please select a contact type for social link #${i + 1}`);
        return;
      }
    }

    // Filter out completely empty social links
    const filteredSocialLinks = socialLinks
      .filter((link) => link.contactType && link.url.trim())
      .map(({ contactType, url, isPrimary }) => ({
        type: contactType,
        url: url.trim(),
        isPrimary,
      }));

    let uploadedImageUrl = null;

    if (selectedImage) {
      try {
        toast.loading("Uploading logo...", { id: "img-upload" });
        const compressedImage = await compressImage(selectedImage);

        // Rename file for SEO: business-name-logo.webp
        const businessSlug = data.businessName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");
        const renamedFile = new File(
          [compressedImage],
          `${businessSlug}-logo.webp`,
          { type: "image/webp" },
        );

        const { data: uploadData } = await uploadImage({
          variables: { file: renamedFile },
        });
        uploadedImageUrl = uploadData.uploadImage;
        toast.success("Logo uploaded!", { id: "img-upload" });
      } catch (uploadErr) {
        console.error("Logo upload failed:", uploadErr);
        toast.error(
          "Logo upload failed. You can continue registering and upload your logo later in Edit Business.",
          { id: "img-upload", duration: 6000 },
        );
        // Don't block registration — proceed without image
      }
    }

    const formData = {
      name: data.businessName,
      description: data.description,
      phone: data.phone,
      category: data.category,
      isMadeInOyo: data.madeInOyoState || false,
      addresses: [
        {
          address1: data.primaryAddress,
          address2: data.additionalAddress || null,
          town: data.town,
          city: data.city,
          lg: data.localGovernment,
        },
      ],
      contactUrls: filteredSocialLinks,
      imageUrl: uploadedImageUrl,
    };

    try {
      const result = await registerBusinessWithDetails({
        variables: {
          input: formData,
        },
      });

      toast.success(
        "Business registered successfully! Your business is now live.",
      );
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error registering business:", err);
      if (err.networkError || err.message?.toLowerCase().includes("network")) {
        toast.error("Network Error. Please check your internet connection.");
      } else {
        toast.error(
          err.message || "Failed to register business. Please try again.",
        );
      }
    }
  };

  const onInvalidSubmit = (errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError) {
      toast.error(firstError.message || "Please check all required fields.");
    }
  };

  return (
    <div className="max-w-4xl" style={{ margin: "0 auto", padding: "1rem" }}>
      {loading && <p>Registering your business...</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}
      <form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-6">
        {/* Business Name */}
        <div className="form-group">
          <label
            className="block text-sm font-medium text-gray-700"
            style={{ marginBottom: "5px" }}
          >
            Business Name
          </label>
          <input
            type="text"
            style={{ padding: "10px" }}
            className={`w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.businessName ? "border-red-500" : "border-gray-300"
            }`}
            {...register("businessName", {
              required: "Business name is required",
              maxLength: {
                value: 40,
                message: "Business name cannot exceed 40 characters",
              },
              validate: (value) => {
                if (!value) return true;

                // Reject names that are purely numbers (e.g. "12345" or "123 456")
                if (/^[\d\s]+$/.test(value.trim())) {
                  return "Business name cannot be numbers only. Please use a real business name.";
                }

                const blockedSlugs = [
                  "debisi",
                  "debisi-ng",
                  "debisi-cp",
                  "debisi-ibadan",
                  "debising",
                  "debisicp",
                  "debisiibadan",
                ];
                const baseSlug = value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)+/g, "");
                if (
                  blockedSlugs.includes(baseSlug) ||
                  blockedSlugs.includes(value.toLowerCase().replace(/\s+/g, ""))
                ) {
                  return "This name is reserved by the system. Please use a different name.";
                }
                return true;
              },
            })}
          />
          <div className="flex justify-between mt-1">
            {errors.businessName ? (
              <p className="text-sm text-red-600">
                {errors.businessName.message}
              </p>
            ) : (
              <div />
            )}
            <p
              className={`text-xs ${businessName.length >= 40 ? "text-red-500 font-bold" : "text-gray-500"}`}
            >
              {businessName.length}/40
            </p>
          </div>
        </div>

        {/* Headquarters Address */}
        <div className="form-group">
          <label
            className="block text-sm font-medium text-gray-700"
            style={{ marginBottom: "5px" }}
          >
            Headquarters Address
          </label>
          <textarea
            style={{ padding: "10px" }}
            className={`w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.primaryAddress ? "border-red-500" : "border-gray-300"
            }`}
            rows="3"
            {...register("primaryAddress", {
              required: "Headquarters address is required",
              maxLength: {
                value: 120,
                message: "Address cannot exceed 120 characters",
              },
            })}
          />
          <div className="flex justify-between mt-1">
            {errors.primaryAddress ? (
              <p className="text-sm text-red-600">
                {errors.primaryAddress.message}
              </p>
            ) : (
              <div />
            )}
            <p
              className={`text-xs ${primaryAddress?.length >= 120 ? "text-red-500 font-bold" : "text-gray-500"}`}
            >
              {primaryAddress?.length || 0}/120
            </p>
          </div>
        </div>

        {/* Annex Address */}
        <div className="form-group">
          <label
            className="block text-sm font-medium text-gray-700"
            style={{ marginBottom: "5px" }}
          >
            Annex Address (Optional)
          </label>
          <textarea
            style={{ padding: "10px" }}
            className="w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            {...register("additionalAddress", {
              maxLength: {
                value: 120,
                message: "Address cannot exceed 120 characters",
              },
            })}
          />
          <div className="flex justify-end mt-1">
            <p
              className={`text-xs ${additionalAddress?.length >= 120 ? "text-red-500 font-bold" : "text-gray-500"}`}
            >
              {additionalAddress?.length || 0}/120
            </p>
          </div>
        </div>

        {/* Business Category */}
        <div className="form-group">
          <label
            className="block text-sm font-medium text-gray-700"
            style={{ marginBottom: "5px" }}
          >
            Business Category
          </label>
          <select
            style={{ padding: "10px" }}
            className={`w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.category ? "border-red-500" : "border-gray-300"
            }`}
            {...register("category", { required: "Please select a category" })}
          >
            <option value="">Select category</option>
            {formatList(businessCategories).map((category) => (
              <option key={category} value={category.replace(/ /g, "_")}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="form-group">
          <label
            className="block text-sm font-medium text-gray-700"
            style={{ marginBottom: "5px" }}
          >
            Description
          </label>
          <textarea
            style={{ padding: "10px" }}
            className={`w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            rows="5"
            {...register("description", {
              required: "Description is required",
              maxLength: {
                value: 150,
                message: "Description cannot exceed 150 characters",
              },
            })}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            ) : (
              <div />
            )}
            <p
              className={`text-xs ${description.length >= 150 ? "text-red-500 font-bold" : "text-gray-500"}`}
            >
              {description.length}/150
            </p>
          </div>
        </div>

        {/* Location Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label
              className="block text-sm font-medium text-gray-700"
              style={{ marginBottom: "5px" }}
            >
              Town
            </label>
            <select
              style={{ padding: "10px" }}
              className={`w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.town ? "border-red-500" : "border-gray-300"
              }`}
              {...register("town", { required: "Town is required" })}
            >
              <option value="">Select Town</option>
              {formatList(oyoStateData.towns).map((town) => (
                <option key={town} value={town.replace(/ /g, "_")}>
                  {town}
                </option>
              ))}
            </select>
            {errors.town && (
              <p className="mt-1 text-sm text-red-600">{errors.town.message}</p>
            )}
          </div>

          <div className="form-group">
            <label
              className="block text-sm font-medium text-gray-700"
              style={{ marginBottom: "5px" }}
            >
              City
            </label>
            <select
              style={{ padding: "10px" }}
              className={`w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.city ? "border-red-500" : "border-gray-300"
              }`}
              {...register("city", { required: "City is required" })}
            >
              <option value="">Select City</option>
              {formatList(oyoStateData.cities).map((city) => (
                <option key={city} value={city.replace(/ /g, "_")}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          <div className="form-group">
            <label
              className="block text-sm font-medium text-gray-700"
              style={{ marginBottom: "5px" }}
            >
              Local Government
            </label>
            <select
              style={{ padding: "10px" }}
              className={`w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.localGovernment ? "border-red-500" : "border-gray-300"
              }`}
              {...register("localGovernment", {
                required: "Local Government is required",
              })}
            >
              <option value="">Select Local Government</option>
              {formatList(oyoStateData.localGovernments).map((lg) => (
                <option key={lg} value={lg.replace(/ /g, "_")}>
                  {lg}
                </option>
              ))}
            </select>
            {errors.localGovernment && (
              <p className="mt-1 text-sm text-red-600">
                {errors.localGovernment.message}
              </p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="form-group">
          <label
            className="block text-sm font-medium text-gray-700"
            style={{ marginBottom: "5px" }}
          >
            Phone
          </label>
          <input
            type="tel"
            style={{ padding: "10px" }}
            className={`w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            {...register("phone", {
              required: "Phone number is required",
              maxLength: {
                value: 20,
                message: "Phone number cannot exceed 20 characters",
              },
              pattern: {
                value: /^[0-9\+\-\s\(\)]{10,20}$/,
                message: "Please enter a valid phone number",
              },
            })}
          />
          <div className="flex justify-between mt-1">
            {errors.phone ? (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            ) : (
              <div />
            )}
            <p
              className={`text-xs ${phone?.length >= 20 ? "text-red-500 font-bold" : "text-gray-500"}`}
            >
              {phone?.length || 0}/20
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="form-group">
          <label
            className="block text-sm font-medium text-gray-700"
            style={{ marginBottom: "5px" }}
          >
            Social Media Links
          </label>
          {socialLinks.map((link, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-2 p-4 sm:p-0 bg-gray-50 sm:bg-transparent rounded-xl sm:rounded-none border sm:border-0 border-gray-100"
            >
              <div className="w-full sm:w-48">
                <select
                  style={{ padding: "10px" }}
                  className="w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={link.contactType}
                  onChange={(e) =>
                    handleSocialLinkChange(index, "contactType", e.target.value)
                  }
                >
                  <option value="">Select contact type</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="TWITTER">Twitter</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="WEBSITE">Website</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="PHONE">Phone</option>
                  <option value="TELEGRAM">Telegram</option>
                  <option value="EMAIL">Email</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    style={{ padding: "10px" }}
                    className="w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    value={link.url}
                    onChange={(e) =>
                      handleSocialLinkChange(index, "url", e.target.value)
                    }
                    placeholder="Enter URL"
                    maxLength={250}
                  />
                  {link.url && (
                    <button
                      type="button"
                      onClick={() => handleSocialLinkChange(index, "url", "")}
                      aria-label="Clear URL"
                      title="Clear"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      style={{ padding: "4px" }}
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="flex justify-end mt-1">
                  <p
                    className={`text-[10px] ${link.url?.length >= 250 ? "text-red-500 font-bold" : "text-gray-400"}`}
                  >
                    {link.url?.length || 0}/250
                  </p>
                </div>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  style={{ marginLeft: "3px" }}
                  className="form-radio text-blue-600"
                  checked={link.isPrimary}
                  onChange={() =>
                    handleSocialLinkChange(index, "isPrimary", true)
                  }
                  name="primarySocial"
                />
                <span
                  style={{ marginLeft: "6px" }}
                  className="text-sm font-medium text-gray-700"
                >
                  <span className="sm:hidden">Set as primary</span>
                  <span className="hidden sm:inline">Primary</span>
                </span>
              </label>
            </div>
          ))}
          <button
            type="button"
            onClick={addSocialLink}
            style={{ padding: "10px", marginTop: "5px", background: "purple" }}
            className="text-sm text-white rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Add Social Link
          </button>
        </div>

        {/* Business Image Upload */}
        <div className="form-group">
          <label
            className="block text-sm font-medium text-gray-700"
            style={{ marginBottom: "5px" }}
          >
            Business Logo
          </label>
          <div className="mt-1 flex flex-col items-center">
            <div className="w-full flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-32 w-auto object-cover rounded-md"
                      width={800}
                      height={800}
                      onError={(e) => {
                        e.target.src = bnwLogo.src || bnwLogo;
                      }}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-1 hover:bg-red-600 focus:outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="businessImage"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload your business logo</span>
                        <input
                          id="businessImage"
                          name="businessImage"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1"> or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </>
                )}
              </div>
            </div>
            {errors.businessImage && (
              <p className="mt-1 text-sm text-red-600">
                {errors.businessImage.message}
              </p>
            )}
          </div>
        </div>

        {/* Checkbox for product made in Oyo State */}
        <div className="form-group">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox text-blue-600"
              {...register("madeInOyoState")}
            />
            <span style={{ marginLeft: "5px" }}>
              Does your business have a product specifically made in Oyo State?
            </span>
          </label>
        </div>

        {/* Policy warning banner */}
        <div
          style={{
            background: "#fff8e1",
            border: "1px solid #f59e0b",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "12px",
          }}
        >
          <p style={{ fontSize: "0.82rem", color: "#92400e", margin: 0 }}>
            ⚠️ <strong>Debisi Business Policy:</strong> Only register a real business with
            accurate information. Any business using fake details, impersonating another
            brand, or operating as a scam <strong>will be removed without notice</strong>.
            Continued violations may result in permanent account suspension.
          </p>
        </div>

        <button
          type="submit"
          style={{
            padding: "10px",
            background:
              "linear-gradient(to right, purple, var(--primaryColor))",
          }}
          className="w-full bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register Business"}
        </button>
      </form>
    </div>
  );
};

export default RegisterBusiness;
