"use client";
import Image from "next/image";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { FaPlus, FaEdit, FaTrash, FaStar } from "react-icons/fa";
import { useQuery, useMutation } from "@apollo/client";
import { toast } from "react-hot-toast";
import {
  GET_BUSINESS_PRODUCTS,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  TOGGLE_PRODUCT_BOOST,
  UPLOAD_PRODUCT_IMAGE,
} from "@/api/queries/business/products";
import Modal from "../otherComponents/Modal";
import Link from "next/link";

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
    imageFiles: [],
    images: [],
    isActive: true,
    business: null,
  });

  // Helper for date formatting
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().slice(0, 10);
  };

  // Boost modal state (must be inside component body)
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [boostProduct, setBoostProduct] = useState(null);
  const [boostStartDate, setBoostStartDate] = useState(formatDate(new Date()));
  const [boostDays, setBoostDays] = useState(1);
  const [boostAmount, setBoostAmount] = useState(1000); // default for 1 day

  // Calculate end date
  const boostEndDate = (() => {
    if (!boostStartDate || !boostDays) return "";
    const start = new Date(boostStartDate);
    start.setDate(start.getDate() + Number(boostDays));
    return formatDate(start);
  })();

  // Open Boost modal
  const openBoostModal = (product) => {
    setBoostProduct(product);
    setBoostStartDate(formatDate(new Date()));
    setBoostDays(1);
    setBoostAmount(1000);
    setShowBoostModal(true);
  };

  // Handle Boost proceed
  const handleBoostProceed = (e) => {
    e.preventDefault();
    // Here you would trigger boost logic (API, etc.)
    toast.success("Boost request submitted!");
    setShowBoostModal(false);
    setBoostProduct(null);
  };

  // Update amount when days change
  useEffect(() => {
    const d = Number(boostDays) || 1;
    let amt = 1000;
    if (d === 1) amt = 1000;
    else if (d === 3) amt = 2500;
    else if (d === 7) amt = 5000;
    else amt = Math.round((d / 7) * 5000);
    setBoostAmount(amt);
  }, [boostDays]);

  // Get user's businesses from user data
  const userBusinesses = user?.businesses || [];

  // Set default business if user has businesses
  useEffect(() => {
    if (userBusinesses && userBusinesses.length > 0 && !selectedBusiness) {
      setSelectedBusiness(userBusinesses[0]);
    }
  }, [userBusinesses, selectedBusiness]);

  // Removed early return from here

  const [products, setProducts] = useState([]);

  const { data, loading, refetch } = useQuery(GET_BUSINESS_PRODUCTS, {
    variables: { businessId: selectedBusiness?.id },
    skip: !selectedBusiness?.id,
    fetchPolicy: "network-only",
    onCompleted: (data) => setProducts(data.businessProducts || []),
  });

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

  const [toggleBoostMutation] = useMutation(TOGGLE_PRODUCT_BOOST, {
    onCompleted: () => {
      toast.success("Product boost status updated!");
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

  // Debug: Log products state changes
  useEffect(() => {
    // console.log("Products state updated:", products);
  }, [products]);

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

    try {
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
        isActive: productForm.isActive,
      };

      if (editingProduct) {
        updateProduct({
          variables: { id: editingProduct.id, input: productInput },
        });
      } else {
        createProduct({
          variables: { businessId: selectedBusiness.id, input: productInput },
        });
      }

      setShowProductForm(false);
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      if (error.message.includes("network-request-failed") || error.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error(error.message || "An error occurred");
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        deleteProductMutation({ variables: { id: productId } });
      } catch (error) {
        if (error.message.includes("network-request-failed") || error.message.includes("Failed to fetch")) {
          toast.error("Network Error: Please check your connection");
        } else {
          toast.error(error.message || "An error occurred");
        }
      }
    }
  };

  const handleToggleBoost = async (productId) => {
    try {
      toggleBoostMutation({ variables: { id: productId } });
    } catch (error) {
      if (error.message.includes("network-request-failed") || error.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error(error.message || "An error occurred");
      }
    }
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
    });
    setShowProductForm(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div
        className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50"
        style={{ padding: "24px" }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2
              className="text-2xl font-bold text-gray-900"
              style={{ marginBottom: "4px" }}
            >
              Product Manager
            </h2>
            <p className="text-sm text-gray-600">Manage your products here.</p>
          </div>
          <div className="flex" style={{ gap: "12px" }}>
            <select
              value={selectedBusiness?.id || ""}
              onChange={(e) => {
                const business = userBusinesses.find(
                  (b) => b.id === e.target.value,
                );
                setSelectedBusiness(business);
              }}
              className="border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ padding: "8px 16px" }}
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
            <button
              onClick={() => {
                setEditingProduct(null);
                resetForm();
                setShowProductForm(true);
              }}
              className="text-white rounded-lg hover:bg-blue-700 flex items-center shadow-md hover:shadow-lg transition-all duration-200"
              style={{
                padding: "8px 24px",
                background: "linear-gradient(90deg, purple 0%, #d22730 100%)",
              }}
            >
              <FaPlus style={{ marginRight: "8px" }} />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <nav className="flex" style={{ gap: "32px", padding: "0 24px" }}>
          <button
            onClick={() => setActiveTab("products")}
            className={`border-b-2 font-medium text-sm transition-all duration-200 ${
              activeTab === "products"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            style={{ padding: "16px 12px" }}
          >
            Products ({products.length})
          </button>
          {/* Ads tab removed */}
        </nav>
      </div>

      {/* Content */}
      <div style={{ padding: "32px" }}>
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
                  No products found. Add your first product to get started!
                </p>
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
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  style={{ gap: "32px" }}
                >
                  {userBusinesses.length > 0 &&
                    products.map((product) => (
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
                        style={{ padding: "24px" }}
                      >
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
                        <div
                          className="flex items-center gap-3"
                          style={{ marginTop: "16px" }}
                        >
                          <button
                            onClick={() => openBoostModal(product)}
                            style={{ padding: "8px 6px" }}
                            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-md font-medium transition-shadow focus:outline-none ${
                              product.isBoosted
                                ? "bg-yellow-50 border border-yellow-300 text-yellow-700 shadow-sm"
                                : "bg-white border border-gray-200 text-gray-700 hover:shadow"
                            }`}
                          >
                            <FaStar />
                            <span className="text-sm">
                              {product.isBoosted ? "Boosted" : "Boost"}
                            </span>
                          </button>

                          {/* Boost Modal */}
                          {showBoostModal && boostProduct && (
                            <Modal
                              title={"Boost Product"}
                              onClose={() => setShowBoostModal(false)}
                            >
                              <form
                                onSubmit={handleBoostProceed}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "20px",
                                  minWidth: "320px",
                                }}
                              >
                                <div>
                                  <label
                                    className="block text-sm font-medium text-gray-700"
                                    style={{ marginBottom: "4px" }}
                                  >
                                    Product Name
                                  </label>
                                  <input
                                    type="text"
                                    value={boostProduct.title}
                                    disabled
                                    className="w-full border border-gray-300 rounded bg-gray-100"
                                    style={{ padding: "8px 12px" }}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label
                                      className="block text-sm font-medium text-gray-700"
                                      style={{ marginBottom: "4px" }}
                                    >
                                      Start Date
                                    </label>
                                    <input
                                      type="date"
                                      value={boostStartDate}
                                      onChange={(e) =>
                                        setBoostStartDate(e.target.value)
                                      }
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
                                      Days
                                    </label>
                                    <select
                                      value={boostDays}
                                      onChange={(e) =>
                                        setBoostDays(Number(e.target.value))
                                      }
                                      className="w-full border border-gray-300 rounded"
                                      style={{ padding: "8px 12px" }}
                                      required
                                    >
                                      <option value={1}>1 day</option>
                                      <option value={3}>3 days</option>
                                      <option value={7}>7 days</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <label
                                    className="block text-sm font-medium text-gray-700"
                                    style={{ marginBottom: "4px" }}
                                  >
                                    End Date
                                  </label>
                                  <input
                                    type="date"
                                    value={boostEndDate}
                                    disabled
                                    className="w-full border border-gray-300 rounded bg-gray-100"
                                    style={{ padding: "8px 12px" }}
                                  />
                                </div>
                                <div>
                                  <label
                                    className="block text-sm font-medium text-gray-700"
                                    style={{ marginBottom: "4px" }}
                                  >
                                    Amount
                                  </label>
                                  <input
                                    type="text"
                                    value={`₦${boostAmount.toLocaleString()}`}
                                    disabled
                                    className="w-full border border-gray-300 rounded bg-gray-100 font-bold text-lg text-purple-700"
                                    style={{ padding: "8px 12px" }}
                                  />
                                </div>
                                <button
                                  type="submit"
                                  className="w-full py-3 rounded-md font-bold text-white"
                                  style={{
                                    background:
                                      "linear-gradient(90deg, purple 0%, #d22730 100%)",
                                    marginTop: "12px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                    fontSize: "1rem",
                                    letterSpacing: "0.02em",
                                    padding: "12px 0",
                                  }}
                                >
                                  Proceed to Boost
                                </button>
                              </form>
                            </Modal>
                          )}

                          <button
                            onClick={() => handleEditProduct(product)}
                            style={{ padding: "8px 6px" }}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-shadow focus:outline-none"
                          >
                            <FaEdit />
                            <span className="text-sm">Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            style={{ padding: "8px 6px" }}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-shadow focus:outline-none"
                          >
                            <FaTrash />
                            <span className="text-sm">Delete</span>
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
                  onChange={(e) =>
                    setProductForm({ ...productForm, title: e.target.value })
                  }
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
                  Category *
                </label>
                <select
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded"
                  style={{ padding: "8px 12px" }}
                  required
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
                onChange={(e) =>
                  setProductForm({ ...productForm, price: e.target.value })
                }
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
                onChange={(e) =>
                  setProductForm({ ...productForm, discount: e.target.value })
                }
                className="w-full border border-gray-300 rounded"
                style={{ padding: "8px 12px" }}
              />
            </div>

            <div className="col-span-2">
              <label
                className="block text-sm font-medium text-gray-700"
                style={{ marginBottom: "4px" }}
              >
                Location Details *
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <select
                    value={productForm.lg || ""}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        lg: e.target.value,
                        location: [
                          e.target.value,
                          productForm.city,
                          productForm.town,
                        ]
                          .filter(Boolean)
                          .join(", "),
                      })
                    }
                    className="w-full border border-gray-300 rounded"
                    style={{ padding: "8px 12px" }}
                    required
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
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        city: e.target.value,
                        location: [
                          productForm.lg,
                          e.target.value,
                          productForm.town,
                        ]
                          .filter(Boolean)
                          .join(", "),
                      })
                    }
                    placeholder="City/Area (e.g., Mokola)"
                    className="w-full border border-gray-300 rounded"
                    style={{ padding: "8px 12px" }}
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={productForm.town || ""}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        town: e.target.value,
                        location: [
                          productForm.lg,
                          productForm.city,
                          e.target.value,
                        ]
                          .filter(Boolean)
                          .join(", "),
                      })
                    }
                    placeholder="Street/Town"
                    className="w-full border border-gray-300 rounded"
                    style={{ padding: "8px 12px" }}
                    required
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
                onChange={(e) =>
                  setProductForm({ ...productForm, stock: e.target.value })
                }
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
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    deliveryOption: e.target.value,
                  })
                }
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
                value={productForm.contactPreference}
                onChange={(e) =>
                  // Prefill contact field with base prefix if appropriate
                  setProductForm((prev) => {
                    const newPref = e.target.value;
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
                  })
                }
                className="w-full border border-gray-300 rounded"
                style={{ padding: "8px 12px" }}
                required
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
                  value={productForm.contact}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      contact: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded pr-8"
                  style={{ padding: "8px 12px" }}
                  required
                />
                {productForm.contact && (
                  <button
                    type="button"
                    onClick={() =>
                      setProductForm({ ...productForm, contact: "" })
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
                          src={img.imageUrl || URL.createObjectURL(img)}
                          alt={`Product image ${index + 1}`}
                          className="h-24 w-full object-cover rounded"
                        width={800} height={800} />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = [...productForm.images];
                            newImages.splice(index, 1);
                            setProductForm({
                              ...productForm,
                              images: newImages,
                            });
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1 hover:bg-red-600"
                        >
                          ×
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = productForm.images.map(
                              (image, i) => ({
                                ...image,
                                isPrimary: i === index,
                              }),
                            );
                            setProductForm({
                              ...productForm,
                              images: newImages,
                            });
                          }}
                          className={`absolute bottom-0 right-0 ${
                            img.isPrimary ? "bg-yellow-500" : "bg-gray-500"
                          } text-white rounded-full p-1 m-1 hover:opacity-75`}
                          title={
                            img.isPrimary ? "Primary Image" : "Make Primary"
                          }
                        >
                          ★
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                    if (!productForm.images.some((img) => img.isPrimary)) {
                      newImages[0].isPrimary = true;
                    }
                    setProductForm({
                      ...productForm,
                      images: [...productForm.images, ...newImages],
                    });
                  }}
                  className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                />
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
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    description: e.target.value,
                  })
                }
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
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        isMadeInOyo: e.target.checked,
                      })
                    }
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
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        isActive: e.target.checked,
                      })
                    }
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
              className="flex justify-end"
              style={{ gap: "12px", paddingTop: "16px" }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                style={{ padding: "8px 16px" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-white rounded hover:bg-blue-700"
                style={{
                  padding: "8px 16px",
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
