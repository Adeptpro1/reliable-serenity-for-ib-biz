import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@apollo/client';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { GET_MY_WALLET } from '@/api/queries/user/wallet';
import {
  SUBMIT_BUSINESS_VERIFICATION,
  UPLOAD_VERIFICATION_DOCUMENT
} from '@/api/mutations/business/business';
import { toast } from 'react-hot-toast';
import Modal from '@/components/otherComponents/Modal';

function BusinessVerification({ userData }) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const queryBusinessId = searchParams.get('businessId');
  const userBusinesses = useMemo(() => user?.businesses || [], [user?.businesses]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [certificationType, setCertificationType] = useState('');

  const selectedBiz = useMemo(() => {
    return userBusinesses.find(b => b.id === selectedBusinessId);
  }, [selectedBusinessId, userBusinesses]);

  const selectedBizStatus = useMemo(() => {
    if (!selectedBiz) return "NONE";
    if (selectedBiz.isVerified) return "VERIFIED";
    const pending = selectedBiz.verifications?.find(v => v.status === "PENDING");
    if (pending) return "PENDING";
    return "NONE";
  }, [selectedBiz]);

  const getBusinessVerificationStatus = (business) => {
    if (business.isVerified) return "VERIFIED";
    const verifications = business.verifications || [];
    const pending = verifications.find(v => v.status === "PENDING");
    if (pending) return "PENDING";
    return "NONE";
  };
  const [localFiles, setLocalFiles] = useState({
    cacCertificate: null,
    memoOfAssociation: null,
    letterhead: null,
    cheque: null,
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formDataState, setFormDataState] = useState(null);

  const fileInputRefs = {
    cacCertificate: useRef(null),
    memoOfAssociation: useRef(null),
    letterhead: useRef(null),
    cheque: useRef(null),
  };

  const [submitVerification, { loading, error }] = useMutation(SUBMIT_BUSINESS_VERIFICATION);
  const [uploadDocument] = useMutation(UPLOAD_VERIFICATION_DOCUMENT);
  const { data: walletData, refetch: refetchWallet } = useQuery(GET_MY_WALLET);

  const walletBalance = walletData?.myWallet?.balance || 0;
  const VERIFICATION_FEE = 50000;

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
  const ALLOWED_PDF_TYPES = ['application/pdf'];

  const isUploading = Object.values(uploadProgress).some(status => status === 'uploading');

  // Set default business if user has businesses
  React.useEffect(() => {
    if (userBusinesses && userBusinesses.length > 0) {
      if (queryBusinessId && userBusinesses.some(b => b.id === queryBusinessId)) {
        setSelectedBusinessId(queryBusinessId);
      } else if (!selectedBusinessId) {
        setSelectedBusinessId(userBusinesses[0].id);
      }
    }
  }, [userBusinesses, selectedBusinessId, queryBusinessId]);

  // Prefill business details when business is changed
  React.useEffect(() => {
    const selectedBiz = userBusinesses.find(b => b.id === selectedBusinessId);
    if (selectedBiz) {
      setValue('natureOfBusiness', selectedBiz.description || '');
      
      const addressStr = selectedBiz.addresses && selectedBiz.addresses.length > 0
        ? [selectedBiz.addresses[0].address1, selectedBiz.addresses[0].address2, selectedBiz.addresses[0].town, selectedBiz.addresses[0].city].filter(Boolean).join(', ')
        : '';
      setValue('currentAddress', addressStr);
      
      setValue('primaryContactName', `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim());
      setValue('primaryContactEmail', userData?.email || '');
      setValue('primaryContactPhone', selectedBiz.phone || userData?.phone || '');
    }
  }, [selectedBusinessId, userBusinesses, userData, setValue]);

  const validateFile = (file, fileType) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Max 10MB allowed.`);
      return false;
    }

    const allowedTypes =
      ['cacCertificate', 'memoOfAssociation'].includes(fileType)
        ? [...ALLOWED_IMAGE_TYPES, ...ALLOWED_PDF_TYPES]
        : ALLOWED_IMAGE_TYPES;

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type');
      return false;
    }

    return true;
  };

  const handleFileChange = async (event, fileType) => {
    const file = event.target.files[0];
    if (!file || !validateFile(file, fileType)) return;

    setLocalFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
    setUploadProgress(prev => ({ ...prev, [fileType]: 'selected' }));
  };

  const removeFile = (fileType) => {
    setLocalFiles(prev => ({ ...prev, [fileType]: null }));
    setUploadProgress(prev => ({ ...prev, [fileType]: null }));
    if (fileInputRefs[fileType].current) {
      fileInputRefs[fileType].current.value = '';
    }
  };

  const onSubmit = async (formData) => {
    if (!selectedBusinessId) {
      toast.error('Please select a business to verify');
      return;
    }

    if (!certificationType) {
      toast.error('Please select a certification type');
      return;
    }

    const required = ['cacCertificate'];
    const missing = required.filter(key => !localFiles[key]);
    if (missing.length > 0) {
      const docLabel = certificationType === 'OTHER' ? 'ID Card / Supporting Document' : 'CAC Certificate';
      toast.error(`Please upload your ${docLabel}`);
      return;
    }

    // Save form data state and trigger payment modal
    setFormDataState(formData);
    setShowPaymentModal(true);
  };

  const executeSubmission = async () => {
    if (!formDataState) return;
    
    const fee = certificationType === 'LIMITED' ? 3000 : 1000;
    const feeKobo = fee * 100;
    
    if (walletBalance < fee) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadUrls = {};
      const filesToUpload = Object.keys(localFiles).filter(key => localFiles[key]);

      for (const fileType of filesToUpload) {
        setUploadProgress(prev => ({ ...prev, [fileType]: 'uploading' }));
        const file = localFiles[fileType];

        try {
          const { data } = await uploadDocument({
            variables: {
              file,
              type: fileType
            }
          });

          if (!data || !data.uploadVerificationDocument) {
            throw new Error('Upload failed');
          }

          uploadUrls[fileType] = data.uploadVerificationDocument.url;
          setUploadProgress(prev => ({ ...prev, [fileType]: 'completed' }));
        } catch (uploadErr) {
          console.error(uploadErr);
          setUploadProgress(prev => ({ ...prev, [fileType]: 'error' }));
          throw new Error(`Failed to upload ${fileType === 'cacCertificate' ? 'CAC Certificate' : 'document'}. Please try again.`);
        }
      }

      const input = {
        businessId: selectedBusinessId,
        ...formDataState,
        bankName: "N/A",
        accountNumber: "0000000000",
        accountName: "N/A",
        accountType: "SAVINGS",
        cacCertificateUrl: uploadUrls.cacCertificate,
        memoOfAssociationUrl: uploadUrls.memoOfAssociation || null,
        letterheadUrl: uploadUrls.letterhead || null,
        chequeUrl: uploadUrls.cheque || null,
        paymentAmount: feeKobo,
      };

      await submitVerification({ variables: { input } });
      setShowPaymentModal(false);
      setShowSuccessModal(true);
      
      // Reset form files
      setLocalFiles({
        cacCertificate: null,
        memoOfAssociation: null,
        letterhead: null,
        cheque: null,
      });
      setUploadProgress({});
      setFormDataState(null);
      refetchWallet();
    } catch (err) {
      console.error(err);
      if (err.message.includes("network-request-failed") || err.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error(err.message || 'Submission failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderUploadField = (fileType, label, description, accept) => {
    const file = localFiles[fileType];
    const progress = uploadProgress[fileType];

    return (
      <div className="file-upload-section">
        <label className="file-upload-label">{label} *</label>

        {file ? (
          <div className="uploaded-file-display">
            {file.type.startsWith('image/') ? (
              <Image
                src={URL.createObjectURL(file)}
                alt="Selected preview"
                className="file-image"
                width={80}
                height={80}
                unoptimized
              />
            ) : (
              <div className="file-pdf-icon">
                <svg className="pdf-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9v12a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            )}
            <div className="file-info">
              <p className="file-name">{file.name}</p>
              <p className="file-status" style={{ color: progress === 'completed' ? '#10b981' : progress === 'uploading' ? '#3b82f6' : '#64748b' }}>
                {progress === 'completed' ? 'Uploaded' : progress === 'uploading' ? 'Uploading...' : 'Ready to upload'}
              </p>
            </div>
            <button onClick={() => removeFile(fileType)} className="remove-file-btn" type="button" disabled={isSubmitting}>
              Remove
            </button>
          </div>
        ) : (
          <div className="file-upload-area">
            <label htmlFor={`file-${fileType}`} className="upload-link">
              Upload File
              <input
                id={`file-${fileType}`}
                ref={fileInputRefs[fileType]}
                type="file"
                className="hidden-input"
                accept={accept}
                onChange={(e) => handleFileChange(e, fileType)}
                style={{ border: '2px solid #ccc', backgroundColor: 'white', padding: '8px', marginTop: '8px', marginBottom: '4px' }}
              />
            </label>
            <p className="file-description" style={{ fontSize: '12px', color: 'purple'}}>{description}</p>
          </div>
        )}

        {progress === 'uploading' && <p className="upload-status uploading">Uploading...</p>}
        {progress === 'error' && <p className="upload-status error">Upload failed. Try again.</p>}
      </div>
    );
  };

  // Show loading or no businesses message
  if (!user) {
    return (
      <div className="verification-container">
        <div className="loading-message">Loading user data...</div>
      </div>
    );
  }

  if (!userBusinesses || userBusinesses.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          margin: "20px auto",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏢</div>
        <p
          style={{
            fontSize: "18px",
            color: "#333",
            marginBottom: "12px",
            fontWeight: 600,
          }}
        >
          No businesses found
        </p>
        <p style={{ color: "#6b7280", marginBottom: "16px" }}>
          You don&apos;t have any registered businesses yet. Register a business first before you can verify it.
        </p>
        <a href={`/dashboard/${userData?.id}`}>
          <button
            style={{
              padding: "10px 20px",
              background: "linear-gradient(to right, purple, #D22730)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Register Business
          </button>
        </a>
      </div>
    );
  }

  return (
    <div className="verification-container">
      <h2 className="verification-title">Business Verification</h2>
      <p className="verification-subtitle">Get a verified checkmark for your business name (₦1,000) or limited company (₦3,000).</p>

      <form onSubmit={handleSubmit(onSubmit)} className="verification-form">
        {/* Business Selection */}
        <div className="form-section">
          <h3 className="section-title">Select Business to Verify</h3>
          <div className="form-grid">
            <div className="form-field">
              <label className="field-label">Choose Business *</label>
              <select 
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Select a business</option>
                {userBusinesses.map(business => {
                  const status = getBusinessVerificationStatus(business);
                  const isPending = status === "PENDING";
                  const isVerified = status === "VERIFIED";
                  const isDisabled = isPending || isVerified;

                  let labelSuffix = "";
                  if (isVerified) labelSuffix = " (Already Verified)";
                  else if (isPending) labelSuffix = " (Pending Verification)";

                  return (
                    <option key={business.id} value={business.id} disabled={isDisabled}>
                      {business.name}{labelSuffix}
                    </option>
                  );
                })}
              </select>
              {!selectedBusinessId && <p className="error-message">Please select a business to verify</p>}
            </div>
          </div>
        </div>

        {selectedBizStatus === "VERIFIED" && (
          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              backgroundColor: "#eff6ff",
              border: "1px solid #bfdbfe",
              color: "#1e3a8a",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <span style={{ fontSize: "24px" }}>✅</span>
            <div>
              <p style={{ fontWeight: "700", margin: 0 }}>This business is already verified</p>
              <p style={{ fontSize: "13px", margin: "4px 0 0" }}>Your business badge is active. You do not need to submit another verification request.</p>
            </div>
          </div>
        )}

        {selectedBizStatus === "PENDING" && (
          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              backgroundColor: "#fffbeb",
              border: "1px solid #fef3c7",
              color: "#78350f",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <span style={{ fontSize: "24px" }}>⏳</span>
            <div>
              <p style={{ fontWeight: "700", margin: 0 }}>Verification Request Pending</p>
              <p style={{ fontSize: "13px", margin: "4px 0 0" }}>We have received your verification request and are currently reviewing your documents. You will be notified once reviewed.</p>
            </div>
          </div>
        )}

        {selectedBizStatus === "NONE" && (
          <>
            {/* Business Information */}
            <div className="form-section">
              <h3 className="section-title">Business Information</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label className="field-label">Business Certification Type *</label>
                  <select 
                    {...register('certificationType', { required: 'Required' })}
                    className="form-select"
                    onChange={(e) => setCertificationType(e.target.value)}
                  >
                    <option value="">Select certification type</option>
                    <option value="BUSINESS_NAME">Business Name</option>
                    <option value="LIMITED">Limited Company</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errors.certificationType && <p className="error-message">{errors.certificationType.message}</p>}
                </div>

                <div className="form-field">
                  <label className="field-label">Registration Number (RC/BN) (Optional)</label>
                  <input
                    {...register('registrationNumber')}
                    placeholder="Enter registration number if available"
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Tax Identification Number (TIN) (Optional)</label>
                  <input
                    {...register('tinNumber')}
                    placeholder="Enter TIN if available"
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Nature of Business *</label>
                  <textarea
                    {...register('natureOfBusiness', { required: 'Required' })}
                    className="form-textarea"
                    rows={3}
                  />
                  {errors.natureOfBusiness && <p className="error-message">{errors.natureOfBusiness.message}</p>}
                </div>
                <div className="form-field">
                  <label className="field-label">Business Address *</label>
                  <textarea
                    {...register('currentAddress', { required: 'Required' })}
                    className="form-textarea"
                    rows={3}
                  />
                  {errors.currentAddress && <p className="error-message">{errors.currentAddress.message}</p>}
                </div>

                <div className="form-field">
                  <label className="field-label">Primary Contact Name *</label>
                  <input
                    {...register('primaryContactName', { required: 'Required' })}
                    className="form-input"
                  />
                  {errors.primaryContactName && <p className="error-message">{errors.primaryContactName.message}</p>}
                </div>

                <div className="form-field">
                  <label className="field-label">Primary Contact Phone *</label>
                  <input
                    {...register('primaryContactPhone', {
                      required: 'Required',
                      pattern: { value: /^[0-9]{11}$/, message: 'Must be 11 digits' }
                    })}
                    className="form-input"
                  />
                  {errors.primaryContactPhone && <p className="error-message">{errors.primaryContactPhone.message}</p>}
                </div>

                <div className="form-field">
                  <label className="field-label">Primary Contact Email *</label>
                  <input
                    {...register('primaryContactEmail', {
                      required: 'Required',
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                    })}
                    className="form-input"
                    type="email"
                  />
                  {errors.primaryContactEmail && <p className="error-message">{errors.primaryContactEmail.message}</p>}
                </div>

                <div className="form-field">
                  <label className="field-label">Secondary Contact Name</label>
                  <input
                    {...register('secondaryContactName')}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Secondary Contact Phone</label>
                  <input
                    {...register('secondaryContactPhone', {
                      pattern: { value: /^[0-9]{11}$/, message: 'Must be 11 digits' }
                    })}
                    className="form-input"
                  />
                  {errors.secondaryContactPhone && <p className="error-message">{errors.secondaryContactPhone.message}</p>}
                </div>

                <div className="form-field">
                  <label className="field-label">Secondary Contact Email</label>
                  <input
                    {...register('secondaryContactEmail', {
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                    })}
                    className="form-input"
                    type="email"
                  />
                  {errors.secondaryContactEmail && <p className="error-message">{errors.secondaryContactEmail.message}</p>}
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div className="form-section">
              <h3 className="section-title">Upload Documents</h3>
              <div className="file-uploads-grid">
                {certificationType === 'OTHER' ? (
                  renderUploadField(
                    'cacCertificate',
                    'Valid ID Card / Supporting Document',
                    'Upload a valid document that represents you (Driver\'s License, National ID, Voter\'s Card, etc. PDF or image, max 10MB)',
                    'image/*,application/pdf'
                  )
                ) : (
                  renderUploadField(
                    'cacCertificate',
                    'CAC Certificate',
                    'Upload your CAC Certificate (PDF or image, max 10MB)',
                    'image/*,application/pdf'
                  )
                )}
              </div>
            </div>

            <div className="submit-section">
              <button
                type="submit"
                disabled={isSubmitting || loading || isUploading}
                className="submit-button"
              >
                {isSubmitting || loading ? 'Submitting...' : 'Submit Verification'}
              </button>
            </div>
          </>
        )}

        {error && <p className="error-text">Error: {error.message}</p>}
      </form>

      {/* Payment Modal */}
      {showPaymentModal && (
        <Modal
          title="Complete Verification Payment"
          onClose={() => setShowPaymentModal(false)}
        >
          <div style={{ padding: "8px 0" }}>
            <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "16px", lineHeight: "1.5" }}>
              Please review and confirm your payment details below to submit your business verification request.
            </p>
            <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Business:</span>
                <span style={{ fontSize: "14px", color: "#1e293b", fontWeight: "700" }}>
                  {userBusinesses.find(b => b.id === selectedBusinessId)?.name}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Type:</span>
                <span style={{ fontSize: "14px", color: "#1e293b", fontWeight: "700" }}>
                  {certificationType === 'LIMITED' ? 'Limited Company' : certificationType === 'BUSINESS_NAME' ? 'Business Name' : 'Other'}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", borderTop: "1px dashed #cbd5e1", paddingTop: "12px" }}>
                <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Fee:</span>
                <span style={{ fontSize: "16px", color: "#D22730", fontWeight: "800" }}>
                  ₦{(certificationType === 'LIMITED' ? 3000 : 1000).toLocaleString()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed #cbd5e1", paddingTop: "12px" }}>
                <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>Wallet Balance:</span>
                <span style={{ fontSize: "14px", color: walletBalance >= (certificationType === 'LIMITED' ? 3000 : 1000) ? "#10b981" : "#ef4444", fontWeight: "700" }}>
                  ₦{walletBalance.toLocaleString()}
                </span>
              </div>
            </div>

            {walletBalance >= (certificationType === 'LIMITED' ? 3000 : 1000) ? (
              <button
                onClick={executeSubmission}
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "linear-gradient(to right, purple, #D22730)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {isSubmitting ? "Processing Payment..." : `Pay ₦${(certificationType === 'LIMITED' ? 3000 : 1000).toLocaleString()} & Submit`}
              </button>
            ) : (
              <div>
                <p style={{ fontSize: "12px", color: "#ef4444", fontWeight: "600", marginBottom: "12px", textAlign: "center" }}>
                  ⚠️ Insufficient Wallet Balance. You need an additional ₦{((certificationType === 'LIMITED' ? 3000 : 1000) - walletBalance).toLocaleString()} to proceed.
                </p>
                <button
                  onClick={() => {
                    window.location.href = `/dashboard/${userData?.id}?tab=wallet`;
                  }}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#1e293b",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Fund Wallet
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <Modal
          title="Submission Successful! 🎉"
          onClose={() => setShowSuccessModal(false)}
        >
          <div style={{ padding: "8px 0", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <p style={{ fontSize: "16px", color: "#1e293b", fontWeight: "700", marginBottom: "12px" }}>
              Verification Request Received
            </p>
            <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6", marginBottom: "24px" }}>
              Your verification request has been submitted successfully! Your verification badge will be available as soon as the request is reviewed and approved. If rejected, you can review the reviewer&apos;s notes, correct the issues, and re-apply.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                width: "100%",
                padding: "12px",
                background: "linear-gradient(to right, purple, #D22730)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Okay, Got it
            </button>
          </div>
        </Modal>
      )}

      <style jsx>{`
        .verification-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .verification-title {
          font-size: 2.5rem;
          font-weight: bold;
          text-align: center;
          margin-bottom: 15px;
          background: linear-gradient(to right, purple, #D22730);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .verification-subtitle {
          font-size: 1.1rem;
          color: #666;
          text-align: center;
          margin-bottom: 40px;
          line-height: 1.6;
        }

        .verification-form {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .form-section {
          background-color: #f8f9fa;
          padding: 30px;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 25px;
          padding-bottom: 10px;
          border-bottom: 2px solid #D22730;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
        }

        .field-label {
          font-size: 0.95rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background-color: #ffffff;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: #D22730;
          box-shadow: 0 0 0 3px rgba(210, 39, 48, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .error-message {
          color: #D22730;
          font-size: 0.875rem;
          margin-top: 5px;
        }

        .file-uploads-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
          margin-top: 20px;
        }

        .file-upload-section {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }

        .file-upload-section:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .file-upload-label {
          display: block;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }

        .file-upload-area {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 25px 20px;
          border: 2px dashed #cbd5e0;
          border-radius: 12px;
          background-color: #f9fafb;
          transition: all 0.3s ease;
          gap: 12px;
          min-height: 180px;
        }

        .file-upload-area:hover {
          border-color: #D22730;
          background-color: #fef7f7;
          outline-color: #D22730;
        }

        .file-upload-area:focus-within {
          border-color: #D22730;
          outline-color: #D22730;
          box-shadow: 0 0 0 3px rgba(210, 39, 48, 0.1);
        }

        .uploaded-file-display {
          display: flex;
          align-items: center;
          width: 100%;
          gap: 15px;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background-color: #f8fafc;
          margin-top: 12px;
          transition: all 0.3s ease;
        }

        .uploaded-file-display:hover {
          background-color: #f1f5f9;
          border-color: #cbd5e0;
        }

        .file-preview {
          flex-shrink: 0;
          position: relative;
        }

        .file-image {
          width: 70px;
          height: 70px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #e1e5e9;
          background-color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .file-pdf-icon {
          width: 70px;
          height: 70px;
          background-color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #e1e5e9;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .pdf-icon {
          width: 32px;
          height: 32px;
          color: #64748b;
        }

        .file-info {
          flex: 1;
          text-align: left;
        }

        .file-name {
          font-size: 0.95rem;
          color: #333;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .file-status {
          font-size: 0.875rem;
          color: #10b981;
          font-weight: 500;
        }

        .remove-file-btn {
          background: none;
          border: none;
          color: #D22730;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .remove-file-btn:hover {
          background-color: #fef2f2;
          color: #b91c1c;
        }

        .upload-link {
          position: relative;
          cursor: pointer;
          background-color: #ffffff;
          border-radius: 6px;
          font-weight: 600;
          color: #D22730;
          padding: 12px 24px;
          border: 2px solid #D22730;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }

        .upload-link:hover {
          background-color: #D22730;
          color: #ffffff;
        }

        .hidden-input {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 2px solid #ccc;
        }

        .file-description {
          text-align: center;
          line-height: 1.5;
          max-width: 280px;
          margin: 0 auto;
        }

        .upload-status {
          margin-top: 12px;
          font-size: 0.95rem;
          font-weight: 500;
          text-align: center;
          padding: 8px 12px;
          border-radius: 6px;
          width: 100%;
        }

        .upload-status.uploading {
          color: #3b82f6;
          background-color: #eff6ff;
        }

        .upload-status.error {
          color: #D22730;
          background-color: #fef2f2;
        }

        .submit-section {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }

        .submit-button {
          background: linear-gradient(to right, purple, #D22730);
          color: #ffffff;
          padding: 15px 40px;
          border: none;
          border-radius: 10px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(210, 39, 48, 0.3);
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(210, 39, 48, 0.4);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .error-text {
          color: #D22730;
          font-size: 0.95rem;
          font-weight: 500;
          text-align: center;
          margin-top: 20px;
          padding: 15px;
          background-color: #fef2f2;
          border-radius: 8px;
          border: 1px solid #fecaca;
        }

        .loading-message {
          text-align: center;
          padding: 50px 20px;
          font-size: 1.2rem;
          color: #666;
          background-color: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .no-businesses-message {
          text-align: center;
          padding: 50px 20px;
          font-size: 1.2rem;
          color: #666;
          background-color: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .no-businesses-message p {
          margin: 10px 0;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .verification-container {
            padding: 20px 15px;
            margin: 10px;
          }

          .verification-title {
            font-size: 2rem;
          }

          .form-section {
            padding: 20px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .submit-button {
            width: 100%;
            padding: 15px 20px;
          }
        }
      `}</style>
    </div>
  );
}

export default BusinessVerification;
