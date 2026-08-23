import { useState, useEffect } from "react";
import Image from "next/image";
import Modal from "../../otherComponents/Modal";
import BusinessView from "./BusinessView";
import { FaStar, FaEye, FaPhone } from "react-icons/fa";
import bnwLogo from "@/images/debisi_logo_bnw.png";

const BusinessCard = ({
  id,
  name,
  description,
  location,
  img,
  rating,
  reviews,
  category,
  status,
  isVerified,
  slug,
  addresses,
  contactUrls,
  phone,
  user,
  galleryImages = [],
}) => {
  const [isBusinessCard, setBusinessCard] = useState(false);
  const [imgSrc, setImgSrc] = useState(img || bnwLogo);

  useEffect(() => {
    const validImg =
      typeof img === "string" && img.trim() !== "" ? img : bnwLogo;
    setImgSrc(validImg);
  }, [img]);

  const handleContact = () => {
    const primaryContact =
      contactUrls?.find((c) => c.isPrimary) || contactUrls?.[0];
    if (primaryContact?.url) {
      window.open(primaryContact.url, "_blank");
    } else if (phone) {
      window.open(`tel:${phone}`, "_self");
    }
  };

  return (
    <>
      <div
        key={id}
        className="relative flex flex-col shadow-md transition-transform transform hover:scale-105 hover:shadow-lg"
        style={{
          height: "100%",
          borderRadius: "12px",
          border: "1px solid transparent",
          background:
            "linear-gradient(white, white) padding-box, linear-gradient(to right, #4f46e5, #9333ea, #ec4899) border-box",
        }}
      >
        <div
          className="relative w-full rounded-t-xl overflow-hidden"
          style={{ height: "160px", flexShrink: 0 }}
        >
          <Image
            src={imgSrc}
            alt={name || "Business logo"}
            width={400}
            height={250}
            className="w-full h-full object-cover"
            style={{ width: "100%", height: "100%" }}
            onError={() => setImgSrc(bnwLogo)}
          />
        </div>

        <div className="flex flex-col" style={{ padding: "12px", flexGrow: 1 }}>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {name}
            </h3>
            {isVerified && (
              <span
                className="flex-shrink-0 text-blue-500"
                title="Verified Business"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}
          </div>

          {/* Star Rating */}
          <div
            className="flex items-center text-yellow-400"
            style={{ marginBottom: "8px" }}
          >
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                size={12}
                className={
                  i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
                }
              />
            ))}
            <span
              className="text-gray-600 text-xs"
              style={{ marginLeft: "4px" }}
            >
              ({reviews})
            </span>
          </div>

          <p
            className="text-sm text-gray-600 line-clamp-2"
            style={{ marginTop: "4px" }}
          >
            {description}
          </p>
          <p className="text-xs text-gray-500" style={{ marginTop: "8px" }}>
            📍 {location}
          </p>

          {/* Category and Status */}
          <div
            className="flex justify-between items-center"
            style={{ marginTop: "auto", paddingTop: "12px" }}
          >
            <span className="text-xs text-gray-500">{category}</span>
            <span
              className={`text-xs font-medium ${
                status === "Open Now" ? "text-green-600" : "text-red-600"
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        <div
          className="flex justify-around border-t"
          style={{ padding: "10px", marginTop: "auto" }}
        >
          <button
            onClick={() => setBusinessCard(true)}
            className="w-1/3 text-sm font-medium transition-colors duration-200"
            style={{ color: "purple", padding: "8px" }}
          >
            View
          </button>

          <button
            onClick={handleContact}
            className="w-1/3 text-sm font-medium transition-colors duration-200"
            style={{ color: "#D22730", padding: "8px" }}
          >
            Contact
          </button>
        </div>
      </div>

      {isBusinessCard && (
        <Modal title={name} onClose={() => setBusinessCard(false)}>
          <BusinessView
            id={id}
            name={name}
            description={description}
            logo={img}
            rating={rating}
            reviews={reviews}
            location={location}
            category={category}
            status={status}
            isVerified={isVerified}
            slug={slug}
            addresses={addresses}
            contactUrls={contactUrls}
            phone={phone}
            userId={user?.id}
            galleryImages={galleryImages}
          />
        </Modal>
      )}
    </>
  );
};

export default BusinessCard;
