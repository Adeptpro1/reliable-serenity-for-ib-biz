"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ADS_BY_BUSINESS, REQUEST_AD } from "../../api/queries/business/ads";
import { GET_MY_WALLET } from "@/api/queries/user/wallet";
import { UPLOAD_IMAGE } from "../../api/mutations/common";
import { FiPlus, FiBarChart2, FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import Modal from "../otherComponents/Modal";
import { toast } from "react-hot-toast";

const AdsManager = () => {
  const { user } = useAuth();
  const userBusinesses = useMemo(() => user?.businesses || [], [user?.businesses]);
  
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: "WEB_BANNER",
    title: "",
    imageFile: null,
    startDate: "",
    endDate: "",
    amount: 5000 // Sample constant for now
  });

  // Set default business
  useEffect(() => {
    if (userBusinesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(userBusinesses[0].id);
    }
  }, [userBusinesses, selectedBusinessId]);

  // Query ads
  const { data, loading, refetch } = useQuery(GET_ADS_BY_BUSINESS, {
    variables: { businessId: selectedBusinessId },
    skip: !selectedBusinessId,
    fetchPolicy: "network-only"
  });

  const { data: walletData } = useQuery(GET_MY_WALLET);
  const walletBalance = walletData?.myWallet?.balance || 0;

  const ads = data?.adsByBusiness || [];

  // Mutations
  const [uploadImage] = useMutation(UPLOAD_IMAGE);
  const [requestAdMutation] = useMutation(REQUEST_AD);

  const handleRequestAd = async (e) => {
    e.preventDefault();
    if (!selectedBusinessId || !formData.title || !formData.imageFile || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in all fields");
      return;
    }

    if (walletBalance < formData.amount) {
      if (confirm(`Insufficient wallet balance. You need ₦${formData.amount.toLocaleString()} but have ₦${walletBalance.toLocaleString()}. Go to wallet to fund?`)) {
        window.location.href = `/dashboard/${user?.id}?tab=Wallet`;
      }
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload image
      const { data: uploadData } = await uploadImage({
        variables: { file: formData.imageFile }
      });
      const imageUrl = uploadData.uploadImage;

      // 2. Request ad
      await requestAdMutation({
        variables: {
          input: {
            businessId: selectedBusinessId,
            type: formData.type,
            title: formData.title,
            image: imageUrl,
            startDate: formData.startDate,
            endDate: formData.endDate,
            amount: parseFloat(formData.amount)
          }
        }
      });

      toast.success("Ad request submitted successfully!");
      setShowRequestModal(false);
      setFormData({
        type: "WEB_BANNER",
        title: "",
        imageFile: null,
        startDate: "",
        endDate: "",
        amount: 5000
      });
      refetch();
    } catch (err) {
      if (err.message.includes("network-request-failed") || err.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error(err.message || "Failed to request ad");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const statusIcons = {
    AWAITING_APPROVAL: <FiClock className="text-yellow-500" />,
    APPROVED: <FiCheckCircle className="text-green-500" />,
    REJECTED: <FiXCircle className="text-red-500" />,
    PUBLISHED: <FiCheckCircle className="text-blue-500" />,
    EXPIRED: <FiXCircle className="text-gray-500" />
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Ad Manager</h2>
        {userBusinesses.length > 0 && (
          <button
            onClick={() => setShowRequestModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: 'linear-gradient(to right, purple, #D22730)',
              background: 'linear-gradient(to right, purple, #D22730)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <FiPlus /> Request Ad
          </button>
        )}
      </div>

      {userBusinesses.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Select Business</label>
          <select
            value={selectedBusinessId}
            onChange={(e) => setSelectedBusinessId(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              minWidth: '200px'
            }}
          >
            {userBusinesses.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <p>Loading ads...</p>
      ) : ads.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {ads.map(ad => (
            <div key={ad.id} style={{ 
              backgroundColor: 'white', 
              padding: '16px', 
              borderRadius: '10px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold', 
                  backgroundColor: '#f3f4f6', 
                  padding: '2px 8px', 
                  borderRadius: '4px' 
                }}>{ad.type}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                  {statusIcons[ad.status]} {ad.status.replace(/_/g, ' ')}
                </span>
              </div>
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>{ad.title}</h3>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                <p>Starts: {new Date(ad.startDate).toLocaleDateString()}</p>
                <p>Ends: {new Date(ad.endDate).toLocaleDateString()}</p>
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '16px', 
                paddingTop: '12px', 
                borderTop: '1px solid #f3f4f6' 
              }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>Impressions</p>
                  <p style={{ fontWeight: 'bold' }}>{ad.impressions || 0}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>Clicks</p>
                  <p style={{ fontWeight: 'bold' }}>{ad.clicks || 0}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>CTR</p>
                  <p style={{ fontWeight: 'bold' }}>
                    {ad.impressions ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : 0}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <FiBarChart2 size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p>No ads found for this business.</p>
          <p style={{ fontSize: '14px' }}>Submit a request to start advertising your products!</p>
        </div>
      )}

      {showRequestModal && (
        <Modal title="Request New Ad" onClose={() => !isUploading && setShowRequestModal(false)}>
          <form onSubmit={handleRequestAd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Ad Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full border rounded"
                style={{ padding: '8px' }}
              >
                <option value="WEB_BANNER">Web Banner</option>
                <option value="IN_APP_NOTIFICATION">In-App Notification</option>
                <option value="EVENTS">Events Ad</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Ad Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full border rounded"
                style={{ padding: '8px' }}
                placeholder="Summer Sale Preview"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Ad Creative (Image)</label>
              <input
                type="file"
                required
                accept="image/*"
                onChange={e => setFormData({ ...formData, imageFile: e.target.files[0] })}
                className="w-full border rounded"
                style={{ padding: '8px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Start Date</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border rounded"
                style={{ padding: '8px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>End Date</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fdf2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#991b1b' }}>Estimated Cost: ₦{formData.amount.toLocaleString()}</p>
              <p style={{ fontSize: '12px', color: '#b91c1c' }}>Your ad will be reviewed by administrators before going live.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                disabled={isUploading}
                style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isUploading ? '#ccc' : '#D22730',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px'
                }}
              >
                {isUploading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdsManager;
