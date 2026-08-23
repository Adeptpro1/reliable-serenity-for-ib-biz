
const CategoryList = ({ onSelectCategory }) => {
const categories = [
  { id: 1, name: "AGRIBUSINESS", displayName: "Agribusiness", icon: "🚜" },
  { id: 2, name: "MANUFACTURING", displayName: "Manufacturing", icon: "🏭" },
  { id: 3, name: "RETAIL_WHOLESALE", displayName: "Retail & Wholesale", icon: "🛒" },
  { id: 4, name: "TECHNOLOGY", displayName: "Technology", icon: "💻" },
  { id: 5, name: "HEALTHCARE", displayName: "Healthcare", icon: "❤️‍🩹" },
  { id: 6, name: "EDUCATION", displayName: "Education", icon: "🎓" },
  { id: 7, name: "TOURISM_HOSPITALITY", displayName: "Tourism & Hospitality", icon: "🏨" },
  { id: 8, name: "REAL_ESTATE", displayName: "Real Estate", icon: "🏢" },
  { id: 9, name: "TRANSPORT_LOGISTICS", displayName: "Transport & Logistics", icon: "🚚" },
  { id: 10, name: "FINANCIAL_SERVICES", displayName: "Financial Services", icon: "💵" },
  { id: 11, name: "ENERGY", displayName: "Energy", icon: "🔋" },
  { id: 12, name: "MINING", displayName: "Mining", icon: "⛰️" },
  { id: 13, name: "CREATIVE_ENTERTAINMENT", displayName: "Creative & Entertainment", icon: "🎭" },
  { id: 14, name: "PROFESSIONAL_SERVICES", displayName: "Professional Services", icon: "💼" },
  { id: 15, name: "ENVIRONMENTAL_SERVICES", displayName: "Environmental Services", icon: "🌱" },
  { id: 16, name: "SECURITY_SERVICES", displayName: "Security Services", icon: "🛡️" },
  { id: 17, name: "TELECOMMUNICATIONS", displayName: "Telecommunications", icon: "📱" },
  { id: 18, name: "MEDIA_PUBLISHING", displayName: "Media & Publishing", icon: "📰" },
  { id: 19, name: "AUTOMOTIVE", displayName: "Automotive", icon: "🚗" },
  { id: 20, name: "PERSONAL_SERVICES", displayName: "Personal Services", icon: "🧑‍💼" },
  { id: 21, name: "HOUSEHOLD_SERVICES", displayName: "Household Services", icon: "🏠" },
  { id: 22, name: "AGRICULTURE", displayName: "Agriculture", icon: "🚜" },
  { id: 23, name: "BEAUTY_PERSONAL_CARE", displayName: "Beauty & Personal Care", icon: "💄" },
  { id: 24, name: "CONSTRUCTION", displayName: "Construction", icon: "🏗️" },
  { id: 25, name: "ENERGY_UTILITIES", displayName: "Energy & Utilities", icon: "🔋" },
  { id: 26, name: "ENTERTAINMENT_EVENTS", displayName: "Entertainment & Events", icon: "🎭" },
  { id: 27, name: "FASHION_APPAREL", displayName: "Fashion & Apparel", icon: "👕" },
  { id: 28, name: "FOOD_BEVERAGES", displayName: "Food & Beverages", icon: "🍔" },
  { id: 29, name: "GOVERNMENT_PUBLIC_SERVICES", displayName: "Government & Public Services", icon: "🏛️" },
  { id: 30, name: "HOME_LIVING", displayName: "Home & Living", icon: "🏠" },
  { id: 31, name: "HOSPITALITY_TOURISM", displayName: "Hospitality & Tourism", icon: "🏨" },
  { id: 32, name: "INDUSTRIAL_MANUFACTURING", displayName: "Industrial & Manufacturing", icon: "🏭" },
  { id: 33, name: "INFORMATION_TECHNOLOGY", displayName: "Information Technology", icon: "💻" },
  { id: 34, name: "LEGAL_SERVICES", displayName: "Legal Services", icon: "⚖️" },
  { id: 35, name: "LOGISTICS_TRANSPORTATION", displayName: "Logistics & Transportation", icon: "🚚" },
  { id: 36, name: "MARKETING_ADVERTISING", displayName: "Marketing & Advertising", icon: "📣" },
  { id: 37, name: "MEDIA_COMMUNICATIONS", displayName: "Media & Communications", icon: "📰" },
  { id: 38, name: "NONPROFIT_COMMUNITY", displayName: "Nonprofit & Community", icon: "🤝" },
  { id: 39, name: "PET_ANIMAL_SERVICES", displayName: "Pet & Animal Services", icon: "🐾" },
  { id: 40, name: "RELIGIOUS_ORGANIZATIONS", displayName: "Religious Organizations", icon: "⛪" },
  { id: 41, name: "REPAIR_MAINTENANCE", displayName: "Repair & Maintenance", icon: "🔧" },
  { id: 42, name: "RETAIL_ECOMMERCE", displayName: "Retail & E-commerce", icon: "🛒" },
  { id: 43, name: "SAFETY_SECURITY", displayName: "Safety & Security", icon: "🛡️" },
  { id: 44, name: "SPORTS_FITNESS", displayName: "Sports & Fitness", icon: "⚽" },
  { id: 45, name: "TRADES_ARTISANS", displayName: "Trades & Artisans", icon: "🎨" },
  { id: 46, name: "WHOLESALE_DISTRIBUTION", displayName: "Wholesale & Distribution", icon: "📦" },
  { id: 47, name: "OTHER", displayName: "Other", icon: "✨" },
];

  const handleCategoryClick = (category) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
      {[...categories].sort((a, b) => a.displayName.localeCompare(b.displayName)).map((category) => (
        <div
          key={category.id}
          className="rounded-lg flex flex-col items-center cursor-pointer transition-all duration-300 bg-white shadow-lg hover:shadow-xl hover:scale-105"
          onClick={() => handleCategoryClick(category)}
          style={{ padding: "12px" }}
        >
          
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white">
              <span className="text-4xl text-purple-600">{category.icon}</span>
            </div>
            <p className="text-center text-sm font-medium" style={{ marginTop: "8px" }}>
              {category.displayName}
            </p>
          
        </div>
      ))}
    </div>
  );
};

export default CategoryList;
