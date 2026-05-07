import { useState, useEffect } from "react";
import Modal from "./Modal";
import CategoryList from "../serverComponents/business/CategoryList";
import Location from "../serverComponents/business/Location";
import { FaSearchLocation } from "react-icons/fa";

function Search({ setSearchTerm, setSelectedCategory, setSelectedLocation, selectedCategory, selectedLocation }) {
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, setSearchTerm]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCategoryModalOpen(false);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setLocationModalOpen(false);
  };

  return (
    <div className="w-full max-w-3xl flex flex-col items-center" style={{ margin: "0 auto", gap: "12px", padding: "0 8px" }}>
      {/* Main Search Bar */}
      <div className="w-full rounded-full flex items-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white border border-gray-100 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] focus-within:ring-2 focus-within:ring-purple-300 relative" style={{ padding: "8px" }}>
        <FaSearchLocation className="text-purple-600 text-xl" style={{ margin: "0 12px 0 16px" }} />
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name, category, or location..."
            className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium text-sm md:text-base"
            style={{ padding: "8px" }}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {(searchInput || selectedCategory || selectedLocation) && (
            <button
              onClick={() => {
                setSearchInput("");
                setSelectedCategory(null);
                setSelectedLocation(null);
              }}
              className="absolute transform -translate-y-1/2 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-red-500 rounded-full w-7 h-7 flex items-center justify-center transition-colors shadow-sm"
              style={{ right: "8px", top: "50%" }}
              title="Clear all filters"
            >
              <span className="text-sm font-bold">&times;</span>
            </button>
          )}
        </div>
        
        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center border-l border-gray-200" style={{ gap: "12px", padding: "0 8px 0 16px", marginLeft: "8px" }}>
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="text-white text-sm font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-md flex items-center justify-center truncate"
            style={{ padding: "8px 24px", minWidth: "120px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
          >
            {selectedCategory ? selectedCategory.name : "Categories"}
          </button>
          <button
            onClick={() => setLocationModalOpen(true)}
            className="text-white text-sm font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-md flex items-center justify-center truncate"
            style={{ padding: "8px 24px", minWidth: "120px", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}
          >
            {selectedLocation ? selectedLocation.name : "Location"}
          </button>
        </div>
      </div>

      {/* Mobile Buttons */}
      <div className="flex md:hidden w-full justify-between" style={{ gap: "12px", margin: "4px 0 0 0", padding: "0 4px" }}>
        <button
          onClick={() => setCategoryModalOpen(true)}
          className="flex-1 text-white text-sm font-semibold rounded-2xl transition-all duration-300 shadow-md text-center truncate"
          style={{ padding: "10px 16px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
        >
          {selectedCategory ? selectedCategory.name : "Category"}
        </button>
        <button
          onClick={() => setLocationModalOpen(true)}
          className="flex-1 text-white text-sm font-semibold rounded-2xl transition-all duration-300 shadow-md text-center truncate"
          style={{ padding: "10px 16px", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}
        >
          {selectedLocation ? selectedLocation.name : "Location"}
        </button>
      </div>

      {isCategoryModalOpen && (
        <Modal title="Select Category" onClose={() => setCategoryModalOpen(false)}>
          <CategoryList onSelectCategory={handleCategorySelect} />
        </Modal>
      )}
      {isLocationModalOpen && (
        <Modal title="Select Location" onClose={() => setLocationModalOpen(false)}>
          <Location onSelectLocation={handleLocationSelect} />
        </Modal>
      )}
    </div>
  );
}

export default Search;
