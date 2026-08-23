"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useQuery, useMutation } from "@apollo/client";
import AdminSearch from "./AdminSearch";
import Table from "../otherComponents/Tables";
import { FiTag, FiEdit3, FiCheck, FiRefreshCw, FiPlus, FiAlertCircle } from "react-icons/fi";
import { GET_PRICINGS } from "../../graphql/queries/admin/pricing";
import { UPDATE_PRICING, DELETE_PRICING, CREATE_PRICING, SEED_DEFAULT_PRICINGS } from "../../graphql/mutations/admin/pricing";
import Modal from "../otherComponents/Modal";

const CATEGORY_TABS = [
  { key: "ALL", label: "All Plans" },
  { key: "BUSINESS", label: "Business" },
  { key: "PRODUCT", label: "Product" },
  { key: "NOTICE", label: "Notice" },
  { key: "SHOWROOM", label: "Showroom" },
  { key: "BANNER_ADS", label: "Banners & Ads" },
];

const PricingCategoryOptions = [
  { value: "BUSINESS", label: "Business" },
  { value: "PRODUCT", label: "Product" },
  { value: "NOTICE", label: "Notice" },
  { value: "SHOWROOM", label: "Showroom" },
  { value: "BANNER_ADS", label: "Banners & Ads" },
  { value: "AD_CATEGORY", label: "Ad Category (Legacy)" },
  { value: "TOP_LIST_CATEGORY", label: "Top List (Legacy)" },
  { value: "OTHER_ADS", label: "Other Ads (Legacy)" },
];

const PaymentPurposeOptions = [
  "Top_List_Biz",
  "Top_List_Product",
  "Sponsored_Video",
  "Top_List_Notice",
  "Biz_Verification",
  "Sponsor",
  "Web_Banner",
  "Events",
  "In_app_notification",
  "Wallet_Funding",
  "Notice_Boost",
  "Reach_Out",
  "Business_Of_The_Week",
  "Video_Upload",
  "Video_Boost",
  "Video_Bandwidth_Topup"
];

const PricingForAdmin = () => {
  const [selectedTab, setSelectedTab] = useState("ALL");
  const [filteredPricing, setFilteredPricing] = useState([]);
  const [isConfirmInitOpen, setIsConfirmInitOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_PRICINGS, {
    fetchPolicy: "network-only",
  });
  const [updatePricing] = useMutation(UPDATE_PRICING);
  const [deletePricing] = useMutation(DELETE_PRICING);
  const [createPricing] = useMutation(CREATE_PRICING);
  const [seedDefaultPricings, { loading: seedLoading }] = useMutation(SEED_DEFAULT_PRICINGS);

  const pricing = data?.pricings || [];

  useEffect(() => {
    if (selectedTab === "ALL") {
      setFilteredPricing(pricing);
    } else {
      setFilteredPricing(pricing.filter((p) => p.category === selectedTab));
    }
  }, [pricing, selectedTab]);

  // Modal state for create/update
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingPricing, setEditingPricing] = useState(null);
  const [modalForm, setModalForm] = useState({
    category: "BUSINESS",
    title: "",
    description: "",
    purpose: "Top_List_Biz",
    amount: "",
    currency: "NGN",
    benefit: "",
    url: "/login",
  });

  const openCreateModal = () => {
    setEditingPricing(null);
    setModalForm({
      category: selectedTab !== "ALL" ? selectedTab : "BUSINESS",
      title: "",
      description: "",
      purpose: "Top_List_Biz",
      amount: "",
      currency: "NGN",
      benefit: "",
      url: "/login"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditingPricing(row);
    setModalForm({
      category: row.category || "BUSINESS",
      title: row.title || "",
      description: row.description || "",
      purpose: row.purpose || "Top_List_Biz",
      amount: row.amount !== undefined ? row.amount : "",
      currency: row.currency || "NGN",
      benefit: row.benefit || "",
      url: row.url || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPricing(null);
    setModalLoading(false);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();

    if (!modalForm.category || !modalForm.purpose || !modalForm.title || modalForm.amount === "") {
      toast.error('Please fill in all required fields: Category, Purpose, Title, and Amount');
      return;
    }

    setModalLoading(true);
    try {
      const input = {
        title: modalForm.title,
        category: modalForm.category,
        purpose: modalForm.purpose,
        amount: parseFloat(modalForm.amount),
        currency: modalForm.currency || "NGN",
        description: modalForm.description || "",
        benefit: modalForm.benefit || "",
        url: modalForm.url || ""
      };

      if (editingPricing) {
        await updatePricing({
          variables: {
            input: {
              id: editingPricing.id,
              ...input
            }
          }
        });
        toast.success('Pricing plan updated successfully!');
      } else {
        await createPricing({
          variables: { input }
        });
        toast.success('Pricing plan created successfully!');
      }
      await refetch();
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save pricing plan');
    } finally {
      setModalLoading(false);
    }
  };

  const handleInitializeDefaults = async () => {
    try {
      await seedDefaultPricings();
      await refetch();
      setIsConfirmInitOpen(false);
      toast.success('Default platform pricing plans initialized successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to seed default pricings');
    }
  };

  const columns = [
    { title: "ID", field: "id", render: (row) => <span className="text-xs text-gray-500 font-mono">{row.id.slice(0, 8)}...</span> },
    {
      title: "Category",
      field: "category",
      render: (row) => (
        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
          {row.category?.replace(/_/g, " ")}
        </span>
      ),
    },
    { title: "Title", field: "title", render: (row) => <span className="font-semibold text-gray-900">{row.title}</span> },
    {
      title: "Amount (₦)",
      field: "amount",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-red-600">
            {row.amount === 0 ? "Free" : `₦${Number(row.amount).toLocaleString()}`}
          </span>
          <button
            type="button"
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
            onClick={() => openEditModal(row)}
            title="Edit price"
          >
            <FiEdit3 size={15} />
          </button>
        </div>
      ),
    },
    { title: "Purpose", field: "purpose", render: (row) => <span className="text-xs text-gray-600">{row.purpose?.replace(/_/g, " ")}</span> },
    {
      title: "Benefits",
      field: "benefit",
      render: (row) => (
        <span className="text-xs text-gray-600 line-clamp-2 max-w-xs block" title={row.benefit}>
          {row.benefit}
        </span>
      ),
    },
    {
      title: "URL",
      field: "url",
      render: (row) => (
        <span className="text-xs text-gray-500 truncate max-w-[120px] block" title={row.url}>
          {row.url}
        </span>
      ),
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen" style={{ padding: '24px' }}>
      {/* Overview Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pricing Management</h1>
          <p className="text-sm text-gray-500">Edit platform pricing rates displayed on Web and Mobile</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsConfirmInitOpen(true)}
            disabled={seedLoading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg px-4 py-2 text-sm shadow-sm transition"
          >
            <FiRefreshCw className={seedLoading ? "animate-spin" : ""} size={16} />
            <span>{seedLoading ? "Initializing..." : "Initialize Defaults"}</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg px-4 py-2 text-sm shadow-sm transition"
          >
            <FiPlus size={16} />
            <span>Create Pricing</span>
          </button>
        </div>
      </div>

      {/* Stats and Category Tabs Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl">
              <FiTag size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Total Pricing Plans</p>
              <h2 className="text-xl font-bold text-gray-900">{pricing.length}</h2>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-gray-100 p-1 rounded-xl">
            {CATEGORY_TABS.map((tab) => {
              const count = tab.key === "ALL" ? pricing.length : pricing.filter((p) => p.category === tab.key).length;
              const isActive = selectedTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label} <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Table */}
        <AdminSearch
          data={selectedTab === "ALL" ? pricing : pricing.filter((p) => p.category === selectedTab)}
          onFilter={setFilteredPricing}
        />
        {error && <p className="text-red-600 my-2">Error loading pricings: {error.message}</p>}
        <Table
          data={filteredPricing}
          columns={columns}
          isLoading={loading}
          onEdit={(row) => openEditModal(row)}
          onDelete={async (row) => {
            try {
              await deletePricing({ variables: { id: row.id } });
              await refetch();
              toast.success('Pricing plan deleted successfully');
            } catch (err) {
              console.error(err);
              toast.error('Failed to delete pricing: ' + (err.message || 'Error'));
            }
          }}
        />
      </div>

      {/* Confirmation Modal for Initialize Defaults */}
      {isConfirmInitOpen && (
        <Modal title="Initialize Default Plans" onClose={() => setIsConfirmInitOpen(false)}>
          <div className="p-2 space-y-4">
            <div className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-900">
              <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-xs leading-relaxed">
                This will automatically populate all 12 standard platform pricing plans into the database. Existing plans with matching titles will be safely preserved.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmInitOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInitializeDefaults}
                disabled={seedLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-60"
              >
                {seedLoading ? "Initializing..." : "Confirm & Initialize"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <Modal title={editingPricing ? "Edit Pricing Plan" : "Create Pricing Plan"} onClose={closeModal}>
          <form onSubmit={handleModalSubmit} className="flex flex-col gap-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-700">Category *</span>
                <select
                  name="category"
                  value={modalForm.category}
                  onChange={handleModalChange}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  {PricingCategoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-700">Payment Purpose *</span>
                <select
                  name="purpose"
                  value={modalForm.purpose}
                  onChange={handleModalChange}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  {PaymentPurposeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-700">Plan Title *</span>
                <input
                  name="title"
                  value={modalForm.title}
                  onChange={handleModalChange}
                  placeholder="e.g. Directory Top Listing"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-700">Amount (₦) * (0 = Free)</span>
                <input
                  name="amount"
                  type="number"
                  step="any"
                  value={modalForm.amount}
                  onChange={handleModalChange}
                  placeholder="e.g. 500"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-red-600"
                  required
                />
              </label>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-700">Description</span>
              <textarea
                name="description"
                rows={2}
                value={modalForm.description}
                onChange={handleModalChange}
                placeholder="Brief summary of what this plan offers..."
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-700">
                Benefits / Highlights (separated by commas or newlines)
              </span>
              <textarea
                name="benefit"
                rows={3}
                value={modalForm.benefit}
                onChange={handleModalChange}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Daily rate: ₦500 / day, 7 Days (10% off): ₦3,150, 14 Days (15% off): ₦5,950"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-700">Action / Get Started Link</span>
              <input
                type="text"
                name="url"
                value={modalForm.url}
                onChange={handleModalChange}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. /login, /ad, /add-business"
              />
            </label>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={modalLoading}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-60"
              >
                {modalLoading ? "Saving..." : editingPricing ? "Update Plan" : "Create Plan"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PricingForAdmin;
