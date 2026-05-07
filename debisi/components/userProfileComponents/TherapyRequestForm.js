"use client";

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useMutation } from "@apollo/client";
import { REQUEST_THERAPY_SESSION } from "../../api/queries/therapy";
import { toast } from "react-hot-toast";

const TherapyRequestForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email || "",
    phone: user?.phone || "",
    message: ""
  });

  const [requestTherapy, { loading }] = useMutation(REQUEST_THERAPY_SESSION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields (Name, Email, Message)");
      return;
    }

    try {
      await requestTherapy({
        variables: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message
        }
      });
      toast.success("Your therapy request has been submitted. We will contact you soon!");
      setFormData({
        ...formData,
        message: ""
      });
    } catch (err) {
      if (err.message.includes("network-request-failed") || err.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error(err.message || "Failed to submit request");
      }
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>Request a Therapy Session</h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Fill out the form below and one of our consultants will reach out to you.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Full Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
            placeholder="John Doe"
          />
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
              placeholder="john@example.com"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
              placeholder="08012345678"
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Reason for Session *</label>
          <textarea
            required
            rows={5}
            value={formData.message}
            onChange={e => setFormData({ ...formData, message: e.target.value })}
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', resize: 'vertical' }}
            placeholder="Briefly describe what you would like to discuss..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '12px',
            padding: '14px',
            backgroundColor: loading ? '#ccc' : '#D22730',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default TherapyRequestForm;
