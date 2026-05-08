"use client";

import React, { useState } from "react";
import Footer from "../../components/layoutComponents/Footer";
import JoinSponsors from "../../components/otherComponents/JoinSponsors";
import Modal from "../../components/otherComponents/Modal";
import DynamicHeader from "@/components/layoutComponents/DynamicHeader";
import { motion } from "framer-motion";
import { FaCheckCircle, FaRocket, FaGlobe, FaUsers, FaChartLine } from "react-icons/fa";

const Sponsors = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleButtonClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const benefits = [
    { icon: <FaRocket />, text: "Exponential Brand Visibility", sub: "Reach thousands of active participants across our digital ecosystem." },
    { icon: <FaGlobe />, text: "Regional Recognition", sub: "Establish your brand as a leader in the Oyo State digital transformation." },
    { icon: <FaUsers />, text: "Exclusive Networking", sub: "Gain access to high-level networking events and strategic partnerships." },
    { icon: <FaChartLine />, text: "Impactful Growth", sub: "Directly support local innovation and community economic growth." }
  ];

  return (
    <div style={{ backgroundColor: "#fcfcfc", minHeight: "100vh" }}>
      <DynamicHeader />
      
      <main style={{ padding: "80px 20px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                fontSize: "clamp(32px, 5vw, 48px)", 
                fontWeight: "800", 
                color: "#111", 
                marginBottom: "20px",
                letterSpacing: "-1px"
              }}
            >
              Elevate Your Brand with <span style={{ background: "linear-gradient(to right, #6b21a8, #D22730)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Debisi NG</span>
            </motion.h1>
            <p style={{ fontSize: "18px", color: "#666", maxWidth: "700px", margin: "0 auto" }}>
              Join an elite group of visionaries driving the digital future of commerce and community engagement.
            </p>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: "40px",
            alignItems: "center"
          }}>
            {/* Left Column: Benefits */}
            <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
              {benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
                >
                  <div style={{ 
                    fontSize: "24px", 
                    color: "#D22730", 
                    background: "rgba(210, 39, 48, 0.1)", 
                    padding: "12px", 
                    borderRadius: "12px" 
                  }}>
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", marginBottom: "4px" }}>{benefit.text}</h3>
                    <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.5" }}>{benefit.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right Column: CTA Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: "#fff",
                padding: "40px",
                borderRadius: "32px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
                border: "1px solid #f0f0f0",
                textAlign: "center"
              }}
            >
              <div style={{ 
                display: "inline-block", 
                padding: "8px 16px", 
                background: "rgba(107, 33, 168, 0.05)", 
                borderRadius: "50px", 
                color: "#6b21a8", 
                fontSize: "12px", 
                fontWeight: "700", 
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "20px"
              }}>
                Strategic Partnership
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#111", marginBottom: "15px" }}>Annual Sponsorship</h2>
              <p style={{ color: "#666", marginBottom: "30px" }}>Gain year-round exposure across all platform activations and digital assets.</p>
              
              <div style={{ 
                fontSize: "clamp(24px, 8vw, 42px)", 
                fontWeight: "900", 
                color: "#111", 
                marginBottom: "5px",
                fontFamily: "'Outfit', sans-serif"
              }}>
                ₦XXX,XXX.XX
              </div>
              <div style={{ color: "#999", fontSize: "14px", marginBottom: "30px" }}>per fiscal year</div>

              <button
                onClick={handleButtonClick}
                style={{
                  width: "100%",
                  background: "linear-gradient(to right, #6b21a8, #D22730)",
                  color: "#fff",
                  fontSize: "16px",
                  padding: "16px 32px",
                  border: "none",
                  borderRadius: "16px",
                  cursor: "pointer",
                  fontWeight: "700",
                  transition: "all 0.3s ease",
                  boxShadow: "0 10px 20px rgba(210, 39, 48, 0.2)"
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                disabled={true}
              >
                Submit (Coming soon!)
              </button>
              
              <p style={{ marginTop: "20px", fontSize: "12px", color: "#999" }}>
                <FaCheckCircle style={{ color: "#10b981", marginRight: "6px" }} /> 
                Secure request process. No immediate payment required.
              </p>
            </motion.div>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <Modal title={"Sponsorship Application"} onClose={closeModal}>
          <JoinSponsors />
        </Modal>
      )}
      
      <Footer />
    </div>
  );
};

export default Sponsors;
