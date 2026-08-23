"use client";

import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";

const AdminSearch = ({ data, onFilter, onSearchChange, placeholder = "Search anything..." }) => {
    const [query, setQuery] = useState("");

    const handleSearch = (event) => {
        const value = event.target.value;
        setQuery(value);

        if (onSearchChange) {
            onSearchChange(value);
        } else if (data && onFilter) {
            const lower = value.toLowerCase();
            const filteredData = data.filter((item) =>
                Object.values(item).some(
                    (field) =>
                        field &&
                        field.toString().toLowerCase().includes(lower)
                )
            );
            onFilter(filteredData);
        }
    };

    return (
        <div className="relative w-full max-w-md" style={{ marginTop: '10px', marginBottom: '10px'}}>
            <FiSearch className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
                type="text"
                className="w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ padding: "0.50rem", paddingLeft: '35px' }}
                placeholder={placeholder}
                value={query}
                onChange={handleSearch}
            />
        </div>
    );
};

export default AdminSearch;
