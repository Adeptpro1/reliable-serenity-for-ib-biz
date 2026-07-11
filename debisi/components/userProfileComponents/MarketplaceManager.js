"use client";
import Image from "next/image";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FaPlus, FaEdit, FaTrash, FaStar } from "react-icons/fa";
import { FiTrendingUp } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@apollo/client";
import { toast } from "react-hot-toast";
import {
  GET_BUSINESS_PRODUCTS,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  BOOST_PRODUCT,
  UPLOAD_PRODUCT_IMAGE,
} from "@/graphql/queries/business/products";
import { GET_MY_WALLET } from "@/graphql/queries/user/wallet";
import { UPLOAD_IMAGE } from "@/graphql/queries/business/business";
import Modal from "../otherComponents/Modal";
import Link from "next/link";

// Helper for client-side image compression
const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

// Enums
const ProductCategory = {
  ELECTRONICS: "ELECTRONICS",
  FASHION: "FASHION",
  HOME_GARDEN: "HOME_GARDEN",
  BEAUTY_HEALTH: "BEAUTY_HEALTH",
  SPORTS_OUTDOOR: "SPORTS_OUTDOOR",
  BOOKS_MEDIA: "BOOKS_MEDIA",
  AUTOMOTIVE: "AUTOMOTIVE",
  FOOD_BEVERAGES: "FOOD_BEVERAGES",
  TOYS_GAMES: "TOYS_GAMES",
  ART_CRAFTS: "ART_CRAFTS",
  JEWELRY_ACCESSORIES: "JEWELRY_ACCESSORIES",
  PET_SUPPLIES: "PET_SUPPLIES",
  OFFICE_SUPPLIES: "OFFICE_SUPPLIES",
  MUSICAL_INSTRUMENTS: "MUSICAL_INSTRUMENTS",
  OTHER: "OTHER",
  AGRICULTURAL_PRODUCTS: "AGRICULTURAL_PRODUCTS",
  AUTOMOTIVE_PARTS_ACCESSORIES: "AUTOMOTIVE_PARTS_ACCESSORIES",
  BABY_KIDS_PRODUCTS: "BABY_KIDS_PRODUCTS",
  BEAUTY_PERSONAL_CARE: "BEAUTY_PERSONAL_CARE",
  BOOKS_STATIONERY: "BOOKS_STATIONERY",
  BUILDING_CONSTRUCTION_MATERIALS: "BUILDING_CONSTRUCTION_MATERIALS",
  CLOTHING_FASHION: "CLOTHING_FASHION",
  COMPUTERS_ACCESSORIES: "COMPUTERS_ACCESSORIES",
  FURNITURE_HOME_INTERIOR: "FURNITURE_HOME_INTERIOR",
  HEALTH_MEDICAL_SUPPLIES: "HEALTH_MEDICAL_SUPPLIES",
  HOME_APPLIANCES: "HOME_APPLIANCES",
  INDUSTRIAL_EQUIPMENT: "INDUSTRIAL_EQUIPMENT",
  JEWELRY_WATCHES: "JEWELRY_WATCHES",
  MOBILE_PHONES_ACCESSORIES: "MOBILE_PHONES_ACCESSORIES",
  OFFICE_COMMERCIAL_SUPPLIES: "OFFICE_COMMERCIAL_SUPPLIES",
  PET_PRODUCTS: "PET_PRODUCTS",
  RELIGIOUS_PRODUCTS: "RELIGIOUS_PRODUCTS",
  SPORTS_FITNESS: "SPORTS_FITNESS",
  TOOLS_HARDWARE: "TOOLS_HARDWARE",
  ARTS_CRAFTS: "ARTS_CRAFTS",
  SERVICES: "SERVICES",
  DIGITAL_PRODUCTS: "DIGITAL_PRODUCTS",
};

const DeliveryOption = {
  PICKUP_ONLY: "PICKUP_ONLY",
  DELIVERY_ONLY: "DELIVERY_ONLY",
  BOTH_OPTIONS: "BOTH_OPTIONS",
};

const ContactPreference = {
  PHONE: "PHONE",
  WHATSAPP: "WHATSAPP",
  EMAIL: "EMAIL",
  INSTAGRAM: "INSTAGRAM",
  FACEBOOK: "FACEBOOK",
  TELEGRAM: "TELEGRAM",
  WEBSITE: "WEBSITE",
};

const categoryLabels = {
  [ProductCategory.ELECTRONICS]: "Electronics",
  [ProductCategory.FASHION]: "Fashion",
  [ProductCategory.HOME_GARDEN]: "Home & Garden",
  [ProductCategory.BEAUTY_HEALTH]: "Beauty & Health",
  [ProductCategory.SPORTS_OUTDOOR]: "Sports & Outdoor",
  [ProductCategory.BOOKS_MEDIA]: "Books & Media",
  [ProductCategory.AUTOMOTIVE]: "Automotive",
  [ProductCategory.FOOD_BEVERAGES]: "Food & Beverages",
  [ProductCategory.TOYS_GAMES]: "Toys & Games",
  [ProductCategory.ART_CRAFTS]: "Art & Crafts",
  [ProductCategory.JEWELRY_ACCESSORIES]: "Jewelry & Accessories",
  [ProductCategory.PET_SUPPLIES]: "Pet Supplies",
  [ProductCategory.OFFICE_SUPPLIES]: "Office Supplies",
  [ProductCategory.MUSICAL_INSTRUMENTS]: "Musical Instruments",
  [ProductCategory.OTHER]: "Other",
  [ProductCategory.AGRICULTURAL_PRODUCTS]: "Agricultural Products",
  [ProductCategory.AUTOMOTIVE_PARTS_ACCESSORIES]: "Automotive Parts & Accessories",
  [ProductCategory.BABY_KIDS_PRODUCTS]: "Baby & Kids Products",
  [ProductCategory.BEAUTY_PERSONAL_CARE]: "Beauty & Personal Care",
  [ProductCategory.BOOKS_STATIONERY]: "Books & Stationery",
  [ProductCategory.BUILDING_CONSTRUCTION_MATERIALS]: "Building & Construction Materials",
  [ProductCategory.CLOTHING_FASHION]: "Clothing & Fashion",
  [ProductCategory.COMPUTERS_ACCESSORIES]: "Computers & Accessories",
  [ProductCategory.FURNITURE_HOME_INTERIOR]: "Furniture & Home Interior",
  [ProductCategory.HEALTH_MEDICAL_SUPPLIES]: "Health & Medical Supplies",
  [ProductCategory.HOME_APPLIANCES]: "Home Appliances",
  [ProductCategory.INDUSTRIAL_EQUIPMENT]: "Industrial Equipment",
  [ProductCategory.JEWELRY_WATCHES]: "Jewelry & Watches",
  [ProductCategory.MOBILE_PHONES_ACCESSORIES]: "Mobile Phones & Accessories",
  [ProductCategory.OFFICE_COMMERCIAL_SUPPLIES]: "Office & Commercial Supplies",
  [ProductCategory.PET_PRODUCTS]: "Pet Products",
  [ProductCategory.RELIGIOUS_PRODUCTS]: "Religious Products",
  [ProductCategory.SPORTS_FITNESS]: "Sports & Fitness",
  [ProductCategory.TOOLS_HARDWARE]: "Tools & Hardware",
  [ProductCategory.ARTS_CRAFTS]: "Arts & Crafts",
  [ProductCategory.SERVICES]: "Services",
  [ProductCategory.DIGITAL_PRODUCTS]: "Digital Products",
};

const deliveryLabels = {
  [DeliveryOption.PICKUP_ONLY]: "Pickup Only",
  [DeliveryOption.DELIVERY_ONLY]: "Delivery Only",
  [DeliveryOption.BOTH_OPTIONS]: "Both Options",
};

const contactLabels = {
  [ContactPreference.PHONE]: "Phone",
  [ContactPreference.WHATSAPP]: "WhatsApp",
  [ContactPreference.EMAIL]: "Email",
  [ContactPreference.INSTAGRAM]: "Instagram",
  [ContactPreference.FACEBOOK]: "Facebook",
  [ContactPreference.TELEGRAM]: "Telegram",
  [ContactPreference.WEBSITE]: "Website",
};

// Helper that returns a base URL/prefix for a given contact preference
const getBaseUrlForContactType = (type) => {
  switch (type) {
    case ContactPreference.FACEBOOK:
      return "https://facebook.com/";
    case ContactPreference.TWITTER:
      // Not in ContactPreference enum here, keep for parity if used elsewhere
      return "https://X.com/";
    case ContactPreference.INSTAGRAM:
      return "https://instagram.com/";
    case ContactPreference.TELEGRAM:
      return "https://t.me/";
    case ContactPreference.WHATSAPP:
      return "https://wa.me/";
    case ContactPreference.WEBSITE:
      return "https://";
    case ContactPreference.EMAIL:
      return "mailto:";
    case ContactPreference.PHONE:
      return "tel:+234";
    default:
      return "";
  }
};

const ProductImages = ({ images, title }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageUrls =
    images?.length > 0
      ? images.map((img) => img.imageUrl || img)
      : [
          "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
        ];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? imageUrls.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === imageUrls.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "200px",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <Image
        src={imageUrls[currentImageIndex]}
        alt={`${title} - Image ${currentImageIndex + 1}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        width={800}
        height={800}
        onError={(e) => {
          e.target.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop";
        }}
      />
      {imageUrls.length > 1 && (
        <>
          <button
            onClick={handlePrevImage}
            style={{
              position: "absolute",
              left: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.8)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            ←
          </button>
          <button
            onClick={handleNextImage}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.8)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            →
          </button>
        </>
      )}
    </div>
  );
};

const MarketplaceManager = ({ userData }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    lg: "",
    city: "",
    town: "",
    contact: "",
    isMadeInOyo: false,
    stock: 1,
    discount: 0,
    deliveryOption: DeliveryOption.BOTH_OPTIONS,
    category: ProductCategory.OTHER,
    contactPreference: ContactPreference.PHONE,
    imageFiles: [],
    images: [],
    isActive: true,
    business: null,
  });

  // Boost state
  const [boostProductId, setBoostProductId] = useState(null);

  // Get user's businesses from user data
  const userBusinesses = useMemo(() => userData?.businesses || user?.businesses || [], [userData?.businesses, user?.businesses]);

  // Set default business if user has businesses
  useEffect(() => {
    if (userBusinesses && userBusinesses.length > 0 && !selectedBusiness) {
      setSelectedBusiness(userBusinesses[0]);
    }
  }, [userBusinesses, selectedBusiness]);

  // Removed early return from here

  const { data, loading, refetch } = useQuery(GET_BUSINESS_PRODUCTS, {
    variables: { businessId: selectedBusiness?.id },
    skip: !selectedBusiness?.id,
    fetchPolicy: "cache-and-network",
  });

  const products = useMemo(() => data?.businessProducts || [], [data?.businessProducts]);

  const [createProduct] = useMutation(CREATE_PRODUCT, {
    onCompleted: () => {
      toast.success("Product created successfully!");
      refetch();
    },
    onError: (err) => {
      if (err.message.includes("network-request-failed") || err.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error(err.message);
      }
    },
  });

  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    onCompleted: () => {
      toast.success("Product updated successfully!");
      refetch();
    },
    onError: (err) => {
      if (err.message.includes("network-request-failed") || err.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error(err.message);
      }
    },
  });

  const [deleteProductMutation] = useMutation(DELETE_PRODUCT, {
    onCompleted: () => {
      toast.success("Product deleted successfully!");
      refetch();
    },
    onError: (err) => {
      if (err.message.includes("network-request-failed") || err.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error(err.message);
      }
    },
  });

  const [boostProductMutation] = useMutation(BOOST_PRODUCT, {
    onCompleted: () => {
      toast.success("Product boosted!");
      refetch();
    },
    onError: (err) => {
      if (err.message.includes("network-request-failed") || err.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error(err.message);
      }
    },
  });

  const [uploadImageMutation] = useMutation(UPLOAD_IMAGE);

  const isBoostActive = useMemo(() => {
    return !!(editingProduct?.isBoosted && editingProduct.boostExpiresAt && new Date(editingProduct.boostExpiresAt) > new Date());
  }, [editingProduct]);

  const { data: walletData } = useQuery(GET_MY_WALLET);
  const walletBalance = walletData?.myWallet?.balance || 0;



  // If user has no businesses, show a consistent 'No businesses found' UI
  if (!userBusinesses || userBusinesses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow" style={{ padding: "24px" }}>
        <h2 className="text-2xl font-bold" style={{ marginBottom: "8px" }}>
          Product Manager
        </h2>
        <div className="text-center" style={{ padding: "32px 0" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏢</div>
          <h3 className="text-lg font-semibold">No businesses found</h3>
          <p className="text-gray-600" style={{ margin: "8px 0 16px" }}>
            You don&apos;t have any registered businesses yet. Register a business to
            start listing products.
          </p>
          <Link href={`/dashboard/${userData?.id}`}>
            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "linear-gradient(to right, purple, #D22730)",
                background: "linear-gradient(to right, purple, #D22730)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Register Business
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Helper function to get primary image (same as marketplace page)
  const getPrimaryImage = (images) => {
    const primary = images?.find((img) => img.isPrimary);
    return (
      primary?.imageUrl ||
      images?.[0]?.imageUrl ||
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop"
    );
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBusiness) {
      toast.error("Please select a business first");
      return;
    }

    // Validate required images
    if (productForm.images.length === 0) {
      toast.error("Please add at least one product image");
      return;
    }

    // Validate maximum of 3 images
    if (productForm.images.length > 3) {
      toast.error("You can only upload a maximum of 3 images for a product");
      return;
    }

    // Ensure at least one primary image
    if (!productForm.images.some((img) => img.isPrimary)) {
      toast.error("Please set a primary image");
      return;
    }

    // Price validation
    if (
      isNaN(parseFloat(productForm.price)) ||
      parseFloat(productForm.price) <= 0
    ) {
      toast.error("Please enter a valid price greater than 0");
      return;
    }

    const loadingToast = toast.loading(editingProduct ? "Updating product..." : "Creating product...");

    try {
      // 1. Process and compress images, then upload
      const finalImageUrls = [];
      for (const img of productForm.images) {
        if (img.file) {
          // This is a new file that needs to be compressed and uploaded
          try {
            const compressed = await compressImage(img.file);
            const { data: uploadData } = await uploadImageMutation({
              variables: { file: compressed },
            });
            if (uploadData?.uploadImage) {
              finalImageUrls.push({
                url: uploadData.uploadImage,
                isPrimary: img.isPrimary,
              });
            }
          } catch (uploadErr) {
            console.error("Image upload error:", uploadErr);
            toast.error(`Failed to upload image`);
            toast.dismiss(loadingToast);
            return;
          }
        } else if (img.imageUrl) {
          // Keep existing image URL
          finalImageUrls.push({
            url: img.imageUrl,
            isPrimary: img.isPrimary,
          });
        }
      }

      // Sort images so primary is at index 0 (which the backend requires to make it primary)
      finalImageUrls.sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return 0;
      });

      const imageUrlStrings = finalImageUrls.map(img => img.url);

      const productInput = {
        title: productForm.title,
        description: productForm.description,
        price: parseFloat(productForm.price),
        location: productForm.location,
        isMadeInOyo: productForm.isMadeInOyo,
        stock: parseInt(productForm.stock),
        discount: parseFloat(productForm.discount) || 0,
        deliveryOption: productForm.deliveryOption,
        category: productForm.category,
        contactPreference: productForm.contactPreference,
        images: imageUrlStrings,
      };

      // isActive is only valid on UpdateProductInput, not CreateProductInput
      const createInput = { ...productInput, businessId: selectedBusiness.id };
      let updateInput = { ...productInput, isActive: productForm.isActive };

      if (isBoostActive) {
        // Omit locked fields when updating a boosted product to prevent backend validation errors
        delete updateInput.title;
        delete updateInput.category;
        delete updateInput.images;
      }

      if (editingProduct) {
        await updateProduct({
          variables: { id: editingProduct.id, input: updateInput },
        });
      } else {
        await createProduct({
          variables: { input: createInput },
        });
      }

      toast.dismiss(loadingToast);
      setShowProductForm(false);
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      toast.dismiss(loadingToast);
      if (error.message.includes("network-request-failed") || error.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error(error.message || "An error occurred");
      }
    }
  };

  const handleDeleteProduct = async (product) => {
    const isBoostActive = product.isBoosted && product.boostExpiresAt && new Date(product.boostExpiresAt) > new Date();
    const confirmMessage = isBoostActive
      ? "⚠️ Warning: This product has an ACTIVE boost. Deleting it will terminate the boost immediately with no refund. Are you sure you want to delete this product?"
      : "Are you sure you want to delete this product?";

    if (window.confirm(confirmMessage)) {
      try {
        await deleteProductMutation({ variables: { id: product.id } });
      } catch (error) {
        if (error.message.includes("network-request-failed") || error.message.includes("Failed to fetch")) {
          toast.error("Network Error: Please check your connection");
        } else {
          toast.error(error.message || "An error occurred");
        }
      }
    }
  };

  const handleBoostProduct = async (productId, days, tier) => {
    const COSTS = { TOWN: 100, CITY: 200, STATE: 300 };
    const cost = days * (COSTS[tier] || 100);
    if (walletBalance < cost) {
      toast.error(`Insufficient balance. Need ₦${cost.toLocaleString()}, have ₦${walletBalance.toLocaleString()}`);
      return;
    }
    try {
      await boostProductMutation({ variables: { productId, days, tier } });
      setBoostProductId(null);
    } catch (_) {}
  };

  const handleToggleBoost = async (productId) => {
    // Kept for backwards compat, opens tier modal instead
    setBoostProductId(productId);
  };

  const resetForm = () => {
    setProductForm({
      title: "",
      description: "",
      price: "",
      location: "",
      isMadeInOyo: false,
      stock: 1,
      discount: 0,
      deliveryOption: DeliveryOption.BOTH_OPTIONS,
      category: ProductCategory.OTHER,
      contactPreference: ContactPreference.PHONE,
      imageFiles: [],
      images: [],
      isActive: true,
      business: null,
    });
  };

  const handleEditProduct = (product) => {
    // Split location into parts
    const [lg = "", city = "", town = ""] = product.location.split(", ");

    setEditingProduct(product);
    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      location: product.location,
      lg,
      city,
      town,
      isMadeInOyo: product.isMadeInOyo,
      stock: product.stock,
      discount: product.discount || 0,
      deliveryOption: product.deliveryOption,
      imageFiles: [],
      images: product.images || [],
      isActive: product.isActive,
      business: product.business,
      category: product.category,
      contact: product.contact || "",
      contactPreference: product.contactPreference || ContactPreference.PHONE,
    });
    setShowProductForm(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div
        className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2
              className="text-xl sm:text-2xl font-bold text-gray-900"
              style={{ marginBottom: "4px" }}
            >
              Product Manager
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">Manage your products here.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              value={selectedBusiness?.id || ""}
              onChange={(e) => {
                const business = userBusinesses.find(
                  (b) => b.id === e.target.value,
                );
                setSelectedBusiness(business);
              }}
              className="w-full sm:w-auto border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              style={{ padding: "8px 12px" }}
            >
              {userBusinesses.length === 0 ? (
                <option value="">No businesses available</option>
              ) : (
                userBusinesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))
              )}
            </select>
            {selectedBusiness?.isVerified ? (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  resetForm();
                  setShowProductForm(true);
                }}
                className="w-full sm:w-auto text-white rounded-lg hover:bg-blue-700 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 text-sm font-semibold"
                style={{
                  padding: "8px 16px",
                  background: "linear-gradient(90deg, purple 0%, #d22730 100%)",
                }}
              >
                <FaPlus style={{ marginRight: "8px" }} />
                Add Product
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <nav className="flex gap-4 md:gap-8 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab("products")}
            className={`border-b-2 font-medium text-sm transition-all duration-200 ${
              activeTab === "products"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            style={{ padding: "16px 8px" }}
          >
            Products ({products.length})
          </button>
          {/* Ads tab removed */}
        </nav>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 md:p-8">
        {!selectedBusiness?.isVerified && selectedBusiness && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">⚠️</span>
              <div>
                <h4 className="font-bold text-amber-800 text-base">Verification Required</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Only verified businesses can list products and use boosting features in the marketplace. Please verify your business profile.
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/${userData?.id || user?.id}?tab=verification&businessId=${selectedBusiness.id}`}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition-all whitespace-nowrap text-center"
            >
              Verify Business Now
            </Link>
          </div>
        )}
        {activeTab === "products" && (
          <div>
            {loading ? (
              <div className="text-center" style={{ padding: "32px 0" }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600" style={{ marginTop: "8px" }}>
                  Loading products...
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center" style={{ padding: "32px 0" }}>
                <p className="text-gray-600">
                  {selectedBusiness?.isVerified 
                    ? "No products found. Add your first product to get started!" 
                    : "No products found."}
                </p>
                {selectedBusiness?.isVerified && (
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      resetForm();
                      setShowProductForm(true);
                    }}
                    className="text-white rounded hover:bg-blue-700"
                    style={{
                      padding: "8px 16px",
                      background:
                        "linear-gradient(90deg, purple 0%, #d22730 100%)",
                    }}
                  >
                    Add Product
                  </button>
                )}
              </div>
            ) : (
              <div>
                {userBusinesses.length === 0 && (
                  <div
                    className="bg-yellow-50 border border-yellow-200 rounded-lg"
                    style={{ marginBottom: "16px", padding: "16px" }}
                  >
                    <p className="text-yellow-800 text-sm">
                      Register a business to manage real products.
                    </p>
                  </div>
                )}

                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                >
                  {userBusinesses.length > 0 &&
                    products.map((product) => (
                      <div
                        key={product.id}
                        className="relative border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white p-4 sm:p-6"
                      >
                        {product.isBoosted && (
                          <div
                            style={{
                              position: "absolute",
                              top: "12px",
                              left: "12px",
                              zIndex: 10,
                              background: "linear-gradient(45deg, #f59e0b, #d97706)",
                              color: "white",
                              padding: "4px 8px",
                              borderRadius: "20px",
                              fontSize: "0.65rem",
                              fontWeight: "bold",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                            }}
                          >
                            ⭐ Boosted
                          </div>
                        )}
                        <div
                          className="flex justify-between items-start"
                          style={{ marginBottom: "16px" }}
                        >
                          <h3
                            className="font-semibold text-lg text-gray-900"
                            style={{ paddingRight: "8px" }}
                          >
                            {product.title}
                          </h3>
                          {/* action buttons moved below to improve layout */}
                        </div>
                        <div style={{ marginBottom: "16px" }}>
                          <ProductImages
                            images={product.images}
                            title={product.title}
                          />
                        </div>{" "}
                        <p
                          className="text-gray-600 text-sm line-clamp-2 leading-relaxed"
                          style={{ marginBottom: "16px" }}
                        >
                          {product.description}
                        </p>
                        <div
                          className="flex justify-between items-center"
                          style={{ marginBottom: "16px" }}
                        >
                          <span className="font-bold text-xl text-gray-900">
                            ₦{product.price.toLocaleString()}
                          </span>
                          {product.discount > 0 && (
                            <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
                              -{product.discount}%
                            </span>
                          )}
                        </div>
                        <div
                          className="text-xs text-gray-500"
                          style={{
                            gap: "8px",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <div className="flex justify-between">
                            <span>Category:</span>
                            <span className="font-medium">
                              {categoryLabels[product.category]}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span className="font-medium">
                              {product.location}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Stock:</span>
                            <span className="font-medium">{product.stock}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery:</span>
                            <span className="font-medium">
                              {deliveryLabels[product.deliveryOption]}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Contact:</span>
                            <span className="font-medium">
                              {contactLabels[product.contactPreference]}
                            </span>
                          </div>
                          {product.isMadeInOyo && (
                            <div style={{ marginTop: "12px" }}>
                              <span
                                className="inline-block bg-green-100 text-green-800 rounded-full text-xs font-medium"
                                style={{ padding: "4px 12px" }}
                              >
                                Made in Oyo
                              </span>
                            </div>
                          )}
                          <div
                            className="flex items-center justify-between border-t border-gray-100"
                            style={{ paddingTop: "8px" }}
                          >
                            <span
                              className={`font-medium ${
                                product.isActive
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </span>
                            {product.isBoosted && (
                              <span className="text-yellow-600 flex items-center font-medium">
                                <FaStar style={{ marginRight: "4px" }} />
                                Boosted
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Action button group */}
                        <div className="grid grid-cols-3 gap-2 mt-4">
                          {/* Boost button */}
                          <button
                            onClick={() => {
                              if (selectedBusiness?.isVerified) {
                                setBoostProductId(product.id);
                              } else {
                                toast.error("Verification required to boost products");
                              }
                            }}
                            style={{ padding: "8px 4px" }}
                            className={`inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-shadow focus:outline-none ${
                              product.isBoosted
                                ? "bg-yellow-50 border border-yellow-300 text-yellow-700 shadow-sm"
                                : "bg-white border border-gray-200 text-gray-700 hover:shadow"
                            }`}
                          >
                            <FiTrendingUp className="text-sm flex-shrink-0" />
                            <span className="text-xs font-semibold truncate">
                              {product.isBoosted
                                ? (product.boostTier ? `${product.boostTier}` : "Boosted")
                                : "Boost"}
                            </span>
                          </button>

                          <button
                            onClick={() => handleEditProduct(product)}
                            style={{ padding: "8px 4px" }}
                            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-shadow focus:outline-none"
                          >
                            <FaEdit className="text-sm flex-shrink-0" />
                            <span className="text-xs font-semibold">Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(product)}
                            style={{ padding: "8px 4px" }}
                            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-shadow focus:outline-none"
                          >
                            <FaTrash className="text-sm flex-shrink-0" />
                            <span className="text-xs font-semibold">Delete</span>
                          </button>
                        </div>
                        {/* Product Analytics */}
                        <div className="productAnalysis">
                          <div>
                            <span style={{ color: "#d22730" }}>
                              Analytics:{" "}
                            </span>
                            <span> Views: {product.productViews} | </span>
                            <span> Clicks: {product.productClicks} </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Boost Tier Modal Portal */}
      <AnimatePresence>
        {boostProductId && (
          <ProductBoostTierModal
            walletBalance={walletBalance}
            onBoost={(days, tier) => handleBoostProduct(boostProductId, days, tier)}
            onClose={() => setBoostProductId(null)}
          />
        )}
      </AnimatePresence>

      {/* Product Form Modal */}
      {showProductForm && (
        <Modal
          title={editingProduct ? "Edit Product" : "Add New Product"}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
            resetForm();
          }}
        >
          <form
            onSubmit={handleProductSubmit}
            style={{ gap: "16px", display: "flex", flexDirection: "column" }}
          >
            {isBoostActive && (
              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fef3c7",
                  color: "#78350f",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                ⚠️ This product is currently boosted. Editing the title, category, and images is locked to preserve listing integrity.
              </div>
            )}

            <div
              className="grid grid-cols-1 md:grid-cols-2"
              style={{ gap: "16px" }}
            >
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  style={{ marginBottom: "4px" }}
                >
                  Product Title *
                </label>
                <input
                  type="text"
                  value={productForm.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProductForm((prev) => ({ ...prev, title: val }));
                  }}
                  className="w-full border border-gray-300 rounded"
                  style={{ padding: "8px 12px" }}
                  required
                  disabled={isBoostActive}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  style={{ marginBottom: "4px" }}
                >
                  Category *
                </label>
                <select
                  value={productForm.category}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProductForm((prev) => ({ ...prev, category: val }));
                  }}
                  className="w-full border border-gray-300 rounded"
                  style={{ padding: "8px 12px" }}
                  required
                  disabled={isBoostActive}
                >
                  {Object.entries(categoryLabels)
                    .sort((a, b) => a[1].localeCompare(b[1]))
                    .map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "4px" }}
              >
                Price (₦) *
              </label>
              <input
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => {
                  const val = e.target.value;
                  setProductForm((prev) => ({ ...prev, price: val }));
                }}
                className="w-full border border-gray-300 rounded"
                style={{ padding: "8px 12px" }}
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "4px" }}
              >
                Discount (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={productForm.discount}
                onChange={(e) => {
                  const val = e.target.value;
                  setProductForm((prev) => ({ ...prev, discount: val }));
                }}
                className="w-full border border-gray-300 rounded"
                style={{ padding: "8px 12px" }}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "4px" }}
              >
                Location Details *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <select
                    value={productForm.lg || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProductForm((prev) => ({
                        ...prev,
                        lg: val,
                        location: [val, prev.city, prev.town]
                          .filter(Boolean)
                          .join(", "),
                      }));
                    }}
                    className="w-full border border-gray-300 rounded"
                    style={{ padding: "8px 12px" }}
                    required
                    disabled={isBoostActive}
                  >
                    <option value="">Select LGA</option>
                    {[
                      "Afijio",
                      "Akinyele",
                      "Atiba",
                      "Atisbo",
                      "Egbeda",
                      "Ibadan North",
                      "Ibadan North-East",
                      "Ibadan North-West",
                      "Ibadan South-East",
                      "Ibadan South-West",
                      "Ibarapa Central",
                      "Ibarapa East",
                      "Ibarapa North",
                      "Ido",
                      "Irepo",
                      "Iseyin",
                      "Itesiwaju",
                      "Iwajowa",
                      "Kajola",
                      "Lagelu",
                      "Ogbomosho North",
                      "Ogbomosho South",
                      "Ogo Oluwa",
                      "Olorunsogo",
                      "Oluyole",
                      "Ona Ara",
                      "Orelope",
                      "Ori Ire",
                      "Oyo East",
                      "Oyo West",
                      "Saki East",
                      "Saki West",
                      "Surulere",
                    ].map((lg) => (
                      <option key={lg} value={lg}>
                        {lg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    value={productForm.city || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProductForm((prev) => ({
                        ...prev,
                        city: val,
                        location: [prev.lg, val, prev.town]
                          .filter(Boolean)
                          .join(", "),
                      }));
                    }}
                    placeholder="City/Area (e.g., Mokola)"
                    className="w-full border border-gray-300 rounded"
                    style={{ padding: "8px 12px" }}
                    required
                    disabled={isBoostActive}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={productForm.town || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProductForm((prev) => ({
                        ...prev,
                        town: val,
                        location: [prev.lg, prev.city, val]
                          .filter(Boolean)
                          .join(", "),
                      }));
                    }}
                    placeholder="Street/Town"
                    className="w-full border border-gray-300 rounded"
                    style={{ padding: "8px 12px" }}
                    required
                    disabled={isBoostActive}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the Local Government Area, City/Area, and specific
                Street/Town
              </p>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "4px" }}
              >
                Stock Quantity *
              </label>
              <input
                type="number"
                value={productForm.stock}
                onChange={(e) => {
                  const val = e.target.value;
                  setProductForm((prev) => ({ ...prev, stock: val }));
                }}
                className="w-full border border-gray-300 rounded"
                style={{ padding: "8px 12px" }}
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "4px" }}
              >
                Delivery Option *
              </label>
              <select
                value={productForm.deliveryOption}
                onChange={(e) => {
                  const val = e.target.value;
                  setProductForm((prev) => ({ ...prev, deliveryOption: val }));
                }}
                className="w-full border border-gray-300 rounded"
                style={{ padding: "8px 12px" }}
                required
              >
                {Object.entries(deliveryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "4px" }}
              >
                Contact Preference *
              </label>
              <select
                value={productForm.contactPreference || ContactPreference.PHONE}
                onChange={(e) => {
                  const newPref = e.target.value;
                  setProductForm((prev) => {
                    const base = getBaseUrlForContactType(newPref);
                    const previousBase = getBaseUrlForContactType(
                      prev.contactPreference,
                    );
                    const currentContact = prev.contact || "";
                    const shouldPrefill =
                      !currentContact ||
                      (previousBase && currentContact === previousBase);

                    return {
                      ...prev,
                      contactPreference: newPref,
                      contact: shouldPrefill ? base : currentContact,
                    };
                  });
                }}
                className="w-full border border-gray-300 rounded"
                style={{ padding: "8px 12px" }}
                required
                disabled={isBoostActive}
              >
                {Object.entries(contactLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "4px" }}
              >
                Contact
              </label>
              <div className="relative">
                 <input
                  type="text"
                  value={productForm.contact || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProductForm((prev) => ({ ...prev, contact: val }));
                  }}
                  className="w-full border border-gray-300 rounded pr-8"
                  style={{ padding: "8px 12px" }}
                  required
                  disabled={isBoostActive}
                />
                {productForm.contact && !isBoostActive && (
                  <button
                    type="button"
                    onClick={() =>
                      setProductForm((prev) => ({ ...prev, contact: "" }))
                    }
                    aria-label="Clear contact"
                    title="Clear"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    style={{ padding: "4px" }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "4px" }}
              >
                Product Images
              </label>
              <div className="mt-1 flex flex-col gap-4">
                {productForm.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {productForm.images.map((img, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={img.imageUrl || (img.file ? URL.createObjectURL(img.file) : "/debisi_logo.png")}
                          alt={`Product image ${index + 1}`}
                          className="h-24 w-full object-cover rounded"
                          width={800}
                          height={800}
                        />
                        {!isBoostActive && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                const idx = index;
                                setProductForm((prev) => {
                                  const newImages = [...prev.images];
                                  newImages.splice(idx, 1);
                                  return { ...prev, images: newImages };
                                });
                              }}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1 hover:bg-red-600"
                              style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}
                            >
                              ×
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const idx = index;
                                setProductForm((prev) => ({
                                  ...prev,
                                  images: prev.images.map((image, i) => ({
                                    ...image,
                                    isPrimary: i === idx,
                                  })),
                                }));
                              }}
                              className={`absolute bottom-0 right-0 ${
                                img.isPrimary ? "bg-yellow-500" : "bg-gray-500"
                              } text-white rounded-full p-1 m-1 hover:opacity-75`}
                              style={{ border: "none", cursor: "pointer" }}
                              title={
                                img.isPrimary ? "Primary Image" : "Make Primary"
                              }
                            >
                              ★
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {!isBoostActive && (
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      const newImages = files.map((file) => ({
                        file,
                        isPrimary: false,
                      }));
                      setProductForm((prev) => {
                        const allowedCount = 3 - prev.images.length;
                        if (allowedCount <= 0) {
                          toast.error("You can only upload a maximum of 3 images for a product.");
                          return prev;
                        }
                        let finalNewImages = newImages;
                        if (newImages.length > allowedCount) {
                          toast.error("You can only upload a maximum of 3 images. Extra files were ignored.");
                          finalNewImages = newImages.slice(0, allowedCount);
                        }
                        const updatedImages = [...prev.images, ...finalNewImages];
                        if (!prev.images.some((img) => img.isPrimary) && finalNewImages.length > 0) {
                          updatedImages[0].isPrimary = true;
                        }
                        return { ...prev, images: updatedImages };
                      });
                    }}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                  />
                )}
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "4px" }}
              >
                Description *
              </label>
              <textarea
                value={productForm.description}
                onChange={(e) => {
                  const val = e.target.value;
                  setProductForm((prev) => ({ ...prev, description: val }));
                }}
                rows="4"
                className="w-full border border-gray-300 rounded"
                style={{ padding: "8px 12px" }}
                required
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isMadeInOyo"
                    checked={productForm.isMadeInOyo}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setProductForm((prev) => ({ ...prev, isMadeInOyo: val }));
                    }}
                    style={{ marginRight: "8px" }}
                  />
                  <label
                    htmlFor="isMadeInOyo"
                    className="text-sm text-gray-700"
                  >
                    Made in Oyo State
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={productForm.isActive}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setProductForm((prev) => ({ ...prev, isActive: val }));
                    }}
                    style={{ marginRight: "8px" }}
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Product Active
                  </label>
                </div>
              </div>

              {selectedBusiness && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Business</p>
                  <p className="text-base font-medium text-gray-900">
                    {selectedBusiness.name}
                  </p>
                </div>
              )}
            </div>

            <div
              className="flex flex-col-reverse sm:flex-row justify-end"
              style={{ gap: "12px", paddingTop: "16px" }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="w-full sm:w-auto border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm font-medium"
                style={{ padding: "10px 16px" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto text-white rounded hover:bg-blue-700 text-sm font-semibold flex justify-center items-center"
                style={{
                  padding: "10px 16px",
                  background: "linear-gradient(90deg, purple 0%, #d22730 100%)",
                }}
              >
                {editingProduct ? "Update Product" : "Create Product"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MarketplaceManager;

// \u2500\u2500\u2500 Product Boost Tier Modal \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const PRODUCT_BOOST_TIERS = [
  {
    id: "TOWN",
    label: "Town Boost",
    emoji: "\ud83d\udccd",
    scope: "Your town only",
    reach: "1k \u2013 5k viewers",
    costPerDay: 100,
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.08)",
    border: "rgba(245, 158, 11, 0.25)",
  },
  {
    id: "CITY",
    label: "City Boost",
    emoji: "\ud83c\udfd9\ufe0f",
    scope: "City-wide",
    reach: "5k \u2013 20k viewers",
    costPerDay: 200,
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.08)",
    border: "rgba(59, 130, 246, 0.25)",
  },
  {
    id: "STATE",
    label: "State Boost",
    emoji: "\ud83c\udf0d",
    scope: "State-wide",
    reach: "20k \u2013 100k viewers",
    costPerDay: 300,
    color: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.08)",
    border: "rgba(139, 92, 246, 0.25)",
  },
];

const ProductBoostTierModal = ({ walletBalance, onBoost, onClose }) => {
  const [selectedTier, setSelectedTier] = useState(null);
  const [days, setDays] = useState(3);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const tier = PRODUCT_BOOST_TIERS.find((t) => t.id === selectedTier);
  const totalCost = tier ? days * tier.costPerDay : 0;
  const canAfford = walletBalance >= totalCost;

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 999999,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        style={{
          background: "white", borderRadius: "24px", padding: "28px",
          maxWidth: "420px", width: "100%",
          boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: 0 }}>
            🚀 Boost Your Product
          </h3>
          <p style={{ fontSize: "12px", color: "#94a3b8", margin: "6px 0 0" }}>
            Choose your reach and duration. Wallet:{" "}
            <strong style={{ color: canAfford ? "#16a34a" : "#dc2626" }}>
              ₦{walletBalance.toLocaleString()}
            </strong>
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
          {PRODUCT_BOOST_TIERS.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTier(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "14px 16px", borderRadius: "14px",
                border: `2px solid ${selectedTier === t.id ? t.color : "#f1f5f9"}`,
                background: selectedTier === t.id ? t.bg : "#f8fafc",
                cursor: "pointer", textAlign: "left", transition: "all 0.18s",
              }}
            >
              <span style={{ fontSize: "24px" }}>{t.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: "800", color: selectedTier === t.id ? t.color : "#334155" }}>
                    {t.label}
                  </span>
                  <span style={{
                    fontSize: "11px", fontWeight: "800", color: t.color,
                    background: t.bg, border: `1px solid ${t.border}`,
                    borderRadius: "20px", padding: "2px 10px",
                  }}>
                    ₦{t.costPerDay}/day
                  </span>
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>📡 {t.scope}</span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>👥 {t.reach}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedTier && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: "#f8fafc", borderRadius: "14px", padding: "16px", marginBottom: "16px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Duration
              </span>
              <span style={{ fontSize: "18px", fontWeight: "900", color: canAfford ? tier.color : "#dc2626" }}>
                ₦{totalCost.toLocaleString()}
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[1, 3, 7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  style={{
                    padding: "7px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: "700",
                    border: `2px solid ${days === d ? tier.color : "#e2e8f0"}`,
                    background: days === d ? tier.bg : "white",
                    color: days === d ? tier.color : "#64748b",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {d}d
                </button>
              ))}
            </div>
            {!canAfford && (
              <p style={{ fontSize: "11px", color: "#dc2626", marginTop: "10px", fontWeight: "600" }}>
                ⚠️ Insufficient balance. Fund your wallet first.
              </p>
            )}
          </motion.div>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            disabled={!selectedTier || !canAfford}
            onClick={() => { onBoost(days, selectedTier); onClose(); }}
            style={{
              flex: 1, padding: "13px", borderRadius: "12px", border: "none",
              background: selectedTier && canAfford
                ? `linear-gradient(135deg, ${tier?.color}, ${tier?.color}cc)`
                : "#e2e8f0",
              color: selectedTier && canAfford ? "white" : "#94a3b8",
              fontWeight: "800", fontSize: "13px",
              cursor: selectedTier && canAfford ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            {!selectedTier
              ? "Select a Tier"
              : !canAfford
              ? "Insufficient Balance"
              : `Boost for ₦${totalCost.toLocaleString()}`}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "13px 16px", borderRadius: "12px", border: "2px solid #e2e8f0",
              background: "white", color: "#64748b", fontWeight: "700", fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};
