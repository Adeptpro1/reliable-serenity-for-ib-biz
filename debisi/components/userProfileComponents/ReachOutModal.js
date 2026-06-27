import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { FiUpload, FiTrash2, FiInfo, FiAlertCircle } from "react-icons/fi";
import { CREATE_REACH_OUT } from "@/graphql/mutations/business/reachout";
import { UPLOAD_IMAGE } from "@/graphql/mutations/common";
import { toast } from "react-hot-toast";
import Modal from "../otherComponents/Modal";

const GET_BUSINESS_DETAILS = gql`
  query GetBusinessDetails($id: ID!) {
    business(id: $id) {
      id
      name
      followerCount
    }
  }
`;

const GET_MY_WALLET = gql`
  query GetMyWallet {
    myWallet {
      id
      balance
    }
  }
`;

const ReachOutModal = ({ userData, onClose }) => {
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [isImmediate, setIsImmediate] = useState(true);
  const [scheduledTime, setScheduledTime] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const businesses = useMemo(() => userData?.businesses || [], [userData?.businesses]);

  // Set default business if available
  useEffect(() => {
    if (businesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(businesses[0].id);
    }
  }, [businesses, selectedBusinessId]);

  // Query selected business details (followerCount)
  const { data: bizData } = useQuery(GET_BUSINESS_DETAILS, {
    variables: { id: selectedBusinessId },
    skip: !selectedBusinessId,
    fetchPolicy: "cache-and-network",
  });

  // Query wallet balance
  const { data: walletData, refetch: refetchWallet } = useQuery(GET_MY_WALLET, {
    fetchPolicy: "network-only",
  });

  const [createReachOut, { loading: submitting }] = useMutation(CREATE_REACH_OUT);
  const [uploadImageMutation] = useMutation(UPLOAD_IMAGE);

  const followerCount = bizData?.business?.followerCount || 0;
  const walletBalance = walletData?.myWallet?.balance || 0;

  // Cost calculation
  const cost = useMemo(() => {
    if (followerCount <= 1000) return 3000;
    if (followerCount <= 5000) return 5000;
    return 10000;
  }, [followerCount]);

  const hasSufficientBalance = walletBalance >= cost;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadedImages.length >= 2) {
      toast.error("You can upload a maximum of 2 images.");
      return;
    }

    setUploadingImage(true);
    try {
      const { data } = await uploadImageMutation({
        variables: { file },
      });
      if (data?.uploadImage) {
        setUploadedImages((prev) => [...prev, data.uploadImage]);
        toast.success("Image uploaded successfully!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!selectedBusinessId) {
      toast.error("Please select a business.");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a campaign title.");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a description.");
      return;
    }
    if (!isImmediate && !scheduledTime) {
      toast.error("Please select a scheduled delivery time.");
      return;
    }
    if (!hasSufficientBalance) {
      toast.error("Insufficient wallet balance. Please fund your wallet.");
      return;
    }

    const deliveryTime = isImmediate ? new Date().toISOString() : new Date(scheduledTime).toISOString();

    try {
      await createReachOut({
        variables: {
          input: {
            businessId: selectedBusinessId,
            title: title.trim(),
            description: description.trim(),
            images: uploadedImages,
            callToActionUrl: ctaUrl.trim() || null,
            deliveryTime,
            isImmediate,
          },
        },
      });
      toast.success("Reach out campaign submitted successfully!");
      refetchWallet();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to submit reach out campaign.");
    }
  };

  return (
    <Modal title="Reach Out to Followers" onClose={onClose}>
      <p className="text-xs text-slate-400 -mt-2 mb-4">
        Send a beautiful email campaign to your followers.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
          {/* Business Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Select Business
            </label>
            <select
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-700 outline-none focus:border-purple-500 transition-colors"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Info Cards */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Follower Count
              </span>
              <span className="text-base font-extrabold text-slate-700 mt-0.5">
                {followerCount.toLocaleString()} {followerCount === 1 ? "follower" : "followers"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Campaign Fee
              </span>
              <span className="text-base font-extrabold text-purple-700 mt-0.5">
                ₦{cost.toLocaleString()}
              </span>
            </div>
            <div className="col-span-2 border-t border-slate-200/60 pt-2.5 mt-1.5 flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-400">Wallet Balance:</span>
              <span className={hasSufficientBalance ? "text-emerald-600" : "text-rose-600 font-bold"}>
                ₦{walletBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Balance warning */}
          {!hasSufficientBalance && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-2xl p-3.5 text-rose-700 text-xs font-semibold leading-relaxed">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span>Insufficient wallet balance. You need NGN {cost.toLocaleString()} to send this campaign. Please go to Wallet & Billing to fund your wallet.</span>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Campaign Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Special Weekend Discount! 🎉"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold placeholder-slate-400 outline-none focus:border-purple-500 transition-colors text-slate-700"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Campaign Description / Message
            </label>
            <textarea
              required
              rows={4}
              placeholder="Write the content of the email campaign here. Introduce your offer, new items, or announcement in detail."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold placeholder-slate-400 outline-none focus:border-purple-500 transition-colors text-slate-700 resize-none"
            />
          </div>

          {/* Call to Action URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Call to Action Link (Optional)
            </label>
            <input
              type="url"
              placeholder="e.g. https://debisi.ng/your-business/showroom"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold placeholder-slate-400 outline-none focus:border-purple-500 transition-colors text-slate-700"
            />
          </div>

          {/* Delivery Options */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Delivery Schedule
            </label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                <input
                  type="radio"
                  checked={isImmediate}
                  onChange={() => setIsImmediate(true)}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-slate-300"
                />
                Immediate (up to 24 hours)
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                <input
                  type="radio"
                  checked={!isImmediate}
                  onChange={() => setIsImmediate(false)}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-slate-300"
                />
                Schedule Time
              </label>
            </div>

            {!isImmediate && (
              <input
                type="datetime-local"
                required={!isImmediate}
                min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)}
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-700 outline-none focus:border-purple-500"
              />
            )}
          </div>

          {/* Image Uploads */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Upload Images (Max 2)
            </label>
            <div className="flex flex-wrap gap-3 mt-1">
              {/* Thumbnails */}
              {uploadedImages.map((url, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group flex-shrink-0"
                >
                  <img src={url} alt="Campaign uploaded" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}

              {/* Upload Trigger */}
              {uploadedImages.length < 2 && (
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-purple-500 bg-slate-50 hover:bg-purple-50/20 flex flex-col items-center justify-center cursor-pointer transition-colors flex-shrink-0 relative">
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                  ) : (
                    <>
                      <FiUpload className="text-slate-400 hover:text-purple-500 text-lg" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        Add
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Refund Notice Disclaimer */}
          <div className="flex items-start gap-2 bg-slate-50 border border-slate-200/60 rounded-2xl p-3 text-slate-500 text-[11px] leading-relaxed font-semibold">
            <FiInfo className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
            <span>
              Disclaimer: If the admin rejects your reach-out request, you will receive a notification to correct the reasons and retry, but <strong>no refund</strong> will be issued.
            </span>
          </div>

          {/* Footer Actions */}
          <div
            className="flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-200"
            style={{ paddingTop: "15px", marginTop: "15px" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm font-medium"
              style={{ padding: "10px 16px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingImage || !hasSufficientBalance}
              className="w-full sm:w-auto text-white rounded hover:opacity-90 text-sm font-semibold flex justify-center items-center"
              style={{
                padding: "10px 18px",
                background: "linear-gradient(to right, #7c3aed, #db2777)",
                cursor: submitting || uploadingImage || !hasSufficientBalance ? "not-allowed" : "pointer",
                opacity: submitting || uploadingImage || !hasSufficientBalance ? 0.6 : 1,
              }}
            >
              {submitting ? "Submitting..." : "Submit Campaign"}
            </button>
          </div>
        </form>
    </Modal>
  );
};

export default ReachOutModal;
