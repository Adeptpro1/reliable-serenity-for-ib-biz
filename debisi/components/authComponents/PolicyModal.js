import { motion } from "framer-motion";

export default function PolicyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-50 bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        style={{ margin: "20px", padding: "15px" }}
      >
        <div 
          className="policy prose-sm" 
          style={{ 
            color: '#374151',
            lineHeight: '1.6',
          }}
        >
          {/* Terms & Conditions Section */}
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#111827', borderBottom: '2px solid #f3f4f6' }}>
            Terms & Conditions
          </h3>
          
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>1. Introduction</h4>
            <p>Welcome to <strong>Debisi Commercial Platform</strong>. By creating an account, you agree to these Terms. If you do not agree, please discontinue use.</p>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>2. Eligibility</h4>
            <p>You must be 18+ years old (or have legal guardian consent). You are responsible for providing accurate info and keeping your credentials secure.</p>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>3. Nature of Service</h4>
            <p>Debisi is a discovery platform. We are not a party to transactions between users and businesses. Independent verification is advised before engagement.</p>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>4. User Conduct</h4>
            <p>You agree to provide lawful information, list only legitimate businesses, and comply with all Nigerian laws. Fraudulent content is strictly prohibited.</p>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>5. Content & Moderation</h4>
            <p>By submitting content, you grant Debisi the right to display it. We reserve the right to review, remove content, or suspend accounts for violations.</p>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>6. Payments & Fees</h4>
            <p>Premium features (boosts, video uploads) require fees stated before payment. All payments comply with CBN regulations and are generally non-refundable.</p>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>7. Intellectual Property</h4>
            <p>All platform materials belong to Debisi or respective owners. Unauthorized use or distribution is prohibited.</p>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>8. Liability & Force Majeure</h4>
            <p>Debisi is provided "as is". We are not liable for interactions between users/businesses or interruptions caused by events beyond our control (e.g., network failures).</p>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>9. Governing Law</h4>
            <p>These Terms are governed by the laws of the <strong>Federal Republic of Nigeria</strong>. Disputes will be handled by courts in Oyo State.</p>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>10. Changes to Terms</h4>
            <p>We may update these Terms periodically. Continued use constitutes acceptance of the latest version.</p>
          </div>

          {/* Privacy Policy Section */}
          <h3 className="text-2xl font-bold mb-4 mt-10" style={{ color: '#111827', borderBottom: '2px solid #f3f4f6' }}>
            Privacy Policy
          </h3>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>1. Data Collection</h4>
            <p>We collect names, emails, business details, usage data, and location info to provide and improve our services in compliance with the <strong>NDPA 2023</strong>.</p>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>2. Data Usage</h4>
            <p>Your data helps us verify listings, process payments, and communicate updates. We process data based on consent and contractual necessity.</p>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>3. Data Sharing & Security</h4>
            <p>We do not sell your data. Sharing is limited to trusted partners (e.g., payment processors). We use industry-standard measures to protect your info.</p>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>4. Your Rights</h4>
            <p>You have the right to access, correct, or delete your data, and withdraw consent at any time. We retain data only as long as legally necessary.</p>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>5. Cookies & Links</h4>
            <p>We use cookies to improve experience. We are not responsible for the privacy practices of third-party links found on the platform.</p>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>6. Contact</h4>
            <p>For data-related requests or questions, please contact us through the platform support channels.</p>
          </div>

          <p style={{ marginTop: '20px', fontWeight: '600', textAlign: 'center', color: '#4b5563' }}>
            By registering, you confirm you have read and agree to these Terms and Privacy Policy.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            style={{
              padding: "10px",
              background: "linear-gradient(to right, purple, #D22730)",
              marginTop: "5px",
            }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
