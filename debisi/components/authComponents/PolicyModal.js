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
            <p>Debisi is provided &quot;as is&quot;. We are not liable for interactions between users/businesses or interruptions caused by events beyond our control (e.g., network failures).</p>

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
            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>1. Introduction</h4>
            <p>
              Welcome to Debisi (referred to as &quot;Debisi&quot;, &quot;Debisi NG&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). Debisi is operated by <strong>iSalesNG Emporium</strong>. We are committed to protecting your privacy and ensuring a transparent user experience on our web platform (https://debisi.ng/) and our mobile applications. This policy explains how we collect, use, process, and disclose your information.
            </p>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>2. Information We Collect</h4>
            <p>To provide our directory services, we collect information directly from you:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '8px' }}>
              <li><strong>Account &amp; Profile Info:</strong> Name, email, phone number, and credentials managed securely through Firebase Authentication.</li>
              <li><strong>Business Listing Details:</strong> Business name, categories, descriptions, contact info (phone, WhatsApp, social links), location details (address, LGA), and logos/photos.</li>
              <li><strong>Device Permissions &amp; Media:</strong> On mobile devices, we request permissions to access your camera and photo library. These permissions are used exclusively to let you select and upload business logos or product photos.</li>
              <li><strong>Automatically Collected Data:</strong> Usage data, device type, operating system, and IP address to analyze platform performance.</li>
            </ul>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>3. How We Use Your Information</h4>
            <p>We use the collected information to:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '8px' }}>
              <li>Publish and display your business in our public directory.</li>
              <li>Verify your account and process listing uploads.</li>
              <li>Allow potential buyers to connect directly with you via WhatsApp, calls, or website links.</li>
              <li>Suggest nearby businesses based on your location.</li>
              <li>Protect our community from fraud and maintain security.</li>
            </ul>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>4. Account &amp; Data Deletion</h4>
            <p>
              We respect your control over your data. Under NDPA 2023 regulations and Google Play policies, you can request the deletion of your account and all associated business data at any time.
            </p>
            <p style={{ marginTop: '8px' }}>
              To request complete deletion, send an email to <strong>isalesng@gmail.com</strong> with the subject <strong>&quot;Account Deletion Request&quot;</strong>. Specify the email associated with your account. Once verified, we will permanently delete your account, listings, and uploaded media within 7 business days.
            </p>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>5. Data Storage and Sharing</h4>
            <p>
              We do not sell, rent, or trade your personal data. Sharing is limited to trusted service providers who assist in operating our platform, such as <strong>Firebase Authentication</strong> (for secure login) and <strong>Bunny.net</strong> (for CDN media hosting), or when legally required by Nigerian regulations.
            </p>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>6. Security of Your Data</h4>
            <p>
              We implement technical and organizational security measures to protect your information. However, no transmission method over the internet or mobile networks is 100% secure, and we cannot guarantee absolute data security.
            </p>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>7. Changes to This Privacy Policy</h4>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy in this modal and updating the policy version.
            </p>

            <h4 style={{ fontWeight: '700', marginTop: '16px' }}>8. Contact Us</h4>
            <p>If you have any questions about this Privacy Policy or data deletion requests, contact us:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '8px' }}>
              <li><strong>Operator:</strong> iSalesNG Emporium</li>
              <li><strong>Email:</strong> isalesng@gmail.com</li>
              <li><strong>Address:</strong> 43, Sango - Mokola Road, Beside LYF Foods Building, Coca Cola, Mokola - Ibadan, Oyo State, Nigeria.</li>
            </ul>
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
