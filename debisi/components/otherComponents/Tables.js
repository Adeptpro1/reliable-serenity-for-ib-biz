"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FaEllipsisV,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFileExcel,
  FaLock,
  FaShieldAlt,
} from "react-icons/fa";
import { FiEye, FiEdit, FiTrash2, FiSearch, FiX, FiCheckCircle } from "react-icons/fi";
import Modal from "./Modal";
import * as XLSX from "xlsx";

const Tables = ({
  data = [],
  columns = [],
  isLoading = false,
  pageSize = 10,
  onEdit,
  onDelete,
  searchable = true,
}) => {
  const [menuOpen, setMenuOpen] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [securityError, setSecurityError] = useState("");
  
  const menuRef = useRef(null);

  const handleMenuClick = (rowId) => {
    setMenuOpen(menuOpen === rowId ? null : rowId);
  };

  const handleMenuClose = () => setMenuOpen(null);

  const handleView = (row) => {
    setSelectedRow(row);
    setViewModalOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = (row) => {
    setSelectedRow(row);
    setDeleteModalOpen(true);
    setSecurityCode("");
    setSecurityError("");
    handleMenuClose();
  };

  const confirmDelete = () => {
    // Standard security check: type 'DELETE' or a specific code
    // For now, let's use 'DELETE' as the required confirmation word
    if (securityCode.toUpperCase() === "DELETE") {
      onDelete?.(selectedRow);
      setDeleteModalOpen(false);
      setSelectedRow(null);
    } else {
      setSecurityError("Please type 'DELETE' to confirm.");
    }
  };

  // --- 🔎 Filter + Sort Logic ---
  const filteredData = useMemo(() => {
    let processed = [...data];

    if (searchTerm) {
      processed = processed.filter((row) =>
        columns.some((column) =>
          String(row[column.field] ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }

    if (sortConfig.key && sortConfig.direction) {
      processed.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    return processed;
  }, [data, searchTerm, sortConfig, columns]);

  // --- 📄 Pagination ---
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleMenuClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update position on scroll or resize
  useEffect(() => {
    if (menuOpen) {
      const updatePosition = () => {
        if (menuRef.current && menuRef.current.parentElement) {
          const rect = menuRef.current.parentElement.getBoundingClientRect();
          // Adjust position to stay within viewport
          const menuHeight = 150;
          const menuWidth = 160;
          let top = rect.top + 30;
          let left = rect.left - menuWidth + 30;

          if (top + menuHeight > window.innerHeight) {
            top = rect.top - menuHeight;
          }
          if (left < 0) {
            left = rect.left;
          }

          menuRef.current.style.left = `${left}px`;
          menuRef.current.style.top = `${top}px`;
        }
      };

      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      updatePosition();

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [menuOpen]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded-xl w-full" />
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="h-16 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!isLoading && (!data || data.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FiSearch className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No records found</h3>
        <p className="text-gray-500 text-center max-w-xs mt-1">We couldn&apos;t find any data matching your criteria. Try adjusting your search or add new entries.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
      {/* --- Top Bar --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-b border-gray-50">
        {searchable && (
          <div className="relative w-full sm:max-w-md group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-2xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-50/50 focus:border-blue-400 sm:text-sm transition-all"
              placeholder="Search through all records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
        <button
          onClick={() => {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Records");
            XLSX.writeFile(wb, `debisi-export-${new Date().toISOString().split('T')[0]}.xlsx`);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-emerald-600 hover:bg-emerald-50 border border-emerald-100 rounded-2xl font-bold text-sm transition-all hover:shadow-md hover:shadow-emerald-100 active:scale-95"
        >
          <FaFileExcel className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      {/* --- Table --- */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/80">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.field || index}
                  onClick={() => handleSort(column.field)}
                  className={`px-6 py-4 text-left text-xs font-extrabold text-gray-500 uppercase tracking-wider cursor-pointer group ${column.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{column.title}</span>
                    <span className="text-gray-300 group-hover:text-blue-500 transition-colors">
                      {sortConfig.key === column.field ? (
                        sortConfig.direction === "ascending" ? (
                          <FaSortUp className="text-blue-500" />
                        ) : (
                          <FaSortDown className="text-blue-500" />
                        )
                      ) : (
                        <FaSort className="opacity-0 group-hover:opacity-100" />
                      )}
                    </span>
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-right text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-50">
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className="hover:bg-blue-50/20 transition-all duration-150 group"
              >
                {columns.map((column, colIndex) => {
                  const cellValue = typeof column.render === "function" ? column.render(row) : row[column.field];
                  return (
                    <td 
                      key={`${rowIndex}-${colIndex}`} 
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium ${column.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                    >
                      {formatCell(cellValue)}
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); 
                      handleMenuClick(row.id || rowIndex);
                    }}
                    className={`p-2 rounded-xl transition-all ${
                      menuOpen === (row.id || rowIndex) ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  >
                    <FaEllipsisV className="w-4 h-4" />
                  </button>

                  {menuOpen === (row.id || rowIndex) && (
                    <div
                      ref={menuRef}
                      className="fixed bg-white border border-gray-100 rounded-2xl shadow-2xl z-[9999] overflow-hidden min-w-[180px] animate-in fade-in zoom-in duration-200"
                    >
                      <div className="p-1.5 space-y-1">
                        <button
                          onClick={() => handleView(row)}
                          className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                        >
                          <FiEye className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold">View Details</span>
                        </button>
                        {onEdit && (
                          <button
                            onClick={() => {
                              handleMenuClose();
                              onEdit?.(row);
                            }}
                            className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-colors"
                          >
                            <FiEdit className="w-4 h-4 text-amber-500" />
                            <span className="font-semibold">Edit Record</span>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => handleDeleteClick(row)}
                            className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4 text-red-500" />
                            <span className="font-semibold">Delete Record</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Pagination --- */}
      <div className="p-4 bg-gray-50/50 border-t border-gray-100">
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          totalResults={filteredData.length}
          pageSize={pageSize}
        />
      </div>

      {/* --- View Details Modal --- */}
      {viewModalOpen && selectedRow && (
        <Modal title="Record Details" onClose={() => setViewModalOpen(false)}>
          {/* Header badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", padding: "12px 16px", background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)", borderRadius: "12px", border: "1px solid #BFDBFE" }}>
            <div style={{ width: "36px", height: "36px", background: "#2563EB", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FiEye style={{ color: "white", width: "18px", height: "18px" }} />
            </div>
            <div>
              <p style={{ fontWeight: "800", fontSize: "13px", color: "#1E3A8A", margin: 0 }}>Full Record View</p>
              <p style={{ fontSize: "11px", color: "#3B82F6", margin: 0 }}>All database fields for this entry</p>
            </div>
          </div>

          {/* Attributes grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
            {Object.entries(selectedRow).map(([key, value]) => (
              <div key={key} style={{ padding: "12px 14px", background: "#F9FAFB", borderRadius: "10px", border: "1px solid #F3F4F6" }}>
                <p style={{ fontSize: "10px", fontWeight: "800", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px 0" }}>
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827", wordBreak: "break-word" }}>
                  {formatCell(value)}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #F3F4F6" }}>
            <button
              onClick={() => setViewModalOpen(false)}
              style={{ padding: "10px 28px", background: "#111827", color: "white", borderRadius: "12px", fontWeight: "700", fontSize: "14px", border: "none", cursor: "pointer" }}
            >
              Close
            </button>
          </div>
        </Modal>
      )}


      {/* --- Delete Security Check Modal --- */}
      {deleteModalOpen && selectedRow && (
        <Modal title="Security Verification" onClose={() => setDeleteModalOpen(false)}>
          <div className="p-2">
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-2xl border border-red-100 mb-6 text-red-700">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaShieldAlt className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-red-900">High-Risk Action Detected</h3>
                <p className="text-xs text-red-600">Deleting this record is permanent and cannot be undone. All associated data will be removed from the database.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-2">
                  Type <span className="text-red-600 font-black">DELETE</span> to confirm
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <FaLock className="text-gray-400 group-focus-within:text-red-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={securityCode}
                    onChange={(e) => {
                      setSecurityCode(e.target.value);
                      if(securityError) setSecurityError("");
                    }}
                    placeholder="Enter security word"
                    className={`block w-full pl-11 pr-4 py-3 border rounded-2xl focus:outline-none transition-all ${
                      securityError ? 'border-red-500 bg-red-50 ring-4 ring-red-100' : 'border-gray-200 focus:border-red-400 focus:ring-4 focus:ring-red-50'
                    }`}
                  />
                </div>
                {securityError && (
                  <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1">
                    <FiX className="w-3 h-3" /> {securityError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                >
                  <FiTrash2 />
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Tables;

// --- Format Cell Helper ---
function formatCell(value) {
  if (value === null || value === undefined || value === "") return <span className="text-gray-300 font-normal">No Data</span>;

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-300 font-normal">Empty Array</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((item, idx) => {
          if (React.isValidElement(item)) {
            return React.cloneElement(item, { key: item.key ?? idx });
          }
          return (
            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
              {String(item)}
            </span>
          );
        })}
      </div>
    );
  }

  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
        <FiCheckCircle className="w-3.5 h-3.5" /> VERIFIED
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-gray-50 text-gray-400 border border-gray-200">
        <FiX className="w-3.5 h-3.5" /> PENDING
      </span>
    );
  }

  if (React.isValidElement(value)) return value;

  // Handle objects (like relationships)
  if (typeof value === 'object' && !(value instanceof Date)) {
    return <span className="text-xs text-blue-500 font-bold bg-blue-50 px-2 py-1 rounded-lg">Complex Object</span>;
  }

  if (value instanceof Date) return value.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  const strValue = String(value);
  if (strValue.length > 50) return strValue.substring(0, 47) + "...";
  
  return strValue;
}

// --- Pagination Component ---
function Pagination({ currentPage, setCurrentPage, totalPages, totalResults, pageSize }) {
  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
        <span>Data Inventory Integrity Verified</span>
        <span>{totalResults} Total Records</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-gray-500">
        Showing <span className="text-gray-900 font-extrabold">{Math.min((currentPage - 1) * pageSize + 1, totalResults)}</span> to{" "}
        <span className="text-gray-900 font-extrabold">{Math.min(currentPage * pageSize, totalResults)}</span> of{" "}
        <span className="text-gray-900 font-extrabold">{totalResults}</span> entries
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 border border-gray-200 rounded-xl hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all active:scale-90"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        
        <div className="flex items-center gap-1 mx-2">
          {[...Array(totalPages)].map((_, idx) => {
            const p = idx + 1;
            if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                    currentPage === p
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              );
            }
            if (p === currentPage - 2 || p === currentPage + 2) {
              return <span key={p} className="text-gray-300">...</span>;
            }
            return null;
          })}
        </div>

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 border border-gray-200 rounded-xl hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all active:scale-90"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}