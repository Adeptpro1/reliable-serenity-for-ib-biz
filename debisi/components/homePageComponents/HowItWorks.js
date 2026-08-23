"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const steps = [
  {
    id: 1,
    title: "Search & Discover",
    description: "Find businesses that match your needs quickly.",
    icon: "🔍",
  },
  {
    id: 2,
    title: "Watch Showroom Videos",
    description: "See real business experiences through videos.",
    icon: "🎬",
  },
  {
    id: 3,
    title: "Connect & Engage",
    description: "Contact businesses directly & make decisions.",
    icon: "🤝",
  },
];

export default function HowItWorks() {
  return (
    <div style={{ backgroundColor: "#fff", color: "#333", padding: "20px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
        {/* <h2
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            marginBottom: "24px",
            color: "#007bff",
          }}
        >
          🚀 How It Works
        </h2> */}

        <motion.div className="how-grid" whileTap={{ cursor: "grabbing" }}>
          {steps.map((step) => (
            <Link
              href="/directory"
              key={step.id}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <motion.div
                className="how-card"
                whileHover={{ scale: 1.05 }}
              >
                <div className="how-icon">{step.icon}</div>
                <h3 className="how-title">{step.title}</h3>
                <p className="how-desc">{step.description}</p>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        <style>
          {`
            .how-grid {
              display: grid;
              gap: 16px;
              grid-template-columns: 1fr;
            }

            .how-card {
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 12px;
              box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
              text-align: center;
              cursor: pointer;
              transition: transform 0.2s;
            }

            .how-icon {
              margin-bottom: 12px;
              display: flex;
              justify-content: center;
              align-items: center;
              font-size: 40px;
            }

            .how-title {
              font-size: 18px;
              font-weight: 600;
              color: #333;
            }

            .how-desc {
              color: #666;
              margin-top: 10px;
            }

            @media (min-width: 899px) {
              .how-grid {
                grid-template-columns: repeat(2, 1fr);
              }
            }

            @media (min-width: 900px) {
              .how-grid {
                grid-template-columns: repeat(3, 1fr);
              }
            }
          `}
        </style>
      </div>
    </div>
  );
}
