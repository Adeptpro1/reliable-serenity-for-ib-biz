"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from '@apollo/client';
import { GET_PUBLIC_ADS } from '@/api/queries/business/ads';
import { FaUsers, FaStore, FaCity, FaHandshake } from 'react-icons/fa';

// --- CONFIGURATION: Update these manual numbers to reflect your platform's growth ---
const STATS_CONFIG = {
  users: { base: 1050, label: "Active Users", icon: <FaUsers /> },
  businesses: { base: 180, label: "Businesses Listed", icon: <FaStore /> },
  cities: { base: 20, label: "Cities Covered", icon: <FaCity /> },
  partners: { base: 1, label: "Strategic Partners", icon: <FaHandshake /> }
};

const AnimatedNumber = ({ value }) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let startTime;
    const duration = 2000;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      setCurrentValue(Math.round(value * percentage));

      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{currentValue.toLocaleString()}</span>;
};

export default function SponsorsAndStats() {
  const { data: adsData, loading: adsLoading, error: adsError } = useQuery(GET_PUBLIC_ADS, {
    variables: { type: 'SPONSOR', limit: 8 }
  });

  const [liveUserCount, setLiveUserCount] = useState(STATS_CONFIG.users.base);
  const [liveBusinessCount, setLiveBusinessCount] = useState(STATS_CONFIG.businesses.base);

  useEffect(() => {
    // Simulated live updates to make the platform feel "Alive"
    const interval = setInterval(() => {
      setLiveUserCount((prev) => prev + Math.floor(Math.random() * 2));
      if (Math.random() > 0.8) setLiveBusinessCount(prev => prev + 1);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const sponsors = adsData?.publicAds || [];

  return (
    <div style={{ 
      padding: "60px 20px", 
      backgroundColor: "#fcfcfc", // Faint off-white background
      textAlign: "center",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Decorative background element */}
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "-5%",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(210, 39, 48, 0.03) 0%, transparent 70%)",
        zIndex: 0
      }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Sponsors Section */}
        <div style={{ marginBottom: "80px" }}>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ 
              fontSize: "28px", 
              fontWeight: "800", 
              marginBottom: "12px", 
              color: "#111",
              letterSpacing: "-0.5px"
            }}
          >
            Powering Local Commerce
          </motion.h2>
          <p style={{ color: "#666", marginBottom: "35px", fontSize: "16px" }}>Trusted by brands leading the digital revolution in Oyo State.</p>
          
          {adsLoading ? (
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ width: '100px', height: '50px', background: '#f0f0f0', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : adsError ? (
            <div style={{ color: "#999", fontStyle: "italic" }}>Become our first featured sponsor today.</div>
          ) : (
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "25px",
              justifyContent: "center",
              alignItems: "center",
              padding: "15px"
            }}>
              {sponsors.map((sponsor) => (
                <motion.a
                  key={sponsor.id}
                  whileHover={{ scale: 1.05, filter: "grayscale(0%)" }}
                  href={sponsor.targetUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    transition: "all 0.4s ease",
                    filter: "grayscale(100%) opacity(0.6)",
                  }}
                >
                  <img
                    src={sponsor.imageUrl}
                    alt={sponsor.title}
                    style={{ maxWidth: "120px", maxHeight: "40px", objectFit: "contain" }}
                  />
                </motion.a>
              ))}
              
              <a
                href="/sponsors"
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 16px",
                  border: "1px dashed #ccc",
                  borderRadius: "50px",
                  color: "#999",
                  fontSize: "13px",
                  textDecoration: "none",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#D22730";
                  e.currentTarget.style.color = "#D22730";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#ccc";
                  e.currentTarget.style.color = "#999";
                }}
              >
                + Join Sponsors
              </a>
            </div>
          )}
        </div>

        {/* Live Statistics Section */}
        <div style={{ 
          background: "linear-gradient(135deg, #6b21a8 0%, #D22730 100%)",
          borderRadius: "24px",
          padding: "45px 30px",
          boxShadow: "0 15px 35px rgba(107, 33, 168, 0.15)",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Decorative shapes inside stats box */}
          <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
          
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "30px", color: "rgba(255,255,255,0.85)", letterSpacing: "1.5px", textTransform: "uppercase" }}>
             Platform Traction
          </h2>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper">{STATS_CONFIG.users.icon}</div>
              <div className="stat-number"><AnimatedNumber value={liveUserCount} />+</div>
              <div className="stat-label">{STATS_CONFIG.users.label}</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon-wrapper">{STATS_CONFIG.businesses.icon}</div>
              <div className="stat-number"><AnimatedNumber value={liveBusinessCount} />+</div>
              <div className="stat-label">{STATS_CONFIG.businesses.label}</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper">{STATS_CONFIG.cities.icon}</div>
              <div className="stat-number"><AnimatedNumber value={STATS_CONFIG.cities.base} /></div>
              <div className="stat-label">{STATS_CONFIG.cities.label}</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper">{STATS_CONFIG.partners.icon}</div>
              <div className="stat-number"><AnimatedNumber value={STATS_CONFIG.partners.base} /></div>
              <div className="stat-label">{STATS_CONFIG.partners.label}</div>
            </div>
          </div>
        </div>

        <style>
          {`
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
            }

            .stat-card {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 15px;
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(8px);
              border: 1px solid rgba(255, 255, 255, 0.15);
              border-radius: 20px;
              transition: transform 0.3s ease;
            }

            .stat-card:hover {
              transform: translateY(-4px);
              background: rgba(255, 255, 255, 0.15);
            }

            .stat-icon-wrapper {
              font-size: 22px;
              color: white;
              margin-bottom: 12px;
              opacity: 0.8;
            }

            .stat-number {
              font-size: 28px;
              font-weight: 800;
              color: white;
              margin-bottom: 4px;
              font-family: 'Outfit', sans-serif;
            }

            .stat-label {
              font-size: 11px;
              color: rgba(255, 255, 255, 0.65);
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.8px;
            }

            @keyframes pulse {
              0% { opacity: 0.6; }
              50% { opacity: 1; }
              100% { opacity: 0.6; }
            }

            @media (max-width: 992px) {
              .stats-grid {
                grid-template-columns: repeat(2, 1fr);
              }
            }

            @media (max-width: 480px) {
              .stats-grid {
                grid-template-columns: 1fr;
              }
              .stat-number {
                font-size: 24px;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
}