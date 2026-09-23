import { useState, useMemo } from "react";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";
import { TOWNS } from "@/utils/locations";

const locationTypes = [
  { value: "all", label: "All Locations" },
  { value: "town", label: "Towns" },
  { value: "city", label: "Cities" },
  { value: "lg", label: "Local Govt. Areas" },
];

const CITIES = [
  { name: "Ibadan", displayName: "Ibadan", icon: "🏙️" },
  { name: "Ogbomosho", displayName: "Ogbomosho", icon: "🏛️" },
  { name: "Oyo", displayName: "Oyo", icon: "🏛️" },
  { name: "Iseyin", displayName: "Iseyin", icon: "🏞️" },
  { name: "Saki", displayName: "Saki", icon: "🌄" },
];

const LGAS = [
  { name: "Afijio", displayName: "Afijio", icon: "🏛️" },
  { name: "Akinyele", displayName: "Akinyele", icon: "🏡" },
  { name: "Atiba", displayName: "Atiba", icon: "🏫" },
  { name: "Atisbo", displayName: "Atisbo", icon: "🌳" },
  { name: "Egbeda", displayName: "Egbeda", icon: "🏠" },
  { name: "Ibadan_North", displayName: "Ibadan North", icon: "🏢" },
  { name: "Ibadan_North_East", displayName: "Ibadan North East", icon: "🏢" },
  { name: "Ibadan_North_West", displayName: "Ibadan North West", icon: "🏢" },
  { name: "Ibadan_South_East", displayName: "Ibadan South East", icon: "🏠" },
  { name: "Ibadan_South_West", displayName: "Ibadan South West", icon: "🏠" },
  { name: "Ibarapa_Central", displayName: "Ibarapa Central", icon: "🌄" },
  { name: "Ibarapa_East", displayName: "Ibarapa East", icon: "🌄" },
  { name: "Ibarapa_North", displayName: "Ibarapa North", icon: "🌄" },
  { name: "Ido", displayName: "Ido", icon: "🏞️" },
  { name: "Irepo", displayName: "Irepo", icon: "🌳" },
  { name: "Iseyin", displayName: "Iseyin", icon: "🏞️" },
  { name: "Itesiwaju", displayName: "Itesiwaju", icon: "🌾" },
  { name: "Iwajowa", displayName: "Iwajowa", icon: "🌄" },
  { name: "Kajola", displayName: "Kajola", icon: "🏡" },
  { name: "Lagelu", displayName: "Lagelu", icon: "🏢" },
  { name: "Ogbomosho_North", displayName: "Ogbomosho North", icon: "🏛️" },
  { name: "Ogbomosho_South", displayName: "Ogbomosho South", icon: "🏛️" },
  { name: "Ogo_Oluwa", displayName: "Ogo Oluwa", icon: "🌳" },
  { name: "Olorunsogo", displayName: "Olorunsogo", icon: "🏘️" },
  { name: "Oluyole", displayName: "Oluyole", icon: "🏡" },
  { name: "Ona_Ara", displayName: "Ona Ara", icon: "🛤️" },
  { name: "Orelope", displayName: "Orelope", icon: "🌿" },
  { name: "Ori_Ire", displayName: "Ori Ire", icon: "🌳" },
  { name: "Oyo_East", displayName: "Oyo East", icon: "🏛️" },
  { name: "Oyo_West", displayName: "Oyo West", icon: "🏛️" },
  { name: "Saki_East", displayName: "Saki East", icon: "🌄" },
  { name: "Saki_West", displayName: "Saki West", icon: "🌄" },
  { name: "Surulere", displayName: "Surulere", icon: "🏘️" },
];

const SPECIAL_DISPLAY = {
  OkeAdo: "Oke Ado",
  OkeBola: "Oke Bola",
  OkeOffa: "Oke Offa",
  OkePadi: "Oke Padi",
  Oja_ba: "Oja'ba",
  UI: "UI",
};

const TOWN_ICONS = {
  Bodija: "🏢", Adeoyo: "🏥", Alakia: "✈️", UI: "🎓", Dugbe: "🏬", Sango: "🚏",
  Agbowo: "🏠", Agodi: "🌳", Apata: "🏞️", Awe: "⛰️", Eleyele: "🏞️", Eruwa: "🌄",
  Idi_Ayunre: "🌿", Omi_Adio: "🚉", Bashorun: "🏠", Beere: "🏘️", Challenge: "🏙️",
  Felele: "🏠", Fiditi: "🏘️", Foko: "🏘️", Idere: "⛰️", Igbo_Ora: "🌄",
  Igboho: "🏘️", Igbeti: "⛰️", Ilero: "🏡", Ilora: "🏘️", Jobele: "🏡",
  Jericho: "🌳", Kisi: "🏘️", Labiran: "🏘️", Lalupon: "🏘️", Lanlate: "🌄",
  Mokola: "🏢", Monatan: "🏘️", Moniya: "🚉", Oja_ba: "🏪", Oje: "🏪",
  Ojoo: "🚏", OkeAdo: "🏙️", OkeBola: "🏙️", OkeOffa: "🏘️", OkePadi: "🏘️",
  Okeho: "⛰️", Olanla: "🌾", Ologuneru: "🏘️", Olodo: "🏘️", Olorunda: "🏘️",
  Olojuoro: "🏡", Onireke: "🏡", Orogun: "🏠", Osekan: "🌳", Otu: "🏘️",
  Podo: "🏘️", Samonda: "🏘️", Sepeteri: "🏡", Tede: "🏘️", Yemetu: "🏘️",
  Akobo: "🏢", Alalubosa: "🏘️", Apete: "🏠", Akanran: "🌾", Ajibode: "🏡",
  Ago_Are: "🏘️", Apatere: "🌿", Apomu: "🏘️", Adegbayi: "🏙️",
};

const buildLocations = () => {
  const map = new Map();

  // 1. Add Cities
  CITIES.forEach((c) => {
    map.set(c.name, {
      name: c.name,
      displayName: c.displayName,
      icon: c.icon,
      type: ["city"],
    });
  });

  // 2. Add LGAs
  LGAS.forEach((lg) => {
    if (map.has(lg.name)) {
      map.get(lg.name).type.push("lg");
    } else {
      map.set(lg.name, {
        name: lg.name,
        displayName: lg.displayName,
        icon: lg.icon,
        type: ["lg"],
      });
    }
  });

  // 3. Add Towns
  TOWNS.forEach((town) => {
    const display = SPECIAL_DISPLAY[town] || town.replace(/_/g, " ");
    const icon = TOWN_ICONS[town] || "🏘️";
    if (map.has(town)) {
      const existing = map.get(town);
      if (!existing.type.includes("town")) {
        existing.type.push("town");
      }
    } else {
      map.set(town, {
        name: town,
        displayName: display,
        icon: icon,
        type: ["town"],
      });
    }
  });

  return Array.from(map.values())
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((loc, idx) => ({ id: idx + 1, ...loc }));
};

const locations = buildLocations();

const LocationList = ({ onSelectLocation }) => {
  const [filters, setFilters] = useState({
    type: "all",
    searchQuery: "",
  });

  const handleLocationClick = (location) => {
    if (onSelectLocation) {
      onSelectLocation(location);
    }
  };

  const filteredLocations = useMemo(() => {
    const query = filters.searchQuery.toLowerCase();
    return locations.filter((location) => {
      const matchesSearch = location.displayName.toLowerCase().includes(query);
      const matchesType =
        filters.type === "all" || location.type.includes(filters.type);
      return matchesSearch && matchesType;
    });
  }, [filters.searchQuery, filters.type]);

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
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <MdFilterList className="text-gray-600 text-xl" />
          <select
            value={filters.type}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, type: e.target.value }))
            }
            className="border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            style={{ padding: "8px 12px" }}
          >
            {locationTypes.map((type) => (
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
