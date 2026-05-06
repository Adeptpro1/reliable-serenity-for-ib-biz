"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import AdminSearch from "./AdminSearch";
import Table from "../otherComponents/Tables";
import { FiTag, FiEdit3, FiCheck } from "react-icons/fi";
import { GET_PRICINGS } from "../../api/queries/admin/pricing";
import { UPDATE_PRICING, DELETE_PRICING } from "../../api/mutations/admin/pricing";
import { CREATE_PRICING } from "../../api/mutations/admin/pricing";
import Modal from "../otherComponents/Modal";

const PricingForAdmin = () => {
  const [filteredPricing, setFilteredPricing] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const { data, loading, error, refetch } = useQuery(GET_PRICINGS, {
    onCompleted: (data) => setFilteredPricing(data.pricings),
    fetchPolicy: "network-only",
  });
  const [updatePricing] = useMutation(UPDATE_PRICING);
  const [deletePricing] = useMutation(DELETE_PRICING);
  const [createPricing] = useMutation(CREATE_PRICING);

  const pricing = data?.pricings || [];

  // Modal state for create/update
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingPricing, setEditingPricing] = useState(null);
  const [modalForm, setModalForm] = useState({
    category: "",
    title: "",
    description: "",
    purpose: "",
    amount: "",
    currency: "NGN",
    benefit: "", // Add benefit field
    url: "", // Add URL field for "Get Started" button
  });

  const openCreateModal = () => {
    setEditingPricing(null);
    setModalForm({
      category: "",
      title: "",
      description: "",
      purpose: "",
      amount: "",
      currency: "NGN",
      benefit: "",
      url: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditingPricing(row);
    setModalForm({
      category: row.category || "",
      title: row.title || "",
      description: row.description || "",
      purpose: row.purpose || "",
      amount: row.amount || "",
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

  // Option lists derived from enums in backend typeDefs
  const PricingCategoryOptions = ["AD_CATEGORY", "TOP_LIST_CATEGORY", "OTHER_ADS"];
  const PaymentPurposeOptions = [
    "Top_List_Biz",
    "Top_List_Product",
    "Sponsored_Video",
    "Top_List_Notice",
    "Biz_Verification",
    "Sponsor",
    "Web_Banner",
    "Events",
    "In_app_notification"
  ];

  const handleModalSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!modalForm.category || !modalForm.purpose || !modalForm.title || !modalForm.amount) {
      alert('Please fill in all required fields: Category, Purpose, Title, and Amount');
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
        benefit: modalForm.benefit || "Boost visibility and engagement",
        url: modalForm.url || "https://yourdomain.com/ad/web-banner"
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
      } else {
        await createPricing({
          variables: { input }
        });
      }
      await refetch();
      closeModal();
      alert(editingPricing ? 'Pricing updated successfully' : 'Pricing created successfully');
    } catch (err) {
      console.error(err);
      alert('Error: ' + (err.message || 'Failed to save pricing'));
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    { title: "ID", field: "id" },
    { title: "Category", field: "category" },
    { title: "Title", field: "title" },
    {
      title: "Amount (₦)",
      field: "amount",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span>₦{Number(row.amount).toLocaleString()}</span>
          <FiEdit3
            size={16}
            className="text-blue-600 cursor-pointer"
            onClick={() => openEditModal(row)}
          />
        </div>
      ),
    },
    { title: "Purpose", field: "purpose" },
    { title: "Benefits", field: "benefit" },
    { title: "URL", field: "url" },
    { title: "Created", field: "createdAt" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen" style={{padding: '24px'}}>
      {/* Overview Section */}
      <h1 className="text-2xl font-bold text-gray-800" style={{ padding: '5px', marginBottom: '5px'}}>Pricing Overview</h1>

        <div className="bg-white rounded-lg shadow flex items-center justify-between" style={{ padding: '10px'}}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="bg-blue-100 rounded-full text-blue-600" style={{ padding: '5px'}}>
          <FiTag size={17} />
        </div>
        <div style={{ marginLeft: '5px'}}>
          <p className="text-gray-600">Total Pricing Plans</p>
          <h2 className="text-xl font-semibold text-gray-800">{pricing.length}</h2>
        </div>
      </div>
      <div>
        <button onClick={openCreateModal} className="bg-purple-600 text-white rounded" style={{padding: '16px 8px'}}>Create Pricing</button>
      </div>
      </div>

      {/* Search & Table */}
      <div className="bg-white p-5 rounded-lg shadow">
        <AdminSearch data={pricing} onFilter={setFilteredPricing} />
        {error && <p className="text-red-600">Error loading pricings</p>}
        <Table
          data={filteredPricing}
          columns={columns}
          isLoading={loading}
          onEdit={(row) => openEditModal(row)}
          onDelete={async (row) => {
            if (!confirm('Delete this pricing?')) return;
            try {
              await deletePricing({ variables: { id: row.id } });
              await refetch();
              alert('Pricing deleted');
            } catch (err) {
              console.error(err);
              alert('Failed to delete pricing');
            }
          }}
        />
      </div>
      {/* Create / Edit Modal */}
      {isModalOpen && (
        <Modal title={editingPricing ? "Edit Pricing" : "Create Pricing"} onClose={closeModal}>
          <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label>
              <span className="text-sm">Category</span>
              <select name="category" value={modalForm.category} onChange={handleModalChange} className="w-full border rounded" style={{ padding: '8px 4px' }}>
                <option value="">Select category</option>
                {PricingCategoryOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm">Title</span>
              <input name="title" value={modalForm.title} onChange={handleModalChange} className="w-full border rounded" style={{ padding: '8px 4px' }} />
            </label>
            <label>
              <span className="text-sm">Amount</span>
              <input name="amount" type="number" value={modalForm.amount} onChange={handleModalChange} className="w-full border rounded" style={{ padding: '8px 4px' }} />
            </label>
            <label>
              <span className="text-sm">Purpose</span>
              <select 
                name="purpose" 
                value={modalForm.purpose} 
                onChange={handleModalChange} 
                className="w-full border rounded" style={{ padding: '8px 4px' }}
              >
                <option value="">Select purpose</option>
                {PaymentPurposeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="text-sm">Description</span>
              <textarea name="description" value={modalForm.description} onChange={handleModalChange} className="w-full border rounded px-2 py-1" />
            </label>
            <label>
              <span className="text-sm">Benefits (comma-separated)</span>
              <textarea 
                name="benefit" 
                value={modalForm.benefit} 
                onChange={handleModalChange} 
                className="w-full border rounded"
                style={{ padding: '8px 4px' }} 
                placeholder="e.g., Premium visibility, 30-day duration, Priority support"
              />
            </label>
            <label>
              <span className="text-sm">Get Started URL</span>
              <input 
                type="url" 
                name="url" 
                value={modalForm.url} 
                onChange={handleModalChange} 
                className="w-full border rounded"
                style={{ padding: '8px 4px' }} 
                placeholder="https://example.com/get-started"
              />
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={closeModal} className="border rounded" style={{padding: '16px 8px'}}>Cancel</button>
              <button type="submit" className="bg-black text-white rounded" style={{padding: '16px 8px'}} disabled={modalLoading}>{modalLoading ? 'Saving...' : (editingPricing ? 'Update' : 'Create')}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PricingForAdmin;
