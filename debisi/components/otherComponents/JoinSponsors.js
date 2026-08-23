"use client";
import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";

const CREATE_SPONSORSHIP = gql`
  mutation CreateSponsorship($input: SponsorshipInput!) {
    createSponsorship(input: $input) {
      id
      businessName
      businessEmail
      phone
      amount
      createdAt
    }
  }
`;

const JoinSponsors = () => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    businessName: "",
    businessEmail: user?.email || "",
    phone: user?.phone || "",
    website: "",
    logo: "",
    amount: 10000000,
  });

  const [loading, setLoading] = useState(false);
  const [createSponsorship] = useMutation(CREATE_SPONSORSHIP);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createSponsorship({
        variables: {
          input: {
            businessName: formData.businessName,
            businessEmail: formData.businessEmail,
            phone: formData.phone,
            website: formData.website,
            logo: formData.logo,
            amount: 10000000,
          },
        },
      });

      if (isAuthenticated) {
        toast.success("Sponsorship request submitted! You can track the approval status in your profile.");
      } else {
        toast.success("Sponsorship request submitted! Our team will reach out to you shortly via the contact provided.");
      }
      
      // Reset form or close modal logic could go here
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to submit sponsorship request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "10px" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label htmlFor="businessName" style={{ fontWeight: "600", fontSize: "14px", color: "#374151" }}>Business Name</label>
          <input
            type="text"
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            required
            placeholder="e.g. Acme Corporation"
            style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "15px" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label htmlFor="businessEmail" style={{ fontWeight: "600", fontSize: "14px", color: "#374151" }}>
            Business Email
            <br />
            <small style={{ color: "#D22730", fontWeight: "400" }}>If you have a Debisi account, please use the same email.</small>
          </label>
          <input
            type="email"
            id="businessEmail"
            name="businessEmail"
            value={formData.businessEmail}
            onChange={handleChange}
            required
            placeholder="contact@business.com"
            style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "15px" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label htmlFor="phone" style={{ fontWeight: "600", fontSize: "14px", color: "#374151" }}>Business Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="080..."
              style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "15px" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label htmlFor="website" style={{ fontWeight: "600", fontSize: "14px", color: "#374151" }}>Website (Optional)</label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://..."
              style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "15px" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label htmlFor="logo" style={{ fontWeight: "600", fontSize: "14px", color: "#374151" }}>Business Logo URL</label>
          <input
            type="text"
            id="logo"
            name="logo"
            value={formData.logo}
            onChange={handleChange}
            required
            placeholder="Link to your logo image"
            style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "15px" }}
          />
        </div>

        <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "16px", border: "1px solid #f3f4f6" }}>
          <div style={{ fontSize: "12px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Investment Amount</div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#111" }}>₦10,000,000</div>
          <p style={{ fontSize: "12px", color: "#999", marginTop: "10px" }}>
            Note: Your request will be reviewed by our team. Once approved, you will be contacted for official verification and onboarding.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "16px",
            background: "linear-gradient(to right, #6b21a8, #D22730)",
            color: "white",
            borderRadius: "16px",
            fontWeight: "700",
            fontSize: "16px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            marginTop: "10px",
            boxShadow: "0 10px 20px rgba(210, 39, 48, 0.15)"
          }}
          onMouseOver={(e) => !loading && (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => !loading && (e.currentTarget.style.transform = "translateY(0)")}
        >
          {loading ? "Submitting Request..." : "Submit Sponsorship Request"}
        </button>
      </form>
    </div>
  );
};

export default JoinSponsors;
