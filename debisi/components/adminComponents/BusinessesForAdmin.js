"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ADMIN_BUSINESSES } from "../../graphql/queries/admin/businesses";
import { ADMIN_DELETE_BUSINESS, ADMIN_UPDATE_BUSINESS } from "../../graphql/mutations/admin/businesses";
import AdminSearch from "./AdminSearch";
import Table from "../otherComponents/Tables";
import Modal from "../otherComponents/Modal";
import { FiBriefcase } from "react-icons/fi";

const BusinessesForAdmin = () => {
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    isVerified: false,
  });
  const [page, setPage] = useState(0);
  const take = 20;
  const skip = page * take;

  const { data, loading, error, refetch } = useQuery(GET_ADMIN_BUSINESSES, {
    variables: { skip, take },
  });

  // Memoize to prevent infinite re-renders
  const businesses = useMemo(
    () => data?.adminBusinessesPaginated || [],
    [data]
  );

  useEffect(() => {
    // Only update if the data is different
    setFilteredBusinesses((prev) => {
      const currentIds = prev.map((b) => b.id).join(",");
      const newIds = businesses.map((b) => b.id).join(",");
      return currentIds !== newIds ? businesses : prev;
    });
  }, [businesses]);

  const [deleteBusinessMutation, { loading: deleting }] = useMutation(ADMIN_DELETE_BUSINESS);
  const [updateBusiness, { loading: updating }] = useMutation(ADMIN_UPDATE_BUSINESS);

  const handleDelete = async (row) => {
    if (!row) return;
    if (window.confirm("Are you sure you want to delete this business?")) {
      await deleteBusinessMutation({ variables: { id: row.id } });
      refetch();
    }
  };

  const handleEdit = (row) => {
    setEditingBusiness(row);
    setEditForm({
      name: row.name || "",
      category: row.category || "",
      isVerified: row.isVerified || false,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateBusiness({
        variables: {
          id: editingBusiness.id,
          input: editForm,
        },
      });
      alert("Business updated successfully");
      setEditingBusiness(null);
      await refetch();
    } catch (err) {
      alert("Failed to update business");
      console.error(err);
    }
  };

  // Flatten business data for safe table rendering
  const flatBusinesses = businesses.map((b) => ({
    ...b,
    userName: `${b.user?.firstName || ""} ${b.user?.lastName || ""}`.trim(),
    addressList:
      b.addresses?.map((a) => `${a.town || ""}, ${a.city || ""}`).join("; ") ||
      "",
  }));

  const columns = [
    { title: "ID", field: "id", hideOnMobile: true },
    { title: "Name", field: "name" },
    { title: "Category", field: "category" },
    { title: "Verified", field: "isVerified" },
    { title: "User", field: "userName", hideOnMobile: true },
    { title: "Addresses", field: "addressList", hideOnMobile: true },
    { title: "Slug", field: "slug", hideOnMobile: true },
  ];


  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between" style={{ gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Business Management</h1>
          <p className="text-sm text-gray-500">Oversee all registered businesses on the platform</p>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '24px', marginBottom: '24px' }}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow" style={{ padding: '24px', gap: '16px' }}>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">
            <FiBriefcase />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Businesses</p>
            <h2 className="text-3xl font-bold text-gray-900">
              {flatBusinesses.length}
            </h2>
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
        <div className="mb-6">
          <AdminSearch data={flatBusinesses} onFilter={setFilteredBusinesses} />
        </div>
        <Table
          data={filteredBusinesses}
          columns={columns}
          onDelete={handleDelete}
          onEdit={handleEdit}
          isLoading={loading || deleting || updating}
        />

        <div className="flex items-center justify-between" style={{ marginTop: '24px', paddingLeft: '8px', paddingRight: '8px' }}>
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="flex items-center bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
            style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', gap: '8px' }}
          >
            Previous
          </button>
          
          <div className="text-sm font-medium text-gray-400">
            Page <span className="text-gray-900 font-bold">{page + 1}</span>
          </div>

          <button
            disabled={businesses.length < take}
            onClick={() => setPage(page + 1)}
            className="flex items-center bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
            style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', gap: '8px' }}
          >
            Next
          </button>
        </div>
      </div>

      {editingBusiness && (
        <Modal title="Edit Business" onClose={() => setEditingBusiness(null)}>
          <form onSubmit={handleUpdate} className="flex flex-col" style={{ gap: '16px' }}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {[
                  "AGRIBUSINESS", "MANUFACTURING", "RETAIL_WHOLESALE", "TECHNOLOGY", "HEALTHCARE", "EDUCATION",
                  "TOURISM_HOSPITALITY", "REAL_ESTATE", "TRANSPORT_LOGISTICS", "FINANCIAL_SERVICES", "ENERGY",
                  "MINING", "CREATIVE_ENTERTAINMENT", "PROFESSIONAL_SERVICES", "ENVIRONMENTAL_SERVICES",
                  "SECURITY_SERVICES", "TELECOMMUNICATIONS", "MEDIA_PUBLISHING", "AUTOMOTIVE", "PERSONAL_SERVICES",
                  "HOUSEHOLD_SERVICES", "AGRICULTURE", "BEAUTY_PERSONAL_CARE", "CONSTRUCTION", "ENERGY_UTILITIES",
                  "ENTERTAINMENT_EVENTS", "FASHION_APPAREL", "FOOD_BEVERAGES", "GOVERNMENT_PUBLIC_SERVICES", "HOME_LIVING",
                  "HOSPITALITY_TOURISM", "INDUSTRIAL_MANUFACTURING", "INFORMATION_TECHNOLOGY", "LEGAL_SERVICES",
                  "LOGISTICS_TRANSPORTATION", "MARKETING_ADVERTISING", "MEDIA_COMMUNICATIONS", "NONPROFIT_COMMUNITY",
                  "PET_ANIMAL_SERVICES", "RELIGIOUS_ORGANIZATIONS", "REPAIR_MAINTENANCE", "RETAIL_ECOMMERCE",
                  "SAFETY_SECURITY", "SPORTS_FITNESS", "TRADES_ARTISANS", "WHOLESALE_DISTRIBUTION", "OTHER"
                ].sort((a, b) => a.replace(/_/g, " ").localeCompare(b.replace(/_/g, " "))).map(cat => (
                  <option key={cat} value={cat}>{cat.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={editForm.isVerified}
                onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Verified</label>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setEditingBusiness(null)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {updating ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default BusinessesForAdmin;
