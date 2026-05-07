// "use client";

// import { useState, useEffect } from "react";
// import AdminSearch from "../../components/adminComponents/AdminSearch"; 
// import Table from "../otherComponents/Tables";
// import { FiStar } from "react-icons/fi";

// const SponsorsForAdmin = () => {
//   const [sponsors, setSponsors] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     // Sample data for sponsors
//     const sampleSponsors = [
//       { id: 1, businessName: "John Bakery", datePaid: "2024-03-01", expiryDate: "2024-06-01" },
//       { id: 2, businessName: "Alice Boutique", datePaid: "2024-02-15", expiryDate: "2024-05-15" },
//       { id: 3, businessName: "Tech Hub", datePaid: "2024-01-10", expiryDate: "2024-04-10" },
//       { id: 4, businessName: "Foodies Spot", datePaid: "2024-03-05", expiryDate: "2024-06-05" },
//     ];
//     setSponsors(sampleSponsors);
//   }, []);

//   const handleSearch = (term) => {
//     setSearchTerm(term);
//   };

//   const filteredSponsors = searchTerm
//     ? sponsors.filter((sponsor) =>
//         Object.values(sponsor).some((value) =>
//           value.toString().toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       )
//     : sponsors;

//   const columns = [
//     { title: "ID", field: "id" },
//     { title: "Business Name", field: "businessName" },
//     { title: "Date Paid", field: "datePaid" },
//     { title: "Expiry Date", field: "expiryDate" },
//   ];

//   const totalSponsors = sponsors.length;

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       {/* Overview Section */}
//       <h1 className="text-2xl font-bold text-gray-800" style={{ padding: '5px', marginBottom: '5px'}}>Overview of Sponsors</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: '10px'}}>
//       <div className="bg-white rounded-lg shadow flex items-center" style={{ padding: '10px'}}>
//       <div className="bg-blue-100 rounded-full text-blue-600" style={{ padding: '5px'}}>
//           <FiStar size={17} />
//         </div>
//         <div style={{ marginLeft: '5px'}}>
//           <p className="text-gray-600">Total Sponsors</p>
//           <h2 className="text-xl font-semibold text-gray-800">{totalSponsors}</h2>
//         </div>
//       </div>
//       </div>

//       {/* Search & Table */}
//       <div className="bg-white p-5 rounded-lg shadow">
//         <AdminSearch onSearch={handleSearch} />
//         <Table data={filteredSponsors} columns={columns} />
//       </div>
//     </div>
//   );
// };

// export default SponsorsForAdmin;

"use client";

import { useState, useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import AdminSearch from "./AdminSearch";
import Table from "../otherComponents/Tables";
import Modal from "@/components/otherComponents/Modal";
import { FiStar } from "react-icons/fi";

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
      createdAt
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
  const { data, loading, error, refetch } = useQuery(GET_SPONSORSHIPS);
  const [updateSponsorship] = useMutation(UPDATE_SPONSORSHIP);
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
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sponsors = data?.sponsorships || [];

  useEffect(() => {
    if (data?.sponsorships) {
      setFilteredSponsors(data.sponsorships);
    }
  }, [data]);

  const handleEdit = (sponsor) => {
    setSelectedSponsor(sponsor);
    setFormData({
      businessName: sponsor.businessName || "",
      businessEmail: sponsor.businessEmail || "",
      phone: sponsor.phone || "",
      website: sponsor.website || "",
      logo: sponsor.logo || "",
      amount: sponsor.amount || 10000000,
    });
    setMessage("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this sponsorship?")) return;
    try {
      await deleteSponsorship({ variables: { id } });
      await refetch();
      alert("Sponsorship deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete sponsorship.");
    }
  };

  const handleModalSave = async () => {
    try {
      const { id, businessName, amount, paymentStatus, endDate } = selectedSponsor;
      await updateSponsorship({
        variables: {
          id,
          input: {
            businessName,
            amount: parseFloat(amount),
            paymentStatus,
            endDate: endDate ? new Date(endDate) : null,
          },
        },
      });
      setIsModalOpen(false);
      await refetch();
      alert("Sponsorship updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update sponsorship.");
    }
  };

  // New submit handler using formData (used by modal form)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSponsor) return;
    setSubmitLoading(true);
    try {
      await updateSponsorship({
        variables: {
          id: selectedSponsor.id,
          input: {
            businessName: formData.businessName,
            businessEmail: formData.businessEmail,
            phone: formData.phone,
            website: formData.website || null,
            logo: formData.logo,
            amount: parseFloat(String(formData.amount).replace(/[^0-9.-]+/g, "")) || 0,
          },
        },
      });
      setIsModalOpen(false);
      await refetch();
      setMessage("Sponsorship updated successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update sponsorship.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const columns = [
    { title: "ID", field: "id" },
    { title: "Business Name", field: "businessName" },
    { title: "Amount (₦)", field: "amount" },
    { title: "Start Date", field: "startDate" },
    { title: "End Date", field: "endDate" },
  ];

  if (loading) return <p>Loading sponsors...</p>;
  if (error) return <p>Error fetching sponsors: {error.message}</p>;

  const totalSponsors = sponsors.length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Overview Section */}
      <h1
        className="text-2xl font-bold text-gray-800"
        style={{ padding: "5px", marginBottom: "5px" }}
      >
        Overview of Sponsors
      </h1>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        style={{ marginBottom: "10px" }}
      >
        <div
          className="bg-white rounded-lg shadow flex items-center"
          style={{ padding: "10px" }}
        >
          <div
            className="bg-blue-100 rounded-full text-blue-600"
            style={{ padding: "5px" }}
          >
            <FiStar size={17} />
          </div>
          <div style={{ marginLeft: "5px" }}>
            <p className="text-gray-600">Total Sponsors</p>
            <h2 className="text-xl font-semibold text-gray-800">{totalSponsors}</h2>
          </div>
        </div>
      </div>

      {/* Search & Table */}
      <div className="bg-white p-5 rounded-lg shadow">
        <AdminSearch data={sponsors} onFilter={setFilteredSponsors} />
        <Table
          data={filteredSponsors}
          columns={columns}
          isLoading={loading}
          onEdit={(row) => handleEdit(row)}
          onDelete={(row) => handleDelete(row.id)}
        />
      </div>

      {/* Modal for Edit */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)} title="Edit Sponsorship">
          <div className="join-sponsors-form">
            <h2>Join as a Sponsor</h2>
            <form onSubmit={handleSubmit}>
              <div className="sponsor-form-group">
                <label htmlFor="businessName">Business Name</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="sponsor-form-group">
                <label htmlFor="businessEmail">Business Email</label>
                <input
                  type="email"
                  id="businessEmail"
                  name="businessEmail"
                  value={formData.businessEmail}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="sponsor-form-group">
                <label htmlFor="phone">Business Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="sponsor-form-group">
                <label htmlFor="website">Business Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>

              <div className="sponsor-form-group">
                <label htmlFor="logo">Business Logo URL</label>
                <input
                  type="text"
                  id="logo"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="sponsor-form-group">
                <label htmlFor="amount">Amount (₦)</label>
                <input
                  type="text"
                  id="amount"
                  name="amount"
                  value={`₦${formData.amount.toLocaleString()}`}
                  readOnly
                />
              </div>

              <button
                type="submit"
                className="sponsor-payment-button"
                disabled={submitLoading}
                style={{
                  padding: "10px",
                  background: "linear-gradient(to right, purple, #D22730)",
                  marginTop: "5px",
                  cursor: submitLoading ? "not-allowed" : "pointer",
                }}
              >
                {submitLoading ? "Submitting..." : "Update"}
              </button>

              {message && <p style={{ marginTop: "10px" }}>{message}</p>}
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SponsorsForAdmin;
