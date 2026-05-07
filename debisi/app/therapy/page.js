"use client";

import React, { useState } from "react";
import DynamicHeader from "@/components/layoutComponents/DynamicHeader";
import Footer from "@/components/layoutComponents/Footer";
import { useMutation } from "@apollo/client";
import { REQUEST_THERAPY_SESSION } from "@/api/queries/therapy";
import { toast } from "react-hot-toast";
import { FiHeart, FiPhone, FiMail, FiUser, FiMessageSquare } from "react-icons/fi";

export default function TherapyPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  
  const [requestTherapy, { loading }] = useMutation(REQUEST_THERAPY_SESSION, {
    onCompleted: () => {
      toast.success("Thank you! Your therapy request has been sent. We'll reach out soon.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit request.");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      return toast.error("Name, email, and message are required.");
    }
    requestTherapy({ variables: { ...formData } });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DynamicHeader />
      
      <main className="flex-1 flex flex-col items-center justify-center" style={{ padding: "60px 20px" }}>
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden" style={{ margin: "0 auto", padding: "40px" }}>
          
          <div className="text-center" style={{ marginBottom: "30px" }}>
            <div className="inline-flex items-center justify-center bg-purple-100 text-purple-600 rounded-full" style={{ padding: "16px", marginBottom: "16px" }}>
              <FiHeart size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ marginBottom: "10px" }}>Request a Therapy Session</h1>
            <p className="text-gray-600">
              Need someone to talk to? Fill out the form below and we will connect you to a professional consultant.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex flex-col md:flex-row gap-4 mb-5">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: "8px" }}>Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{ padding: "12px 12px 12px 40px", width: "100%", borderRadius: "8px", border: "1px solid #E5E7EB", outlineColor: "#9333EA" }}
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-5">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: "8px" }}>Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={{ padding: "12px 12px 12px 40px", width: "100%", borderRadius: "8px", border: "1px solid #E5E7EB", outlineColor: "#9333EA" }}
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: "8px" }}>Phone Number (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    style={{ padding: "12px 12px 12px 40px", width: "100%", borderRadius: "8px", border: "1px solid #E5E7EB", outlineColor: "#9333EA" }}
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: "8px" }}>What would you like to discuss?</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FiMessageSquare className="text-gray-400" />
                </div>
                <textarea 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  style={{ padding: "12px 12px 12px 40px", width: "100%", borderRadius: "8px", border: "1px solid #E5E7EB", outlineColor: "#9333EA", minHeight: "120px" }}
                  placeholder="Tell us briefly about your situation..."
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-md"
              style={{ padding: "14px 24px", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Submitting..." : "Send Request"}
            </button>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
