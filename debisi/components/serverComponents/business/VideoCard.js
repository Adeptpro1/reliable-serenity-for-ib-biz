import { FaPlay } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

const VideoCard = ({ thumbnail, name, totalViews, duration, businessName }) => {
  return (
    <Link href="/showroom" style={{ display: "block", height: "100%" }}>
      <div
        className="rounded-lg shadow transition duration-300 ease-in-out hover:shadow-lg hover:scale-105 flex flex-col"
        style={{ 
          height: "100%", 
          overflow: "hidden",
          border: "1px solid transparent",
          background: "linear-gradient(white, white) padding-box, linear-gradient(to right, #4f46e5, #9333ea, #ec4899) border-box"
        }}
      >
        <div
          className="relative w-full"
          style={{ height: "160px", flexShrink: 0 }}
        >
          <Image src={thumbnail} alt={name} fill className="object-cover" />
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200">
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "50%",
                padding: "8px",
              }}
            >
              <FaPlay style={{ color: "purple" }} size={16} />
            </div>
          </div>
        </div>
        <div className="flex flex-col" style={{ padding: "12px", flexGrow: 1 }}>
          <h3
            className="text-sm md:text-base font-semibold text-gray-800 line-clamp-2"
            style={{ marginBottom: "4px" }}
          >
            {name}
          </h3>
          <p
            className="text-xs text-gray-500 truncate"
            style={{ marginBottom: "8px" }}
          >
            {businessName}
          </p>
          <div
            className="flex items-center text-xs text-gray-600"
            style={{ marginTop: "auto", paddingTop: "8px" }}
          >
            <FaPlay style={{ color: "purple", marginRight: "6px" }} size={12} />
            <span>{totalViews} views</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
