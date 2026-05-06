import { useState } from "react";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";

const LocationList = ({ onSelectLocation }) => {
  const [filters, setFilters] = useState({
    type: "all",
    searchQuery: ""
  });

const locationTypes = [
    { value: 'all', label: 'All Locations' },
    { value: 'town', label: 'Towns' },
    { value: 'city', label: 'Cities' },
    { value: 'lg', label: 'Local Govt. Areas' }
  ];

const locations = [
  { id: 1, name: "Adegbayi", displayName: "Adegbayi", icon: "🏙️", type: ["town"] },
  { id: 2, name: "Adeoyo", displayName: "Adeoyo", icon: "🏥", type: ["town"] },
  { id: 3, name: "Afijio", displayName: "Afijio", icon: "🏛️", type: ["lg"] },
  { id: 4, name: "Agbowo", displayName: "Agbowo", icon: "🏠", type: ["town"] },
  { id: 5, name: "Agodi", displayName: "Agodi", icon: "🌳", type: ["town"] },
  { id: 6, name: "Ago_Are", displayName: "Ago Are", icon: "🏘️", type: ["town"] },
  { id: 7, name: "Ajibode", displayName: "Ajibode", icon: "🏡", type: ["town"] },
  { id: 8, name: "Akanran", displayName: "Akanran", icon: "🌾", type: ["town"] },
  { id: 9, name: "Akinyele", displayName: "Akinyele", icon: "🏡", type: ["lg"] },
  { id: 10, name: "Akobo", displayName: "Akobo", icon: "🏢", type: ["town"] },
  { id: 11, name: "Alakia", displayName: "Alakia", icon: "✈️", type: ["town"] },
  { id: 12, name: "Alalubosa", displayName: "Alalubosa", icon: "🏘️", type: ["town"] },
  { id: 13, name: "Apata", displayName: "Apata", icon: "🏞️", type: ["town"] },
  { id: 14, name: "Apete", displayName: "Apete", icon: "🏠", type: ["town"] },
  { id: 15, name: "Apatere", displayName: "Apatere", icon: "🌿", type: ["town"] },
  { id: 16, name: "Apomu", displayName: "Apomu", icon: "🏘️", type: ["town"] },
  { id: 17, name: "Atiba", displayName: "Atiba", icon: "🏫", type: ["lg"] },
  { id: 18, name: "Atisbo", displayName: "Atisbo", icon: "🌳", type: ["lg"] },
  { id: 19, name: "Awe", displayName: "Awe", icon: "⛰️", type: ["town"] },
  { id: 20, name: "Bashorun", displayName: "Bashorun", icon: "🏠", type: ["town"] },
  { id: 21, name: "Beere", displayName: "Beere", icon: "🏘️", type: ["town"] },
  { id: 22, name: "Bodija", displayName: "Bodija", icon: "🏢", type: ["town"] },
  { id: 23, name: "Challenge", displayName: "Challenge", icon: "🏙️", type: ["town"] },
  { id: 24, name: "Dugbe", displayName: "Dugbe", icon: "🏬", type: ["town"] },
  { id: 25, name: "Egbeda", displayName: "Egbeda", icon: "🏠", type: ["town", "lg"] },
  { id: 26, name: "Eleyele", displayName: "Eleyele", icon: "🏞️", type: ["town"] },
  { id: 27, name: "Eruwa", displayName: "Eruwa", icon: "🌄", type: ["town"] },
  { id: 28, name: "Felele", displayName: "Felele", icon: "🏠", type: ["town"] },
  { id: 29, name: "Fiditi", displayName: "Fiditi", icon: "🏘️", type: ["town"] },
  { id: 30, name: "Foko", displayName: "Foko", icon: "🏘️", type: ["town"] },
  { id: 31, name: "Ibadan", displayName: "Ibadan", icon: "🏙️", type: ["city"] },
  { id: 32, name: "Ibadan_North", displayName: "Ibadan North", icon: "🏢", type: ["lg"] },
  { id: 33, name: "Ibadan_North_East", displayName: "Ibadan North East", icon: "🏢", type: ["lg"] },
  { id: 34, name: "Ibadan_North_West", displayName: "Ibadan North West", icon: "🏢", type: ["lg"] },
  { id: 35, name: "Ibadan_South_East", displayName: "Ibadan South East", icon: "🏠", type: ["lg"] },
  { id: 36, name: "Ibadan_South_West", displayName: "Ibadan South West", icon: "🏠", type: ["lg"] },
  { id: 37, name: "Ibarapa_Central", displayName: "Ibarapa Central", icon: "🌄", type: ["lg"] },
  { id: 38, name: "Ibarapa_East", displayName: "Ibarapa East", icon: "🌄", type: ["lg"] },
  { id: 39, name: "Ibarapa_North", displayName: "Ibarapa North", icon: "🌄", type: ["lg"] },
  { id: 40, name: "Idere", displayName: "Idere", icon: "⛰️", type: ["town"] },
  { id: 41, name: "Idi_Ayunre", displayName: "Idi Ayunre", icon: "🌿", type: ["town"] },
  { id: 42, name: "Ido", displayName: "Ido", icon: "🏞️", type: ["lg"] },
  { id: 43, name: "Igbo_Ora", displayName: "Igbo Ora", icon: "🏡", type: ["town"] },
  { id: 44, name: "Igbeti", displayName: "Igbeti", icon: "⛰️", type: ["town"] },
  { id: 45, name: "Igboho", displayName: "Igboho", icon: "🏘️", type: ["town"] },
  { id: 46, name: "Ilero", displayName: "Ilero", icon: "🏞️", type: ["town"] },
  { id: 47, name: "Ilora", displayName: "Ilora", icon: "🏡", type: ["town"] },
  { id: 48, name: "Irepo", displayName: "Irepo", icon: "🌾", type: ["lg"] },
  { id: 49, name: "Iseyin", displayName: "Iseyin", icon: "🧵", type: ["city", "lg"] },
  { id: 50, name: "Itesiwaju", displayName: "Itesiwaju", icon: "🌿", type: ["lg"] },
  { id: 51, name: "Iwere_Ile", displayName: "Iwere Ile", icon: "⛰️", type: ["town"] },
  { id: 52, name: "Iwajowa", displayName: "Iwajowa", icon: "🌳", type: ["lg"] },
  { id: 53, name: "Iwo_Road", displayName: "Iwo Road", icon: "🚦", type: ["town"] },
  { id: 54, name: "Jericho", displayName: "Jericho", icon: "🏠", type: ["town"] },
  { id: 55, name: "Jobele", displayName: "Jobele", icon: "🏡", type: ["town"] },
  { id: 56, name: "Kajola", displayName: "Kajola", icon: "🏘️", type: ["lg"] },
  { id: 57, name: "Kisi", displayName: "Kisi", icon: "🏘️", type: ["town"] },
  { id: 58, name: "Labiran", displayName: "Labiran", icon: "🏘️", type: ["town"] },
  { id: 59, name: "Lagelu", displayName: "Lagelu", icon: "🏡", type: ["lg"] },
  { id: 60, name: "Lalupon", displayName: "Lalupon", icon: "🏡", type: ["town"] },
  { id: 61, name: "Lanlate", displayName: "Lanlate", icon: "🏘️", type: ["town"] },
  { id: 62, name: "Mokola", displayName: "Mokola", icon: "🏙️", type: ["town"] },
  { id: 63, name: "Monatan", displayName: "Monatan", icon: "🏘️", type: ["town"] },
  { id: 64, name: "Moniya", displayName: "Moniya", icon: "🏘️", type: ["town"] },
  { id: 65, name: "Ogbomosho", displayName: "Ogbomosho", icon: "🏘️", type: ["city"] },
  { id: 66, name: "Ogbomosho_North", displayName: "Ogbomosho North", icon: "🏙️", type: ["lg"] },
  { id: 67, name: "Ogbomosho_South", displayName: "Ogbomosho South", icon: "🏙️", type: ["lg"] },
  { id: 68, name: "Ogo_Oluwa", displayName: "Ogo Oluwa", icon: "🙏", type: ["lg"] },
  { id: 69, name: "Oja_ba", displayName: "Oja Ba", icon: "🛍️", type: ["town"] },
  { id: 70, name: "Ojoo", displayName: "Ojoo", icon: "🚏", type: ["town"] },
  { id: 71, name: "Oje", displayName: "Oje", icon: "🛍️", type: ["town"] },
  { id: 72, name: "OkeAdo", displayName: "Oke Ado", icon: "🏡", type: ["town"] },
  { id: 73, name: "OkeBola", displayName: "Oke Bola", icon: "🏘️", type: ["town"] },
  { id: 74, name: "OkeOffa", displayName: "Oke Offa", icon: "🏘️", type: ["town"] },
  { id: 75, name: "OkePadi", displayName: "Oke Padi", icon: "🏡", type: ["town"] },
  { id: 76, name: "Okeho", displayName: "Okeho", icon: "⛰️", type: ["town"] },
  { id: 77, name: "Olanla", displayName: "Olanla", icon: "🏠", type: ["town"] },
  { id: 78, name: "Olodo", displayName: "Olodo", icon: "🏘️", type: ["town"] },
  { id: 79, name: "Ologuneru", displayName: "Ologuneru", icon: "🏞️", type: ["town"] },
  { id: 80, name: "Olojuoro", displayName: "Olojuoro", icon: "🏡", type: ["town"] },
  { id: 81, name: "Olorunda", displayName: "Olorunda", icon: "🏘️", type: ["town"] },
  { id: 82, name: "Olorunsogo", displayName: "Olorunsogo", icon: "🏘️", type: ["town", "lg"] },
  { id: 83, name: "Oluyole", displayName: "Oluyole", icon: "🏡", type: ["town", "lg"] },
  { id: 84, name: "Omi_Adio", displayName: "Omi Adio", icon: "🚉", type: ["town"] },
  { id: 85, name: "Ona_Ara", displayName: "Ona Ara", icon: "🛤️", type: ["lg"] },
  { id: 86, name: "Onireke", displayName: "Onireke", icon: "🏡", type: ["town"] },
  { id: 87, name: "Orelope", displayName: "Orelope", icon: "🌿", type: ["lg"] },
  { id: 88, name: "Ori_Ire", displayName: "Ori Ire", icon: "🌳", type: ["lg"] },
  { id: 89, name: "Orogun", displayName: "Orogun", icon: "🏠", type: ["town"] },
  { id: 90, name: "Osekan", displayName: "Osekan", icon: "🌳", type: ["town"] },
  { id: 91, name: "Otu", displayName: "Otu", icon: "🏘️", type: ["town"] },
  { id: 92, name: "Oyo", displayName: "Oyo", icon: "🏛️", type: ["city"] },
  { id: 93, name: "Oyo_East", displayName: "Oyo East", icon: "🏛️", type: ["lg"] },
  { id: 94, name: "Oyo_West", displayName: "Oyo West", icon: "🏛️", type: ["lg"] },
  { id: 95, name: "Podo", displayName: "Podo", icon: "🏘️", type: ["town"] },
  { id: 96, name: "Saki", displayName: "Saki", icon: "🌄", type: ["city"] },
  { id: 97, name: "Saki_East", displayName: "Saki East", icon: "🌄", type: ["lg"] },
  { id: 98, name: "Saki_West", displayName: "Saki West", icon: "🌄", type: ["lg"] },
  { id: 99, name: "Samonda", displayName: "Samonda", icon: "🏘️", type: ["town"] },
  { id: 100, name: "Sango", displayName: "Sango", icon: "🚏", type: ["town"] },
  { id: 101, name: "Sepeteri", displayName: "Sepeteri", icon: "🏡", type: ["town"] },
  { id: 102, name: "Surulere", displayName: "Surulere", icon: "🏘️", type: ["lg"] },
  { id: 103, name: "Tede", displayName: "Tede", icon: "🏘️", type: ["town"] },
  { id: 104, name: "UI", displayName: "UI", icon: "🎓", type: ["town"] },
  { id: 105, name: "Yemetu", displayName: "Yemetu", icon: "🏘️", type: ["town"] }
];

  const handleLocationClick = (location) => {
    if (onSelectLocation) {
      onSelectLocation(location);
    }
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.displayName.toLowerCase().includes(filters.searchQuery.toLowerCase());
    const matchesType = filters.type === 'all' || location.type.includes(filters.type);
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg shadow p-4 mb-5">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search locations..."
            className="w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ padding: "8px 16px 8px 36px" }}
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
          />
        </div>
        <div className="flex items-center gap-2">
          <MdFilterList className="text-gray-600 text-xl" />
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            style={{ padding: "8px 12px" }}
          >
            {locationTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[calc(100vh-250px)] overflow-y-auto p-2">

      {filteredLocations.map((location) => (
        <div
          key={location.id}
          className="rounded-lg flex flex-col items-center cursor-pointer transition-all duration-300 bg-white shadow-lg hover:shadow-xl hover:scale-105"
          onClick={() => handleLocationClick(location)}
          style={{ padding: "12px" }}
        >
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white">
            <span className="text-4xl text-purple-600">{location.icon}</span>
          </div>
          <p
            className="text-center text-sm font-medium"
            style={{ marginTop: "8px" }}
          >
            {location.displayName}
          </p>
        </div>
      ))}
      </div>
      {filteredLocations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No locations found matching your criteria
        </div>
      )}
    </div>
  );
};

export default LocationList;
