"use client";
import Image from "next/image";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_PRODUCTS } from '@/api/queries/business/products';
import { useAuth } from "../../contexts/AuthContext";
import ScrollFooter from "../../components/layoutComponents/ScrollFooter";
import Footer from "../../components/layoutComponents/Footer";
import LoadingSpinner from "../../components/otherComponents/LoadingSpinner";
import DynamicHeader from "@/components/layoutComponents/DynamicHeader";
import { useRouter } from "next/navigation";
import Modal from "../../components/otherComponents/Modal";
import { toast } from "react-hot-toast";
import { FaFlag } from "react-icons/fa";

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

// Mock data for products
const mockProducts = [
  {
    id: "1",
    title: "iPhone 14 Pro Max",
    description:
      "Latest iPhone with advanced camera system and A16 Bionic chip",
    price: 850000,
    location: "Ibadan, Oyo State",
    stock: 5,
    discount: 10,
    isMadeInOyo: false,
    category: ProductCategory.ELECTRONICS,
    business: { name: "TechHub Nigeria" },
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop",
        isPrimary: true,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop&crop=face",
        isPrimary: false,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=600&fit=crop&crop=entropy",
        isPrimary: false,
      },
    ],
  },
  {
    id: "2",
    title: "Handmade Adire Fabric",
    description: "Beautiful traditional Adire fabric made in Oyo State",
    price: 25000,
    location: "Oyo, Oyo State",
    stock: 20,
    discount: 0,
    isMadeInOyo: true,
    category: ProductCategory.FASHION,
    business: { name: "Oyo Traditional Crafts" },
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
        isPrimary: true,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=face",
        isPrimary: false,
      },
    ],
  },
  {
    id: "3",
    title: "Organic Honey",
    description: "Pure organic honey harvested from local farms in Oyo State",
    price: 5000,
    location: "Iseyin, Oyo State",
    stock: 50,
    discount: 5,
    isMadeInOyo: true,
    category: ProductCategory.FOOD_BEVERAGES,
    business: { name: "Oyo Honey Farms" },
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=600&fit=crop",
        isPrimary: true,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=600&fit=crop&crop=face",
        isPrimary: false,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=600&fit=crop&crop=entropy",
        isPrimary: false,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=600&fit=crop&crop=center",
        isPrimary: false,
      },
    ],
  },
  {
    id: "4",
    title: "Gaming Laptop",
    description: "High-performance gaming laptop with RTX graphics",
    price: 450000,
    location: "Ibadan, Oyo State",
    stock: 3,
    discount: 15,
    isMadeInOyo: false,
    category: ProductCategory.ELECTRONICS,
    business: { name: "Digital World" },
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&h=600&fit=crop",
        isPrimary: true,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&h=600&fit=crop&crop=face",
        isPrimary: false,
      },
    ],
  },
  {
    id: "5",
    title: "Traditional Beaded Jewelry",
    description: "Handcrafted beaded jewelry made by local artisans",
    price: 15000,
    location: "Ogbomoso, Oyo State",
    stock: 30,
    discount: 0,
    isMadeInOyo: true,
    category: ProductCategory.JEWELRY_ACCESSORIES,
    business: { name: "Oyo Artisans Collective" },
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=600&fit=crop",
        isPrimary: true,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=600&fit=crop&crop=face",
        isPrimary: false,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=600&fit=crop&crop=entropy",
        isPrimary: false,
      },
    ],
  },
  {
    id: "6",
    title: "Fitness Equipment Set",
    description: "Complete home gym equipment for fitness enthusiasts",
    price: 120000,
    location: "Ibadan, Oyo State",
    stock: 8,
    discount: 20,
    isMadeInOyo: false,
    category: ProductCategory.SPORTS_OUTDOOR,
    business: { name: "FitLife Store" },
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
        isPrimary: true,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=face",
        isPrimary: false,
      },
    ],
  },
  {
    id: "7",
    title: "African Print Dress",
    description: "Elegant African print dress perfect for special occasions",
    price: 35000,
    location: "Ibadan, Oyo State",
    stock: 12,
    discount: 8,
    isMadeInOyo: true,
    category: ProductCategory.FASHION,
    business: { name: "African Fashion House" },
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop",
        isPrimary: true,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop&crop=face",
        isPrimary: false,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop&crop=entropy",
        isPrimary: false,
      },
    ],
  },
  {
    id: "8",
    title: "Wireless Bluetooth Headphones",
    description: "Premium wireless headphones with noise cancellation",
    price: 75000,
    location: "Ibadan, Oyo State",
    stock: 15,
    discount: 12,
    isMadeInOyo: false,
    category: ProductCategory.ELECTRONICS,
    business: { name: "AudioTech Solutions" },
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
        isPrimary: true,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop&crop=face",
        isPrimary: false,
      },
    ],
  },
  {
    id: "9",
    title: "Fresh Local Vegetables",
    description: "Fresh organic vegetables from local farms in Oyo State",
    price: 3000,
    location: "Iseyin, Oyo State",
    stock: 100,
    discount: 0,
    isMadeInOyo: true,
    category: ProductCategory.FOOD_BEVERAGES,
    business: { name: "Oyo Fresh Farms" },
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop",
        isPrimary: true,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop&crop=face",
        isPrimary: false,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop&crop=entropy",
        isPrimary: false,
      },
    ],
  },
  {
    id: "10",
    title: "Handcrafted Wooden Furniture",
    description:
      "Beautiful handcrafted wooden furniture made by local artisans",
    price: 85000,
    location: "Ogbomoso, Oyo State",
    stock: 6,
    discount: 5,
    isMadeInOyo: true,
    category: ProductCategory.HOME_GARDEN,
    business: { name: "Oyo Woodcraft" },
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop",
        isPrimary: true,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&crop=face",
        isPrimary: false,
      },
    ],
  },
];

function MarketplaceClient({ initialProducts = [] }) {
  const { user, userBusinesses } = useAuth();
  const router = useRouter(); // Add router
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Removed buggy useQuery here
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagProduct, setFlagProduct] = useState(null);
  const [showFlagLoginModal, setShowFlagLoginModal] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagOther, setFlagOther] = useState("");
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (window.innerWidth < 768) {
        setIsScrollingUp(currentScrollY < lastScrollY);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);
  const [filters, setFilters] = useState({
    category: "",
    isMadeInOyo: false,
    search: "",
    minPrice: "",
    maxPrice: "",
    location: "",
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: {
      category: filters.category || undefined,
      isMadeInOyo: filters.isMadeInOyo || undefined,
      search: filters.search || undefined,
      minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      location: filters.location || undefined,
    },
    skip: false,
  });

  const allProducts = data?.products || initialProducts;

  const openFlagModal = (product) => {
    if (user) {
      setFlagProduct(product);
      setFlagReason("");
      setFlagOther("");
      setShowFlagModal(true);
    } else {
      setShowFlagLoginModal(true);
    }
  };

  const handleFlagSubmit = (e) => {
    e.preventDefault();
    if (!flagReason) {
      toast.error("Please select a reason");
      return;
    }
    if (flagReason === "Other" && !flagOther.trim()) {
      toast.error('Please provide details for "Other"');
      return;
    }

    toast.success("Thank you. The product has been reported.");
    setShowFlagModal(false);
    setFlagProduct(null);
    setFlagReason("");
    setFlagOther("");
  };

  const handleFlagLoginClose = () => {
    setShowFlagLoginModal(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(price);
  };

  const getPrimaryImage = (images) => {
    const primary = images?.find((img) => img.isPrimary);
    return (
      primary?.imageUrl ||
      images?.[0]?.imageUrl ||
      "/debisi_logo.png"
    );
  };

  const handleNextImage = () => {
    if (selectedProduct?.images?.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === selectedProduct.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handlePrevImage = () => {
    if (selectedProduct?.images?.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProduct.images.length - 1 : prev - 1
      );
    }
  };

  const handleImageClick = (product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0); // Reset to first image when opening modal
  };

  // Touch/swipe functionality
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextImage();
    }
    if (isRightSwipe) {
      handlePrevImage();
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <DynamicHeader />
      <div style={{ width: "100%", padding: "40px 30px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "0.5rem",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 3H21V21H3V3Z"
              stroke="var(--primaryColor)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 9H21"
              stroke="var(--primaryColor)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 21V9"
              stroke="var(--primaryColor)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h1 style={{ fontSize: "2.0rem", margin: 0 }}>Marketplace</h1>
          {/* Add Button for logged in users */}
          {user && (
            <button
              onClick={() =>
                router.push(`/dashboard/${user.id}?tab=marketplace`)
              }
              style={{
                marginLeft: "auto",
                padding: "10px 20px",
                fontSize: "14px",
                background: "var(--primaryColor)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Add
            </button>
          )}
        </div>
        <p style={{ fontSize: "1.1rem", color: "#555" }}>
          Discover and buy products from verified businesses in Oyo State
        </p>

        {/* Filters */}
        <div style={{ marginTop: "20px", marginBottom: "30px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              style={{
                flex: 1,
                minWidth: "200px",
                padding: "12px 15px",
                fontSize: "16px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                outline: "none",
              }}
            />
          </div>

          {/* Mobile Filter Button */}
          <div
            style={{
              display: isMobile ? "block" : "none",
              marginBottom: "15px",
            }}
          >
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: "10px 15px",
                fontSize: "14px",
                background: "#f8f9fa",
                color: "#333",
                border: "1px solid #ccc",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 3H2L9 12.46V19L15 16V12.46L22 3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Filters
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  transform: showFilters ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.3s ease",
                }}
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Desktop Filters */}
          <div
            style={{
              display: isMobile ? "none" : "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "12px",
            }}
          >
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              style={{
                ...inputStyle,
                border: "1px solid #ccc",
                borderRadius: "6px",
                outline: "none",
              }}
            >
              <option value="">All Categories</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              style={{
                ...inputStyle,
                border: "1px solid #ccc",
                borderRadius: "6px",
                outline: "none",
              }}
            />
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              style={{
                ...inputStyle,
                border: "1px solid #ccc",
                borderRadius: "6px",
                outline: "none",
              }}
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              style={{
                ...inputStyle,
                border: "1px solid #ccc",
                borderRadius: "6px",
                outline: "none",
              }}
            />
          </div>

          {/* Mobile Collapsible Filters */}
          <div
            style={{
              display: isMobile && showFilters ? "block" : "none",
              marginTop: "15px",
              padding: "15px",
              border: "1px solid #eee",
              borderRadius: "8px",
              background: "#f9f9f9",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "12px",
              }}
            >
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                style={{
                  ...inputStyle,
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  outline: "none",
                }}
              >
                <option value="">All Categories</option>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                style={{
                  ...inputStyle,
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  outline: "none",
                }}
              />
              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                style={{
                  ...inputStyle,
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  outline: "none",
                }}
              />
              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                style={{
                  ...inputStyle,
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <input
              type="checkbox"
              id="madeInOyo"
              checked={filters.isMadeInOyo}
              onChange={(e) =>
                handleFilterChange("isMadeInOyo", e.target.checked)
              }
            />
            <label htmlFor="madeInOyo">Made in Oyo</label>
          </div>
        </div>

        {/* Product Grid */}
        {error && <p style={{ color: "red" }}>{error.message}</p>}
        {allProducts?.length === 0 && (
          <p style={{ color: "#777", textAlign: "center" }}>
            No products found.
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(2, 1fr)"
              : "repeat(auto-fill, minmax(300px, 1fr))",
            gap: isMobile ? "15px" : "25px",
          }}
        >
          {allProducts?.map((product) => (
            <div
              key={product.id}
              style={{
                border: "1px solid #eee",
                borderRadius: "10px",
                overflow: "hidden",
                position: "relative",
                background: "#fff",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onClick={() => handleImageClick(product)}
              onMouseEnter={(e) => {
                if (window.innerWidth > 768) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(0,0,0,0.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (window.innerWidth > 768) {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              <Image
                src={getPrimaryImage(product.images)}
                alt={product.title}
                style={{ 
                  width: "100%", 
                  height: "200px", 
                  objectFit: product.images?.length > 0 ? "cover" : "contain",
                  filter: product.images?.length > 0 ? "none" : "grayscale(100%) opacity(0.3)",
                  padding: product.images?.length > 0 ? "0" : "20px"
                }}
                width={800}
                height={800}
                onError={(e) =>
                  (e.target.src = "/debisi_logo.png")
                }
              />
              <div style={{ padding: isMobile ? "12px" : "16px" }}>
                <h3
                  style={{
                    fontSize: isMobile ? "0.9rem" : "1.1rem",
                    fontWeight: "600",
                    margin: "0 0 6px",
                    lineHeight: "1.2",
                  }}
                >
                  {product.title}
                </h3>
                {!isMobile && (
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#666",
                      height: "36px",
                      overflow: "hidden",
                    }}
                  >
                    {product.description}
                  </p>
                )}
                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: isMobile ? "0.85rem" : "1rem",
                      fontWeight: "bold",
                      color: "var(--primaryColor)",
                    }}
                  >
                    {formatPrice(product.price)}
                  </span>
                  {product.discount > 0 && (
                    <span
                      style={{
                        background: "#dc3545",
                        color: "#fff",
                        padding: "2px 4px",
                        borderRadius: "3px",
                        fontSize: isMobile ? "0.6rem" : "0.75rem",
                      }}
                    >
                      -{product.discount}%
                    </span>
                  )}
                </div>
                {!isMobile && (
                  <>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#666",
                        marginTop: "6px",
                      }}
                    >
                      📍 {product.location} | 📦 {product.stock}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#555",
                        marginTop: "4px",
                      }}
                    >
                      {product.business?.name}
                      {product.isMadeInOyo && (
                        <span
                          style={{
                            background: "#28a745",
                            color: "#fff",
                            marginLeft: "8px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "0.65rem",
                          }}
                        >
                          Made in Oyo
                        </span>
                      )}
                    </div>
                  </>
                )}
                {isMobile && product.isMadeInOyo && (
                  <div style={{ marginTop: "4px" }}>
                    <span
                      style={{
                        background: "#28a745",
                        color: "#fff",
                        padding: "1px 4px",
                        borderRadius: "3px",
                        fontSize: "0.6rem",
                      }}
                    >
                      Made in Oyo
                    </span>
                  </div>
                )}
              </div>

              {/* Flag button moved below 'Made in Oyo' */}
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openFlagModal(product);
                  }}
                  title="Flag Product"
                  aria-label="Flag Product"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "transparent",
                    border: "none",
                    color: "#e11d48",
                    cursor: "pointer",
                    fontSize: "10px",
                    padding: "8px",
                  }}
                >
                  <FaFlag />
                  <span>Flag Product</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="modern-modal-overlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modern-modal-header">
              <h2 className="modern-modal-title">Product Details</h2>
              <button
                className="modern-modal-close"
                onClick={() => setSelectedProduct(null)}
              >
                <span className="modern-modal-close-icon">×</span>
              </button>
            </div>
            <div className="modern-modal-content">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "20px",
                }}
              >
                {/* Product Image Carousel */}
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: "8px",
                    }}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                  >
                    <Image
                      src={
                        selectedProduct.images[currentImageIndex]?.imageUrl ||
                        "/debisi_logo.png"
                      }
                      alt={selectedProduct.title}
                      style={{
                        width: "100%",
                        height: isMobile ? "250px" : "300px",
                        objectFit: selectedProduct.images?.length > 0 ? "cover" : "contain",
                        filter: selectedProduct.images?.length > 0 ? "none" : "grayscale(100%) opacity(0.3)",
                        transition: "opacity 0.3s ease",
                        userSelect: "none",
                        pointerEvents: "none",
                      }}
                      width={800}
                      height={800}
                      onError={(e) =>
                        (e.target.src = "/debisi_logo.png")
                      }
                    />
                    {/* Navigation Arrows */}
                    {selectedProduct.images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          style={{
                            position: "absolute",
                            left: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "40px",
                            height: "40px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                            zIndex: 10,
                          }}
                        >
                          ‹
                        </button>
                        <button
                          onClick={handleNextImage}
                          style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "rgba(0, 0, 0, 0.5)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "40px",
                            height: "40px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                            zIndex: 10,
                          }}
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>
                  {/* Image Indicators */}
                  {selectedProduct.images.length > 1 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "8px",
                        marginTop: "10px",
                      }}
                    >
                      {selectedProduct.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            border: "none",
                            background:
                              index === currentImageIndex
                                ? "var(--primaryColor)"
                                : "#ccc",
                            cursor: "pointer",
                            transition: "background 0.3s ease",
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {/* Image Counter */}
                  {selectedProduct.images.length > 1 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "rgba(0, 0, 0, 0.7)",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        zIndex: 10,
                      }}
                    >
                      {currentImageIndex + 1} / {selectedProduct.images.length}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div>
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "600",
                      margin: "0 0 10px",
                    }}
                  >
                    {selectedProduct.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "1rem",
                      color: "#666",
                      marginBottom: "15px",
                      lineHeight: "1.5",
                    }}
                  >
                    {selectedProduct.description}
                  </p>
                  <div style={{ marginBottom: "15px" }}>
                    <span
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "var(--primaryColor)",
                      }}
                    >
                      {formatPrice(selectedProduct.price)}
                    </span>
                    {selectedProduct.discount > 0 && (
                      <span
                        style={{
                          background: "#dc3545",
                          color: "#fff",
                          marginLeft: "10px",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "0.9rem",
                        }}
                      >
                        -{selectedProduct.discount}% OFF
                      </span>
                    )}
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ fontSize: "1rem", color: "#666" }}>
                        📍
                      </span>
                      <span style={{ fontSize: "1rem", color: "#333" }}>
                        {selectedProduct.location}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ fontSize: "1rem", color: "#666" }}>
                        📦
                      </span>
                      <span style={{ fontSize: "1rem", color: "#333" }}>
                        {selectedProduct.stock} in stock
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ fontSize: "1rem", color: "#666" }}>
                        🏢
                      </span>
                      <span style={{ fontSize: "1rem", color: "#333" }}>
                        {selectedProduct.business?.name}
                      </span>
                    </div>
                    {selectedProduct.isMadeInOyo && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            background: "#28a745",
                            color: "#fff",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "0.8rem",
                          }}
                        >
                          Made in Oyo
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Contact Seller Section */}
                  <div
                    style={{
                      borderTop: "1px solid #eee",
                      paddingTop: "15px",
                      marginTop: "15px",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        margin: "0 0 10px",
                      }}
                    >
                      Contact Seller
                    </h4>
                    <div
                      style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                    >
                      <button
                        style={{
                          padding: "10px 20px",
                          background: "#25D366",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                        onClick={() => {
                          const message = `Hi, I'm interested in your product: ${selectedProduct.title}`;
                          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
                            message
                          )}`;
                          window.open(whatsappUrl, "_blank");
                        }}
                      >
                        <span>📱</span>
                        WhatsApp
                      </button>
                      <button
                        style={{
                          padding: "10px 20px",
                          background: "#007bff",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                        onClick={() => {
                          window.open(`tel:`, "_blank");
                        }}
                      >
                        <span>📞</span>
                        Call
                      </button>
                      <button
                        style={{
                          padding: "10px 20px",
                          background: "var(--primaryColor)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                        onClick={() => {
                          const subject = `Inquiry about: ${selectedProduct.title}`;
                          const body = `Hi, I'm interested in your product: ${
                            selectedProduct.title
                          }\n\nPrice: ${formatPrice(
                            selectedProduct.price
                          )}\n\nPlease provide more details.`;
                          const mailtoUrl = `mailto:?subject=${encodeURIComponent(
                            subject
                          )}&body=${encodeURIComponent(body)}`;
                          window.open(mailtoUrl, "_blank");
                        }}
                      >
                        <span>✉️</span>
                        Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Flag / Report Modal for logged-in users */}
      {showFlagModal && flagProduct && (
        <Modal
          title={`Report: ${flagProduct.title}`}
          onClose={() => {
            setShowFlagModal(false);
            setFlagProduct(null);
          }}
        >
          <form
            onSubmit={handleFlagSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reason
              </label>
              <select
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="w-full border border-gray-300 rounded"
                style={{ padding: "8px 12px" }}
                required
              >
                <option value="">Select reason</option>
                <option value="Spam">Spam or scam</option>
                <option value="Inappropriate">Inappropriate content</option>
                <option value="WrongCategory">Wrong category</option>
                <option value="Duplicate">Duplicate listing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {flagReason === "Other" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Details
                </label>
                <textarea
                  value={flagOther}
                  onChange={(e) => setFlagOther(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded"
                  style={{ padding: "8px 12px" }}
                />
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowFlagModal(false);
                  setFlagProduct(null);
                }}
                className="border border-gray-300 rounded"
                style={{ padding: '16px 8px'}}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-red-600 text-white rounded"
                style={{ padding: '16px 8px'}}
              >
                Report
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Login required modal when trying to flag while logged out */}
      {showFlagLoginModal && (
        <Modal title="Login required" onClose={handleFlagLoginClose}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <p className="text-sm text-gray-700">
              You need to be logged in to report a product. Please log in or
              register to continue.
            </p>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleFlagLoginClose}
                className="border border-gray-300 rounded"
                style={{ padding: '8px 4px'}}
              >
                Cancel
              </button>
              <button
                onClick={() => router.push("/login")}
                className="bg-red-600 text-white rounded"
                      style={{ padding: '8px 4px'}}
              >
                Go to login
              </button>
            </div>
          </div>
        </Modal>
      )}
      {isScrollingUp && <ScrollFooter />}
      <Footer />
    </>
  );
}

const inputStyle = {
  padding: "10px 12px",
  fontSize: "16px",
  width: "100%",
};

export default MarketplaceClient;
