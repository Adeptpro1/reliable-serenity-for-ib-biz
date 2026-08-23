"use client";

import { useState, useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import AdminSearch from "./AdminSearch";
import Table from "../otherComponents/Tables";
import Modal from "@/components/otherComponents/Modal";
import { FiStar, FiPlus, FiDollarSign, FiCalendar, FiGlobe, FiPhone, FiMail, FiBriefcase } from "react-icons/fi";
import { toast } from "react-hot-toast";

// ===== GraphQL Queries & Mutations =====
const GET_SPONSORSHIPS = gql`
  query GetSponsorships {
    sponsorships {
      id
      businessName
      businessEmail
      phone
      website
      logo
      amount
      startDate
      endDate
      createdAt
    }
  }
`;

const CREATE_SPONSORSHIP = gql`
  mutation CreateSponsorship($input: SponsorshipInput!) {
    createSponsorship(input: $input) {
      id
      businessName
      amount
    }
  }
`;

const UPDATE_SPONSORSHIP = gql`
  mutation UpdateSponsorship($id: ID!, $input: SponsorshipInput!) {
    updateSponsorship(id: $id, input: $input) {
      id
      businessName
      amount
    }
  }
`;

const DELETE_SPONSORSHIP = gql`
  mutation DeleteSponsorship($id: ID!) {
    deleteSponsorship(id: $id)
  }
`;

const SponsorsForAdmin = () => {
  const { data, loading, error, refetch } = useQuery(GET_SPONSORSHIPS, {
    fetchPolicy: "network-only",
  });
  const [createSponsorship, { loading: creating }] = useMutation(CREATE_SPONSORSHIP);
  const [updateSponsorship, { loading: updating }] = useMutation(UPDATE_SPONSORSHIP);
  const [deleteSponsorship] = useMutation(DELETE_SPONSORSHIP);

  const [filteredSponsors, setFilteredSponsors] = useState([]);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    businessEmail: "",
    phone: "",
    website: "",
    logo: "",
    amount: 10000000,
    startDate: "",
    endDate: "",
  });

  const sponsors = data?.sponsorships || [];

  useEffect(() => {
    if (data?.sponsorships) {
      setFilteredSponsors(data.sponsorships);
    }
  }, [data]);

  const openCreateModal = () => {
    setSelectedSponsor(null);
    setFormData({
      businessName: "",
      businessEmail: "",
      phone: "",
      website: "",
      logo: "",
      amount: 10000000,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (sponsor) => {
    setSelectedSponsor(sponsor);
    setFormData({
      businessName: sponsor.businessName || "",
      businessEmail: sponsor.businessEmail || "",
      phone: sponsor.phone || "",
      website: sponsor.website || "",
      logo: sponsor.logo || "",
      amount: sponsor.amount || 10000000,
      startDate: sponsor.startDate ? new Date(sponsor.startDate).toISOString().split("T")[0] : "",
      endDate: sponsor.endDate ? new Date(sponsor.endDate).toISOString().split("T")[0] : "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (row) => {
    const id = row?.id || row;
    if (!id) return;
    if (!confirm("Are you sure you want to delete this sponsorship?")) return;
    try {
      await deleteSponsorship({ variables: { id } });
      await refetch();
      toast.success("Sponsorship deleted successfully.");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete sponsorship.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.businessName.trim() || !formData.businessEmail.trim() || !formData.phone.trim()) {
      toast.error("Business name, email, and phone are required.");
      return;
    }

    try {
      const input = {
        businessName: formData.businessName,
        businessEmail: formData.businessEmail,
        phone: formData.phone,
        website: formData.website || null,
        logo: formData.logo || null,
        amount: parseFloat(String(formData.amount).replace(/[^0-9.-]+/g, "")) || 0,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      };

      if (selectedSponsor) {
        await updateSponsorship({
          variables: {
            id: selectedSponsor.id,
            input,
          },
        });
        toast.success("Sponsorship updated successfully.");
      } else {
        await createSponsorship({
          variables: { input },
        });
        toast.success("New sponsorship created successfully.");
      }

      setIsModalOpen(false);
      await refetch();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save sponsorship.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const columns = [
    { title: "ID", field: "id", render: (row) => <span className="text-[10px] text-gray-400">{row.id.slice(0, 8)}...</span> },
    { title: "Business Name", field: "businessName", render: (row) => <span className="font-semibold text-gray-900">{row.businessName}</span> },
    { title: "Email", field: "businessEmail", render: (row) => <span className="text-gray-600 text-xs">{row.businessEmail}</span> },
    { title: "Amount (₦)", field: "amount", render: (row) => <span className="font-bold text-gray-800">₦{(row.amount || 0).toLocaleString()}</span> },
    { title: "Start Date", field: "startDate", render: (row) => row.startDate ? new Date(row.startDate).toLocaleDateString() : "—" },
    { title: "End Date", field: "endDate", render: (row) => row.endDate ? new Date(row.endDate).toLocaleDateString() : "—" },
  ];

  const totalSponsors = sponsors.length;
  const totalSponsorshipRevenue = sponsors.reduce((acc, s) => acc + (s.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Corporate Sponsors Management</h1>
          <p className="text-sm text-gray-500">Oversee annual and corporate platform sponsorships</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
        >
          <FiPlus size={16} /> Add New Sponsor
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
          Failed to load sponsors: {error.message}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
            <FiStar />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sponsors</p>
            <h2 className="text-2xl font-extrabold text-gray-800">{totalSponsors}</h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <FiDollarSign />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Contract Value</p>
            <h2 className="text-2xl font-extrabold text-gray-800">₦{totalSponsorshipRevenue.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      {/* Search & Table */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <AdminSearch data={sponsors} onFilter={setFilteredSponsors} />
        </div>
        <Table
          data={filteredSponsors}
          columns={columns}
          isLoading={loading}
          onEdit={(row) => handleEdit(row)}
          onDelete={(row) => handleDelete(row)}
        />
      </div>

      {/* Modal for Create / Edit */}
      {isModalOpen && (
        <Modal 
          onClose={() => setIsModalOpen(false)} 
          title={selectedSponsor ? "Edit Sponsor Details" : "Create New Sponsorship"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Business Name
              </label>
              <input
                type="text"
                name="businessName"
                required
                value={formData.businessName}
                onChange={handleChange}
                placeholder="e.g. Zenith Global Tech"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Business Email
                </label>
                <input
                  type="email"
                  name="businessEmail"
                  required
                  value={formData.businessEmail}
                  onChange={handleChange}
                  placeholder="contact@company.com"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+234..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Logo Image URL
                </label>
                <input
                  type="url"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Contract Amount (₦)
              </label>
              <input
                type="number"
                name="amount"
                required
                value={formData.amount}
                onChange={handleChange}
                placeholder="10000000"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || updating}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {creating || updating ? "Saving..." : selectedSponsor ? "Save Changes" : "Create Sponsorship"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SponsorsForAdmin;
