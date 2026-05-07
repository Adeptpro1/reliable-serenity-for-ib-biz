import React, { useState, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@apollo/client';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { GET_MY_WALLET } from '@/api/queries/user/wallet';
import {
  SUBMIT_BUSINESS_VERIFICATION,
  UPLOAD_VERIFICATION_DOCUMENT
} from '@/api/mutations/business/business';
import { toast } from 'react-hot-toast';

function BusinessVerification({ userData }) {
  const { user } = useAuth();
  const userBusinesses = useMemo(() => user?.businesses || [], [user?.businesses]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [certificationType, setCertificationType] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState({
    cacCertificate: null,
    memoOfAssociation: null,
    letterhead: null,
    cheque: null,
  });

  const fileInputRefs = {
    cacCertificate: useRef(null),
    memoOfAssociation: useRef(null),
    letterhead: useRef(null),
    cheque: useRef(null),
  };

  const [submitVerification, { loading, error }] = useMutation(SUBMIT_BUSINESS_VERIFICATION);
  const [uploadDocument] = useMutation(UPLOAD_VERIFICATION_DOCUMENT);
  const { data: walletData } = useQuery(GET_MY_WALLET);

  const walletBalance = walletData?.myWallet?.balance || 0;
  const VERIFICATION_FEE = 50000;

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
  const ALLOWED_PDF_TYPES = ['application/pdf'];

  const isUploading = Object.values(uploadProgress).some(status => status === 'uploading');

  // Set default business if user has businesses
  React.useEffect(() => {
    if (userBusinesses && userBusinesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(userBusinesses[0].id);
    }
  }, [userBusinesses, selectedBusinessId]);

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

    setUploadProgress(prev => ({ ...prev, [fileType]: 'uploading' }));

    try {
      const { data } = await uploadDocument({
        variables: {
          file,
          type: fileType
        }
      });

      setUploadedFiles(prev => ({
        ...prev,
        [fileType]: {
          url: data.uploadVerificationDocument.url,
          filename: data.uploadVerificationDocument.filename,
          originalName: file.name
        }
      }));

      setUploadProgress(prev => ({ ...prev, [fileType]: 'completed' }));
    } catch (err) {
      console.error(err);
      if (err.message.includes("network-request-failed") || err.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error('Failed to upload file. Try again.');
      }
      setUploadProgress(prev => ({ ...prev, [fileType]: 'error' }));
    }
  };

  const removeFile = (fileType) => {
    setUploadedFiles(prev => ({ ...prev, [fileType]: null }));
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

    const required = certificationType === 'LIMITED' 
      ? ['cacCertificate', 'memoOfAssociation', 'letterhead', 'cheque']
      : ['cacCertificate'];
    const missing = required.filter(key => !uploadedFiles[key]);
    if (missing.length > 0) {
      toast.error(`Missing documents: ${missing.join(', ')}`);
      return;
    }

    if (walletBalance < VERIFICATION_FEE) {
      if (confirm(`Insufficient wallet balance. You need ₦${VERIFICATION_FEE.toLocaleString()} but have ₦${walletBalance.toLocaleString()}. Go to wallet to fund?`)) {
        window.location.href = `/dashboard/${userData?.id}?tab=Wallet`;
      }
      return;
    }

    const input = {
      businessId: selectedBusinessId,
      ...formData,
      cacCertificateUrl: uploadedFiles.cacCertificate?.url,
      memoOfAssociationUrl: uploadedFiles.memoOfAssociation?.url,
      letterheadUrl: uploadedFiles.letterhead?.url,
      chequeUrl: uploadedFiles.cheque?.url,
      paymentAmount: 50000,
    };

    setIsSubmitting(true);
    try {
      await submitVerification({ variables: { input } });
      toast.success('Verification submitted successfully!');
      setUploadedFiles({
        cacCertificate: null,
        memoOfAssociation: null,
        letterhead: null,
        cheque: null,
      });
    } catch (err) {
      console.error(err);
      if (err.message.includes("network-request-failed") || err.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error('Submission failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderUploadField = (fileType, label, description, accept) => (
    <div className="file-upload-section">
      <label className="file-upload-label">{label} *</label>

      {uploadedFiles[fileType] ? (
        <div className="uploaded-file-display">
          {uploadedFiles[fileType].url.match(/\.(jpe?g|png|gif)$/i) ? (
            <Image
              src={uploadedFiles[fileType].url}
              alt="Uploaded"
              width={80}
              height={80}
              className="file-image"
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
            <p className="file-name">{uploadedFiles[fileType].originalName}</p>
            <p className="file-status">Uploaded</p>
          </div>
          <button onClick={() => removeFile(fileType)} className="remove-file-btn" type="button">
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

      {uploadProgress[fileType] === 'uploading' && <p className="upload-status uploading">Uploading...</p>}
      {uploadProgress[fileType] === 'error' && <p className="upload-status error">Upload failed. Try again.</p>}
    </div>
  );

  // Show loading or no businesses message
  if (!user) {
    return (
      <div className="verification-container">
        <div className="loading-message">Loading user data...</div>
      </div>
    );
  }

  if (userBusinesses.length === 0) {
    return (
      <div className="verification-container">
        <div className="no-businesses-message" style={{ textAlign: 'center' }}>
          <h2 className="verification-title">Business Verification</h2>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏢</div>
          <p>You need to register a business first before you can verify it.</p>
          <p>Please register a business and then return to this page.</p>
          <div style={{ marginTop: '16px' }}>
           <Link href={`/dashboard/${userData?.id}`}><button
            style={{
              padding: '10px 20px',
              backgroundColor: 'linear-gradient(to right, purple, #D22730)',
              background: 'linear-gradient(to right, purple, #D22730)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Register Business
          </button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-container">
      <h2 className="verification-title">Business Verification</h2>
      <p className="verification-subtitle">Verification Fee: ₦50,000</p>

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
                {userBusinesses.map(business => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
              {!selectedBusinessId && <p className="error-message">Please select a business to verify</p>}
            </div>
          </div>
        </div>

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

        {/* Bank Details */}
        <div className="form-section">
          <h3 className="section-title">Bank Details</h3>
          <div className="form-grid">
            <div className="form-field">
              <label className="field-label">Bank Name *</label>
              <input {...register('bankName', { required: 'Required' })} className="form-input" />
              {errors.bankName && <p className="error-message">{errors.bankName.message}</p>}
            </div>
            <div className="form-field">
              <label className="field-label">Account Number *</label>
              <input
                {...register('accountNumber', {
                  required: 'Required',
                  pattern: { value: /^\d{10}$/, message: 'Must be 10 digits' }
                })}
                className="form-input"
              />
              {errors.accountNumber && <p className="error-message">{errors.accountNumber.message}</p>}
            </div>
            <div className="form-field">
              <label className="field-label">Account Name *</label>
              <input {...register('accountName', { required: 'Required' })} className="form-input" />
              {errors.accountName && <p className="error-message">{errors.accountName.message}</p>}
            </div>
            <div className="form-field">
              <label className="field-label">Account Type *</label>
              <select {...register('accountType', { required: 'Required' })} className="form-select">
                <option value="">Select type</option>
                <option value="SAVINGS">Savings</option>
                <option value="CURRENT">Current</option>
                <option value="CORPORATE">Corporate</option>
              </select>
              {errors.accountType && <p className="error-message">{errors.accountType.message}</p>}
            </div>
          </div>
        </div>

        {/* File Uploads */}
        <div className="form-section">
          <h3 className="section-title">Upload Documents</h3>
          <div className="file-uploads-grid">
            {renderUploadField('cacCertificate', 'CAC Certificate', 'Upload your CAC Certificate (PDF or image, max 10MB)', 'image/*,application/pdf')}
            {certificationType === 'LIMITED' && (
              <>
                {renderUploadField('memoOfAssociation', 'Memo of Association', 'Upload your Memorandum of Association (PDF or image, max 10MB)', 'image/*,application/pdf')}
                {renderUploadField('letterhead', 'Letterhead Sample', 'Upload your company letterhead sample (Image only, max 10MB)', 'image/*')}
                {renderUploadField('cheque', 'Cheque Sample', 'Upload a cancelled cheque sample (Image only, max 10MB)', 'image/*')}
              </>
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

        {error && <p className="error-text">Error: {error.message}</p>}
      </form>

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
