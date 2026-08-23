"use client"
import { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { useMutation, useQuery, gql } from '@apollo/client';
import { GET_PRICINGS } from '@/graphql/queries/admin/pricing';
import Image from 'next/image';
import Footer from '../../components/layoutComponents/Footer';
import ScrollFooterWrapper from '@/components/layoutComponents/ScrollFooterWrapper';
import styles from "../RequestAd.module.css";
import DynamicHeader from '@/components/layoutComponents/DynamicHeader';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaCreditCard, FaCloudUploadAlt, FaInfoCircle } from 'react-icons/fa';

const SUBMIT_MOBILE_FEED_BANNER = gql`
  mutation SubmitMobileFeedBanner(
    $email: String!
    $title: String!
    $description: String!
    $ctaUrl: String!
    $weeks: Int!
    $images: [Upload!]!
    $paystackRef: String!
  ) {
    submitMobileFeedBanner(
      email: $email
      title: $title
      description: $description
      ctaUrl: $ctaUrl
      weeks: $weeks
      images: $images
      paystackRef: $paystackRef
    ) {
      id
      title
      status
    }
  }
`;

const RequestAd = () => {
  const { success, error: toastError } = useToast();
  const [submitBannerMutation] = useMutation(SUBMIT_MOBILE_FEED_BANNER);
  const { data: pricingData } = useQuery(GET_PRICINGS, { fetchPolicy: "cache-and-network" });

  const pricings = pricingData?.pricings || [];
  const bannerPlan = pricings.find(
    (p) => p.category === "BANNER_ADS" && p.title.toLowerCase().includes("banner")
  );
  const botwPlan = pricings.find(
    (p) => p.category === "BANNER_ADS" && (p.title.toLowerCase().includes("botw") || p.title.toLowerCase().includes("week"))
  );

  const weeklyRate = bannerPlan ? bannerPlan.amount : 30000;
  const botwRate = botwPlan ? botwPlan.amount : 25000;

  const [selectedOption, setSelectedOption] = useState('feed-banner'); // 'feed-banner', 'botw', 'notification'
  const [formData, setFormData] = useState({
    email: '',
    title: '',
    description: '',
    ctaUrl: '',
    weeks: 1,
  });

  const [loading, setLoading] = useState(false);
  const [bannerImages, setBannerImages] = useState([]);
  const [bannerPreviews, setBannerPreviews] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weeks' ? parseInt(value) || 1 : value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 2) {
      toastError("You can only select up to 2 images.");
      return;
    }
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toastError(`File "${file.name}" is too large. Maximum size is 5MB.`);
        return;
      }
    }

    // Clean up previous blob URLs to prevent memory leaks
    bannerPreviews.forEach(url => URL.revokeObjectURL(url));

    setBannerImages(files);
    
    // Generate previews
    const previews = files.map(file => URL.createObjectURL(file));
    setBannerPreviews(previews);
  };

  const handlePaystackSuccess = async (transaction) => {
    setLoading(true);
    try {
      await submitBannerMutation({
        variables: {
          email: formData.email,
          title: formData.title,
          description: formData.description,
          ctaUrl: formData.ctaUrl,
          weeks: formData.weeks,
          images: bannerImages,
          paystackRef: transaction.reference,
        }
      });

      success('Payment successful! Your Mobile Feed Banner has been submitted for review.');
      
      // Reset form
      setFormData({
        email: '',
        title: '',
        description: '',
        ctaUrl: '',
        weeks: 1,
      });
      setBannerImages([]);
      setBannerPreviews([]);
    } catch (err) {
      console.error(err);
      toastError(err.message || 'An error occurred while saving your request. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (bannerImages.length === 0) {
      toastError('Please select at least one banner image.');
      return;
    }
    if (formData.weeks < 1 || formData.weeks > 8) {
      toastError('You can only select between 1 and 8 weeks.');
      return;
    }
    if (!formData.ctaUrl.startsWith('http://') && !formData.ctaUrl.startsWith('https://')) {
      toastError('Call to Action URL must start with http:// or https://');
      return;
    }

    setLoading(true);
    const amount = weeklyRate * formData.weeks;

    try {
      const PaystackPop = (await import('@paystack/inline-js')).default;
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: formData.email,
        amount: amount * 100, // in kobo
        onSuccess: (transaction) => handlePaystackSuccess(transaction),
        onCancel: () => {
          toastError('Payment cancelled.');
          setLoading(false);
        },
      });
    } catch (err) {
      toastError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#fcfcfc" }} className="min-h-screen flex flex-col">
      <DynamicHeader />
      
      <div className={`${styles.container} flex-1`} style={{ maxWidth: "1050px", margin: "40px auto", width: "92%", borderRadius: "24px", padding: "clamp(20px, 5vw, 40px)" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 className={styles.title} style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: "800", marginBottom: "10px" }}>Advertise with Us</h1>
          <p style={{ color: "#666", fontSize: "16px" }}>Select a placement channel to boost your brand visibility in Oyo State.</p>
        </div>

        {/* Options Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          
          {/* Card 1: Mobile Feed Banner */}
          <div 
            onClick={() => setSelectedOption('feed-banner')}
            style={{ 
              borderRadius: "20px", 
              padding: "30px", 
              border: selectedOption === 'feed-banner' ? "3px solid #D22730" : "1px solid #e2e8f0",
              cursor: "pointer",
              backgroundColor: selectedOption === 'feed-banner' ? "#fef2f2" : "#ffffff",
              transition: "all 0.3s ease"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <span style={{ fontSize: "12px", background: "#fee2e2", color: "#b91c1c", padding: "4px 10px", borderRadius: "12px", fontWeight: "bold" }}>Open to All</span>
              <span style={{ fontSize: "18px", fontWeight: "bold", color: "#b91c1c" }}>₦{(weeklyRate / 1000)}k / wk</span>
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "10px", color: "#1e293b" }}>Mobile Feed Banner</h3>
            <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6", marginBottom: "15px" }}>
              Showcase your brand natively on our mobile application&apos;s main feed. Select up to 8 weeks. No registration required.
            </p>
            <span style={{ fontSize: "14px", fontWeight: "bold", color: "#D22730" }}>Apply Now →</span>
          </div>

          {/* Card 2: BOTW */}
          <div 
            onClick={() => setSelectedOption('botw')}
            style={{ 
              borderRadius: "20px", 
              padding: "30px", 
              border: selectedOption === 'botw' ? "3px solid #7c3aed" : "1px solid #e2e8f0",
              cursor: "pointer",
              backgroundColor: selectedOption === 'botw' ? "#faf5ff" : "#ffffff",
              transition: "all 0.3s ease"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <span style={{ fontSize: "12px", background: "#f3e8ff", color: "#6b21a8", padding: "4px 10px", borderRadius: "12px", fontWeight: "bold" }}>Registered Only</span>
              <span style={{ fontSize: "18px", fontWeight: "bold", color: "#6b21a8" }}>₦{(botwRate / 1000)}k / cycle</span>
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "10px", color: "#1e293b" }}>Business of the Week</h3>
            <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6", marginBottom: "15px" }}>
              Get featured in the premium slot of the Stories bar with a gold glowing active border for maximum community visibility.
            </p>
            <span style={{ fontSize: "14px", fontWeight: "bold", color: "#7c3aed" }}>Read Info →</span>
          </div>

          {/* Card 3: In-App Notification */}
          <div 
            style={{ 
              borderRadius: "20px", 
              padding: "30px", 
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              cursor: "not-allowed",
              opacity: 0.6
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <span style={{ fontSize: "12px", background: "#cbd5e1", color: "#475569", padding: "4px 10px", borderRadius: "12px", fontWeight: "bold" }}>Coming Soon</span>
              <span style={{ fontSize: "18px", fontWeight: "bold", color: "#475569" }}>—</span>
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "10px", color: "#94a3b8" }}>In-App Notifications</h3>
            <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.6", marginBottom: "15px" }}>
              Send highly targeted promotional push notifications directly to our active user base in Ibadan.
            </p>
            <span style={{ fontSize: "14px", fontWeight: "bold", color: "#94a3b8" }}>Unclickable</span>
          </div>

        </div>

        {/* Dynamic Forms/Explanations */}
        
        {selectedOption === 'feed-banner' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit} className={styles.form} style={{ background: "#ffffff", padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "25px", color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>Mobile Feed Banner Details</h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                <div className={styles.formGroup}>
                  <label>Your Email Address *</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    placeholder="name@example.com" 
                  />
                  <small style={{ color: "#64748b" }}>We&apos;ll send approval details and performance analytics here.</small>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Campaign Duration (Weeks) *</label>
                  <select 
                    name="weeks" 
                    value={formData.weeks} 
                    onChange={handleChange} 
                    required
                    style={{ height: "48px", borderRadius: "12px", border: "1px solid #ddd", padding: "0 10px" }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                      <option key={w} value={w}>{w} {w === 1 ? 'Week' : 'Weeks'} (₦{(weeklyRate * w).toLocaleString()})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Banner Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. 50% Off Summer Sales" 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Short Description *</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  required 
                  placeholder="Describe your promotion concisely to drive clicks..." 
                  rows={3} 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Call to Action URL *</label>
                <input 
                  type="url" 
                  name="ctaUrl" 
                  value={formData.ctaUrl} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. https://yourbusiness.com/shop" 
                />
              </div>

              {/* Image Upload Block */}
              <div className={styles.formGroup} style={{ background: "#f8fafc", padding: "25px", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "bold", color: "#1e293b" }}>
                  <FaCloudUploadAlt style={{ color: "#D22730", fontSize: "20px" }} /> Upload 2 Detailed Images *
                </label>
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp" 
                  multiple 
                  required
                  onChange={handleImageUpload} 
                  style={{ marginTop: "15px" }} 
                />
                <small style={{ display: "block", marginTop: "8px", color: "#64748b" }}>Please upload up to 2 high-quality images. Recommended format is 1:1 square or 4:3. Images are submitted only after successful payment check.</small>

                {bannerPreviews.length > 0 && (
                  <div style={{ display: "flex", gap: "15px", marginTop: "20px", flexWrap: "wrap" }}>
                    {bannerPreviews.map((preview, index) => (
                      <div key={index} style={{ position: "relative", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", width: "120px", height: "120px" }}>
                        <Image src={preview} alt={`Preview ${index + 1}`} fill style={{ objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className={styles.submitButton} 
                style={{ 
                  height: "60px", 
                  borderRadius: "16px", 
                  fontSize: "18px", 
                  fontWeight: "700", 
                  boxShadow: "0 10px 20px rgba(210, 39, 48, 0.15)", 
                  width: "100%", 
                  marginTop: "20px",
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: "10px" 
                }} 
                disabled={loading}
              >
                {loading ? 'Processing Submission...' : (
                  <>
                    <FaCreditCard /> Pay ₦{(weeklyRate * formData.weeks).toLocaleString()} with Paystack & Submit
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {selectedOption === 'botw' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ 
              background: "#ffffff", 
              padding: "40px", 
              borderRadius: "20px", 
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px rgba(0,0,0,0.02)"
            }}
          >
            <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px", color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
              <FaInfoCircle style={{ color: "#7c3aed" }} /> Business of the Week (BOTW)
            </h2>
            <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.8", marginBottom: "20px" }}>
              The <strong>Business of the Week (BOTW)</strong> is our premium advertisement slot that places your business at the very front of the horizontal Stories bar on our mobile and web homepages. It features a glowing, animated gold boundary that draws immediate customer attention.
            </p>
            
            <div style={{ background: "#faf5ff", padding: "25px", borderRadius: "16px", borderLeft: "4px solid #7c3aed", marginBottom: "30px" }}>
              <h3 style={{ fontWeight: "bold", color: "#6b21a8", marginBottom: "10px" }}>Important Notice</h3>
              <p style={{ fontSize: "14px", color: "#6b21a8", lineHeight: "1.6", margin: 0 }}>
                This advertising product is exclusively reserved for businesses already registered and verified on the Debisi platform. This ensures all featured spotlight businesses are authenticated local enterprises.
              </p>
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "15px", color: "#1e293b" }}>How the Process Works:</h3>
            <ul style={{ listStyleType: "none", padding: 0, margin: "0 0 30px 0", display: "grid", gap: "15px" }}>
              <li style={{ display: "flex", gap: "10px", fontSize: "15px", color: "#475569" }}>
                <span style={{ background: "#f3e8ff", color: "#7c3aed", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 }}>1</span>
                <span>Register a business profile or log into your existing account.</span>
              </li>
              <li style={{ display: "flex", gap: "10px", fontSize: "15px", color: "#475569" }}>
                <span style={{ background: "#f3e8ff", color: "#7c3aed", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 }}>2</span>
                <span>Complete the basic verification process on your merchant dashboard to receive your verified badge.</span>
              </li>
              <li style={{ display: "flex", gap: "10px", fontSize: "15px", color: "#475569" }}>
                <span style={{ background: "#f3e8ff", color: "#7c3aed", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 }}>3</span>
                <span>We send out a notification to register, and the first 8 eligible businesses to register and complete payment are selected.</span>
              </li>
              <li style={{ display: "flex", gap: "10px", fontSize: "15px", color: "#475569" }}>
                <span style={{ background: "#f3e8ff", color: "#7c3aed", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 }}>4</span>
                <span>Applications close every Friday. Approved weekly features run from Sunday morning to Saturday night.</span>
              </li>
            </ul>

            <button 
              onClick={() => window.location.href = '/login'}
              style={{ 
                background: "linear-gradient(to right, #7c3aed, purple)", 
                color: "white", 
                padding: "14px 28px", 
                borderRadius: "12px", 
                fontWeight: "bold",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(124, 58, 237, 0.15)"
              }}
            >
              Login to Your Dashboard
            </button>
          </motion.div>
        )}

        <div style={{ marginTop: "30px", textAlign: "center", color: "#999", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <FaCheckCircle style={{ color: "#10b981" }} /> 100% Secure Checkout via Paystack Payment Gateway
        </div>
      </div>
      <ScrollFooterWrapper />
      <Footer />
    </div>
  );
};

export default RequestAd;
