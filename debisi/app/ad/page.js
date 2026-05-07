"use client"
import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@apollo/client';
import { REQUEST_AD } from '@/api/queries/business/ads';
import { UPLOAD_IMAGE } from '@/api/mutations/common';
import PaystackPop from '@paystack/inline-js'
import Image from 'next/image';
import Footer from '../../components/layoutComponents/Footer';
import ScrollFooterWrapper from '@/components/layoutComponents/ScrollFooterWrapper';
import styles from "../RequestAd.module.css";
import DynamicHeader from '@/components/layoutComponents/DynamicHeader';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaBullhorn, FaCreditCard, FaCloudUploadAlt } from 'react-icons/fa';

const adTypes = [
  {
    id: 'web-banner',
    label: 'Web Banner',
    pricing: [
      { id: 'basic', label: 'Basic', price: 5000, duration: '1 week', features: ['Standard banner placement', 'Basic analytics'] },
      { id: 'premium', label: 'Premium', price: 15000, duration: '2 weeks', features: ['Premium placement', 'Advanced analytics', 'A/B testing'] },
      { id: 'enterprise', label: 'Enterprise', price: 50000, duration: '1 month', features: ['Multiple placements', 'Priority support', 'Custom design'] },
    ],
  },
  // {
  //   id: 'email',
  //   label: 'Email Marketing',
  //   pricing: [
  //     { id: 'starter', label: 'Starter', price: 10000, duration: '1 campaign', features: ['Up to 1,000 recipients', 'Basic templates'] },
  //     { id: 'growth', label: 'Growth', price: 25000, duration: '1 campaign', features: ['Up to 5,000 recipients', 'Custom templates', 'Detailed analytics'] },
  //   ],
  // },
  // {
  //   id: 'whatsapp',
  //   label: 'WhatsApp Marketing',
  //   pricing: [
  //     { id: 'starter', label: 'Starter', price: 15000, duration: '100 messages', features: ['Text & image messages', 'Basic analytics'] },
  //     { id: 'business', label: 'Business', price: 35000, duration: '500 messages', features: ['Rich media support', 'Chat automation'] },
  //   ],
  // },
  {
    id: 'notification',
    label: 'In-App Notification',
    pricing: [
      { id: 'basic', label: 'Basic', price: 3000, duration: '1 week', features: ['Simple notifications', 'Basic targeting'] },
      { id: 'pro', label: 'Pro', price: 8000, duration: '2 weeks', features: ['Rich notifications', 'Advanced targeting', 'Analytics'] },
    ],
  },
];

const bannerSpecs = {
  'web-banner': { width: 728, height: 90, maxSize: 2, formats: ['image/jpeg', 'image/png', 'image/webp'], required: true },
  'email': { width: 600, height: 200, maxSize: 1, formats: ['image/jpeg', 'image/png'], required: true },
  'whatsapp': { width: 600, height: 400, maxSize: 5, formats: ['image/jpeg', 'image/png', 'image/gif'], required: true }
};

const RequestAd = () => {
  const { success, error: toastError } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    adType: '',
    pricingTier: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [selectedAdType, setSelectedAdType] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [charCount, setCharCount] = useState(0);

  const [uploadImage] = useMutation(UPLOAD_IMAGE);
  const [requestAdMutation] = useMutation(REQUEST_AD);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}`.trim() || '',
        email: user.email || '',
        company: user.businesses?.[0]?.name || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'adType') {
      setSelectedAdType(adTypes.find(type => type.id === value));
      setBannerImage(null);
      setBannerPreview('');
      setMessageContent('');
      setCharCount(0);
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    const debisiUrl = ' https://debisi.com';
    const totalLength = value.length + debisiUrl.length;
    
    if (totalLength <= 350) {
      setMessageContent(value);
      setCharCount(totalLength);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBannerImage(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const onSuccess = async (reference) => {
    setLoading(true);
    try {
      let imageUrl = '';
      if (bannerImage) {
        const { data: uploadData } = await uploadImage({ variables: { file: bannerImage } });
        imageUrl = uploadData.uploadImage;
      }

      const selectedType = adTypes.find(type => type.id === formData.adType);
      const selectedPricing = selectedType?.pricing.find(tier => tier.id === formData.pricingTier);

      await requestAdMutation({
        variables: {
          input: {
            businessId: user?.businesses?.[0]?.id || null,
            type: formData.adType.toUpperCase().replace(/-/g, '_'),
            title: `${formData.company} - ${selectedType.label}`,
            image: imageUrl,
            message: messageContent || formData.message,
            amount: parseFloat(selectedPricing.price),
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default 1 week
          }
        }
      });

      if (isAuthenticated) {
        success('Payment successful! Your ad request has been submitted. Check your dashboard for status updates.');
      } else {
        success('Payment successful! Our team will get back to you via the contact details provided.');
      }

      // Reset
      setFormData({ name: '', email: '', company: '', adType: '', pricingTier: '', message: '' });
      setSelectedAdType(null);
      setBannerImage(null);
      setBannerPreview('');
      setMessageContent('');
    } catch (err) {
      console.error(err);
      toastError('An error occurred while saving your request. Our team will contact you.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedType = adTypes.find(type => type.id === formData.adType);
      const selectedPricing = selectedType?.pricing.find(tier => tier.id === formData.pricingTier);

      if (!selectedPricing) throw new Error('Please select a pricing tier');
      if (bannerSpecs[formData.adType]?.required && !bannerImage) throw new Error('Please upload a banner image');

      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: formData.email,
        amount: selectedPricing.price * 100,
        onSuccess: (transaction) => onSuccess(transaction),
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
    <div style={{ backgroundColor: "#fcfcfc", minHeight: "100vh" }}>
      <DynamicHeader />
      <div className={styles.container} style={{ maxWidth: "1000px", margin: "40px auto", width: "92%", borderRadius: "24px", padding: "clamp(20px, 5vw, 40px)" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 className={styles.title} style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: "800", marginBottom: "10px" }}>Expand Your Reach</h1>
          <p style={{ color: "#666", fontSize: "16px" }}>Choose the perfect advertising solution to grow your business with Debisi NG.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div style={{ display: "grid", gap: "25px" }}>
            <div className={styles.formGroup}>
              <label>Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
            </div>
            <div className={styles.formGroup}>
              <label>Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Company Name *</label>
            <input type="text" name="company" value={formData.company} onChange={handleChange} required placeholder="Your Business Name" />
          </div>

          <div className={styles.formGroup}>
            <label>Advertisement Type *</label>
            <select name="adType" value={formData.adType} onChange={handleChange} required style={{ height: "50px", borderRadius: "12px" }}>
              <option value="">Select Ad Type</option>
              {adTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>

          {selectedAdType && (
            <div className={styles.pricingTiers} style={{ marginTop: "20px" }}>
              <label className={styles.pricingLabel} style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>Choose Your Plan</label>
              <div className={styles.tierCards} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                {selectedAdType.pricing.map((tier) => (
                  <motion.div
                    key={tier.id}
                    whileHover={{ translateY: -5 }}
                    className={`${styles.tierCard} ${formData.pricingTier === tier.id ? styles.selectedTier : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, pricingTier: tier.id }))}
                    style={{ borderRadius: "20px", padding: "25px", border: formData.pricingTier === tier.id ? "2px solid #D22730" : "2px solid #f0f0f0" }}
                  >
                    <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{tier.label}</h3>
                    <div className={styles.price} style={{ fontSize: "28px", color: "#111" }}>₦{tier.price.toLocaleString()}</div>
                    <div className={styles.duration}>{tier.duration}</div>
                    <ul className={styles.features}>
                      {tier.features.map((feature, index) => (
                        <li key={index} style={{ fontSize: "13px" }}>{feature}</li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {selectedAdType && bannerSpecs[selectedAdType.id] && (
            <div className={styles.formGroup} style={{ background: "#f9fafb", padding: "25px", borderRadius: "20px", border: "1px dashed #ddd" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaCloudUploadAlt style={{ color: "#D22730" }} /> Upload Creative Asset
              </label>
              <input type="file" accept={bannerSpecs[selectedAdType.id].formats.join(',')} onChange={handleImageUpload} style={{ marginTop: "15px" }} />
              {bannerPreview && (
                <div className={styles.bannerPreview} style={{ marginTop: "20px" }}>
                  <Image src={bannerPreview} alt="Preview" width={300} height={100} style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", maxWidth: "100%", height: "auto" }} />
                </div>
              )}
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Additional Details</label>
            <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Describe your goals for this campaign..." rows={4} style={{ borderRadius: "12px" }} />
          </div>

          <button type="submit" className={styles.submitButton} style={{ height: "60px", borderRadius: "16px", fontSize: "18px", fontWeight: "700", boxShadow: "0 10px 20px rgba(210, 39, 48, 0.2)", width: "100%" }} disabled={true}>
            {loading ? 'Processing Request...' : (
              // <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              //   <FaCreditCard /> Secure Checkout with Paystack
              // </span>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <FaCreditCard /> Secure Checkout(Soon!)
              </span>
            )}
          </button>
        </form>
        
        <div style={{ marginTop: "30px", textAlign: "center", color: "#999", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <FaCheckCircle style={{ color: "#10b981" }} /> 100% Secure Transaction & Fraud Protection
        </div>
      </div>
      <ScrollFooterWrapper />
      <Footer />
    </div>
  );
};

export default RequestAd;
