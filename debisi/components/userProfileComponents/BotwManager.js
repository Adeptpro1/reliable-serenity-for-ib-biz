"use client";

import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { FaStar, FaCheckCircle, FaClock, FaBan, FaRocket, FaTrophy } from "react-icons/fa";
import {
  GET_ACTIVE_BOTW_CYCLE,
  GET_BOTW_ELIGIBILITY,
  GET_MY_BOTW_APPLICATION,
  APPLY_FOR_BOTW,
  VERIFY_BOTW_PAYMENT,
} from "@/api/queries/botw";
import toast from "react-hot-toast";

// ─── Eligibility reason messages ─────────────────────────────────────────────
const REASON_MESSAGES = {
  NOT_VERIFIED: "Your business must be verified to apply for Business of the Week.",
  PROFILE_INCOMPLETE: "Complete your profile first — add a logo, address, description, and a contact link.",
  NOT_ACTIVE: "Your business needs recent activity (posts, visits, uploads) in the last 7 days.",
  SPOTS_FULL: "All 8 spots are filled for this week. Check back next Friday!",
  ALREADY_APPLIED: "You have already applied for this week. Check back next Friday.",
};

// ─── Status display ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const config = {
    PENDING_PAYMENT: { color: "#f59e0b", bg: "#fef3c7", icon: <FaClock />, label: "Pending Payment" },
    PAID: { color: "#6366f1", bg: "#eef2ff", icon: <FaClock />, label: "Under Review" },
    APPROVED: { color: "#22c55e", bg: "#f0fdf4", icon: <FaCheckCircle />, label: "Business of the Week 🎉" },
    EXPIRED: { color: "#6b7280", bg: "#f3f4f6", icon: <FaBan />, label: "Ended" },
  };
  const c = config[status] || config.EXPIRED;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "999px", background: c.bg, color: c.color, fontWeight: 600, fontSize: "14px" }}>
      {c.icon} {c.label}
    </span>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const BotwManager = ({ userData }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ref = searchParams.get("botwRef");

  // Fetch the currently open cycle
  const { data: cycleData, loading: cycleLoading } = useQuery(GET_ACTIVE_BOTW_CYCLE);
  const cycle = cycleData?.activeBotwCycle;

  // User businesses — pick the first verified one (or the one in the URL param)
  const businesses = userData?.businesses || [];
  const verifiedBusiness = businesses.find((b) => b.isVerified) || businesses[0];
  const businessId = verifiedBusiness?.id;

  // Eligibility check
  const { data: eligData, loading: eligLoading } = useQuery(GET_BOTW_ELIGIBILITY, {
    variables: { businessId, cycleId: cycle?.id },
    skip: !businessId || !cycle?.id,
  });
  const elig = eligData?.botwEligibility;

  // Existing application
  const { data: appData, loading: appLoading, refetch: refetchApp } = useQuery(GET_MY_BOTW_APPLICATION, {
    variables: { businessId, cycleId: cycle?.id },
    skip: !businessId || !cycle?.id,
  });
  const application = appData?.myBotwApplication;

  // Mutations
  const [applyForBotw, { loading: applying }] = useMutation(APPLY_FOR_BOTW);
  const [verifyBotwPayment, { loading: verifying }] = useMutation(VERIFY_BOTW_PAYMENT);

  // ── Paystack callback: verify payment on return ───────────────────────────
  useEffect(() => {
    if (!ref) return;

    const verify = async () => {
      try {
        await verifyBotwPayment({ variables: { reference: ref } });
        toast.success("Application received! You will be notified by Saturday if selected as Business of the Week.");
        // Clean the ref from the URL without a full reload
        router.replace(window.location.pathname + "?tab=botw");
        refetchApp();
      } catch (err) {
        toast.error(err.message || "Payment verification failed. Please contact support.");
      }
    };

    verify();
  }, [ref]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Apply handler ─────────────────────────────────────────────────────────
  const handleApply = async () => {
    if (!businessId || !cycle?.id) return;
    try {
      const callbackUrl = `${window.location.origin}/dashboard/${userData?.id}?tab=botw&botwRef=BOTW_REF_PLACEHOLDER`;
      const { data } = await applyForBotw({
        variables: { businessId, cycleId: cycle.id, callbackUrl },
      });
      const url = data?.applyForBotw;
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const isLoading = cycleLoading || eligLoading || appLoading;

  return (
    <div style={{ maxWidth: "680px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <div style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: "12px", padding: "10px", color: "white" }}>
            <FaTrophy size={20} />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Business of the Week</h2>
        </div>
        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
          Get featured on the Debisi homepage for 7 days. Applications open every <strong>Friday</strong>, winners announced every <strong>Saturday</strong>.
        </p>
      </div>

      {isLoading ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8" }}>Loading...</div>
      ) : (
        <>
          {/* No open cycle */}
          {!cycle && (
            <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "16px", padding: "40px 32px", textAlign: "center" }}>
              <FaStar size={32} style={{ color: "#f59e0b", marginBottom: "16px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>Applications Open Every Friday</h3>
              <p style={{ color: "#64748b", fontSize: "14px" }}>
                Come back this Friday to apply for Business of the Week.
                Make sure your profile is complete and your business has recent activity!
              </p>
            </div>
          )}

          {/* Open cycle — show status or apply */}
          {cycle && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Cycle info banner */}
              <div style={{ background: "linear-gradient(135deg, #fef3c7, #fffbeb)", border: "1px solid #fcd34d", borderRadius: "14px", padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <p style={{ fontWeight: 700, color: "#92400e", fontSize: "15px", margin: "0 0 4px" }}>⭐ Applications Open This Week</p>
                    <p style={{ color: "#b45309", fontSize: "13px", margin: 0 }}>
                      Week: {new Date(cycle.weekStart).toLocaleDateString("en-NG", { month: "short", day: "numeric" })} – {new Date(cycle.weekEnd).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 700, color: "#92400e", fontSize: "20px", margin: "0 0 2px" }}>{cycle.spotsRemaining}<span style={{ fontSize: "13px", fontWeight: 400 }}> / 8</span></p>
                    <p style={{ color: "#b45309", fontSize: "12px", margin: 0 }}>spots remaining</p>
                  </div>
                </div>
              </div>

              {/* Existing application */}
              {application && (
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px" }}>
                  <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "16px", margin: "0 0 12px" }}>Your Application</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 4px" }}>Business</p>
                      <p style={{ fontWeight: 600, color: "#1e293b", fontSize: "15px", margin: 0 }}>{application.business?.name}</p>
                    </div>
                    <StatusBadge status={application.status} />
                  </div>

                  {application.status === "PAID" && (
                    <div style={{ marginTop: "16px", padding: "12px 16px", background: "#eef2ff", borderRadius: "10px", fontSize: "13px", color: "#4f46e5" }}>
                      ✅ Payment confirmed. Admin reviews applications every Saturday. You will receive a notification once results are out.
                    </div>
                  )}

                  {application.status === "APPROVED" && (
                    <div style={{ marginTop: "16px", padding: "12px 16px", background: "#f0fdf4", borderRadius: "10px", fontSize: "13px", color: "#16a34a" }}>
                      🎉 Congratulations! Your business is featured on the Debisi homepage this week. Feature ends {new Date(cycle.weekEnd).toLocaleDateString("en-NG", { weekday: "long", month: "short", day: "numeric" })}.
                    </div>
                  )}

                  {application.status === "PENDING_PAYMENT" && (
                    <div style={{ marginTop: "16px" }}>
                      <p style={{ fontSize: "13px", color: "#f59e0b", marginBottom: "12px" }}>Payment not completed. Continue to pay to secure your spot.</p>
                      <button
                        onClick={handleApply}
                        disabled={applying}
                        style={{ padding: "10px 24px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}
                      >
                        {applying ? "Redirecting..." : "Continue to Payment"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* No application yet — show eligibility + apply */}
              {!application && (
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "24px" }}>
                  {!verifiedBusiness ? (
                    <div style={{ textAlign: "center", padding: "24px 0" }}>
                      <FaBan size={28} style={{ color: "#ef4444", marginBottom: "12px" }} />
                      <p style={{ fontWeight: 600, color: "#1e293b", margin: "0 0 8px" }}>No Business Found</p>
                      <p style={{ color: "#64748b", fontSize: "14px" }}>You need a registered business to apply.</p>
                    </div>
                  ) : elig?.eligible ? (
                    <div>
                      <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "16px", margin: "0 0 8px" }}>Apply for Business of the Week</p>
                      <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 20px" }}>
                        Applying as <strong>{verifiedBusiness.name}</strong>. A one-time fee of <strong>₦25,000</strong> will be charged via Paystack.
                        If not selected, your spot is still confirmed for homepage visibility.
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                        <button
                          onClick={handleApply}
                          disabled={applying}
                          style={{ padding: "12px 28px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white", border: "none", borderRadius: "12px", fontWeight: 700, cursor: applying ? "not-allowed" : "pointer", fontSize: "15px", display: "flex", alignItems: "center", gap: "8px", opacity: applying ? 0.7 : 1 }}
                        >
                          <FaRocket /> {applying ? "Opening Paystack..." : "Apply — ₦25,000"}
                        </button>
                        <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>{cycle.spotsRemaining} spot{cycle.spotsRemaining !== 1 ? "s" : ""} left</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <FaBan size={18} style={{ color: "#ef4444", flexShrink: 0 }} />
                        <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "16px", margin: 0 }}>Not Eligible This Week</p>
                      </div>
                      <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                        {REASON_MESSAGES[elig?.reason] || "You are not eligible to apply at this time."}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* How it works */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px 24px" }}>
                <p style={{ fontWeight: 700, color: "#334155", fontSize: "14px", margin: "0 0 12px" }}>How It Works</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    ["📅 Friday", "Applications open for verified, active businesses"],
                    ["💳 Pay", "Pay ₦25,000 securely via Paystack (no wallet deducted)"],
                    ["✅ Saturday", "Admin selects up to 8 businesses"],
                    ["🌟 Sun – Sat", "Featured businesses appear first on the homepage"],
                  ].map(([step, desc]) => (
                    <div key={step} style={{ display: "flex", gap: "12px", fontSize: "13px" }}>
                      <span style={{ fontWeight: 700, color: "#f59e0b", minWidth: "70px" }}>{step}</span>
                      <span style={{ color: "#64748b" }}>{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BotwManager;
