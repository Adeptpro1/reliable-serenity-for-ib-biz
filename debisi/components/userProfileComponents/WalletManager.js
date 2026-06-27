"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaWallet, 
  FaPlus, 
  FaHistory, 
  FaArrowUp, 
  FaArrowDown, 
  FaBusinessTime,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from "react-icons/fa";
import { 
  GET_MY_WALLET, 
  INITIALIZE_WALLET_FUNDING, 
  VERIFY_WALLET_FUNDING,
  GET_WALLET_TRANSACTIONS 
} from "@/graphql/queries/user/wallet";
import toast from "react-hot-toast";

const WalletManager = ({ userData }) => {
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
  const [fundingAmount, setFundingAmount] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [txPage, setTxPage] = useState(0);
  const txTake = 10;

  const searchParams = useSearchParams();
  const router = useRouter();
  const [hasCheckedUrl, setHasCheckedUrl] = useState(false);

  // Queries & Mutations
  const { data: walletData, loading: walletLoading, refetch: refetchWallet } = useQuery(GET_MY_WALLET);
  
  const { data: txData, loading: txLoading, refetch: refetchTx } = useQuery(GET_WALLET_TRANSACTIONS, {
    variables: { 
      businessId: selectedBusinessId, 
      pagination: { skip: txPage * txTake, take: txTake } 
    }
  });

  const [initializeFunding] = useMutation(INITIALIZE_WALLET_FUNDING);
  const [verifyFunding] = useMutation(VERIFY_WALLET_FUNDING);

  const wallet = walletData?.myWallet;
  const transactions = txData?.walletTransactions || [];
  const businesses = userData?.businesses || [];

  // Automatically verify when returning from payment callback
  useEffect(() => {
    const ref = searchParams.get("reference") || searchParams.get("trxref");
    if (ref && !hasCheckedUrl) {
      setHasCheckedUrl(true);
      
      toast.promise(
        verifyFunding({ variables: { reference: ref } }),
        {
          loading: "Verifying your payment...",
          success: () => {
            refetchWallet();
            refetchTx();
            // Clean up URL query parameters
            const params = new URLSearchParams(window.location.search);
            params.delete("reference");
            params.delete("trxref");
            const newQuery = params.toString() ? `?${params.toString()}` : "";
            router.replace(`${window.location.pathname}${newQuery}`);
            return "Wallet funded successfully!";
          },
          error: (err) => {
            console.error("Verification error:", err);
            return err.message || "Verification failed. If you paid, it will reflect shortly.";
          }
        }
      );
    }
  }, [searchParams, hasCheckedUrl]);

  const handleFundWallet = async () => {
    if (!fundingAmount || isNaN(fundingAmount) || Number(fundingAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const callbackUrl = `${window.location.origin}/dashboard/${userData?.id}?tab=wallet`;
      const { data: initData } = await initializeFunding({
        variables: { 
          amount: Number(fundingAmount),
          callbackUrl
        }
      });

      const { authorization_url } = initData.initializeWalletFunding;
      
      setIsFundingModalOpen(false);
      toast.success("Redirecting to Paystack...");
      
      // Redirect to payment in the same window
      window.location.href = authorization_url;
    } catch (error) {
      if (error.message.includes("network-request-failed") || error.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error(error.message || "Failed to initialize funding");
      }
    }
  };

  const handleVerify = async (ref) => {
    setIsVerifying(true);
    try {
      await verifyFunding({ variables: { reference: ref } });
      toast.success("Wallet funded successfully!");
      refetchWallet();
      refetchTx();
    } catch (error) {
      if (error.message.includes("network-request-failed") || error.message.includes("Failed to fetch")) {
        toast.error("Network Error: Please check your connection");
      } else {
        toast.error("Verification failed. If you paid, it will reflect shortly.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "SUCCESS": return "text-emerald-500 bg-emerald-50 border-emerald-100";
      case "FAILED": return "text-rose-500 bg-rose-50 border-rose-100";
      case "PENDING": return "text-amber-500 bg-amber-50 border-amber-100";
      default: return "text-slate-500 bg-slate-50 border-slate-100";
    }
  };

  if (walletLoading && !wallet) return (
    <div className="flex flex-col items-center justify-center space-y-4" style={{ padding: "80px" }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      <p className="text-slate-500 font-medium">Loading your wallet...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      {/* Wallet Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] shadow-xl text-white backdrop-blur-md"
        style={{ 
          background: "rgba(79, 70, 229, 0.1)", // Nice transparent indigo
          border: "1px solid rgba(79, 70, 229, 0.2)",
          padding: "48px" 
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center" style={{ gap: "24px" }}>
          <div>
            <div className="flex items-center opacity-80" style={{ gap: "10px", marginBottom: "6px" }}>
              <FaWallet className="text-lg" style={{ color: "purple" }} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Global Balance</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              ₦{wallet?.balance?.toLocaleString() || "0.00"}
            </h1>
            <p className="font-semibold bg-slate-100/80 w-fit rounded-full backdrop-blur-sm text-slate-400 text-[11px] mt-3 px-3 py-1">
              Linked to: {userData?.email}
            </p>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFundingModalOpen(true)}
            style={{ 
              padding: "12px 24px", 
              background: "linear-gradient(to right, purple, #D22730)",
              borderRadius: "16px"
            }}
            className="group text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center"
          >
            <FaPlus className="group-hover:rotate-90 transition-transform" style={{ marginRight: "10px", fontSize: "12px" }} />
            <span>Fund Wallet</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Business Filter Section */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-3xl border border-slate-100 px-8 py-5 gap-5">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 p-2 rounded-lg text-indigo-500">
             <FaBusinessTime />
          </div>
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight">Business Reports</h3>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select 
            value={selectedBusinessId || ""} 
            onChange={(e) => {
              setSelectedBusinessId(e.target.value || null);
              setTxPage(0);
            }}
            className="flex-1 md:w-64 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-indigo-400 transition-colors"
            style={{ padding: "10px 16px" }}
          >
            <option value="">All Businesses</option>
            {businesses.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          
          {selectedBusinessId && (
            <button 
              onClick={() => {
                setSelectedBusinessId(null);
                setTxPage(0);
              }}
              className="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Analytics/Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "24px" }}>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center" style={{ padding: "24px", gap: "16px" }}>
          <div className="bg-emerald-100 rounded-xl text-emerald-600" style={{ padding: "12px" }}>
            <FaArrowDown className="text-lg" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              {selectedBusinessId ? "Business Credits" : "Total Funding"}
            </p>
            <p className="text-xl font-black text-slate-700">
              ₦{transactions.filter(t => t.type === "FUNDING" && t.status === "SUCCESS").reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center" style={{ padding: "20px", gap: "16px" }}>
          <div className="bg-rose-100 rounded-xl text-rose-600" style={{ padding: "12px" }}>
            <FaArrowUp className="text-lg" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              {selectedBusinessId ? "Business Spending" : "Total Spending"}
            </p>
            <p className="text-xl font-black text-slate-700">
              ₦{transactions.filter(t => t.type === "DEDUCTION").reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px] relative">
        <div className="border-b border-slate-50 flex items-center justify-between" style={{ padding: "24px 32px" }}>
          <div className="flex items-center" style={{ gap: "10px" }}>
            <div className="bg-slate-50 rounded-lg text-slate-400" style={{ padding: "10px" }}>
              <FaHistory />
            </div>
            <h2 className="text-lg font-black text-slate-800">
              {selectedBusinessId ? "Business Ledger" : "Recent Activity"}
            </h2>
          </div>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            {txLoading ? "Updating..." : `Page ${txPage + 1}`}
          </span>
        </div>

        <div className={`${txLoading ? "opacity-50" : "opacity-100"} transition-opacity overflow-x-auto`}>
          {transactions.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="text-xs font-bold text-slate-400 uppercase tracking-widest" style={{ padding: "16px 32px" }}>Type</th>
                  <th className="text-xs font-bold text-slate-400 uppercase tracking-widest" style={{ padding: "16px 32px" }}>Purpose</th>
                  <th className="text-xs font-bold text-slate-400 uppercase tracking-widest" style={{ padding: "16px 32px" }}>Amount</th>
                  <th className="text-xs font-bold text-slate-400 uppercase tracking-widest" style={{ padding: "16px 32px" }}>Status</th>
                  <th className="text-xs font-bold text-slate-400 uppercase tracking-widest" style={{ padding: "16px 32px" }}>Date</th>
                  <th className="text-xs font-bold text-slate-400 uppercase tracking-widest" style={{ padding: "16px 32px" }}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center" style={{ gap: "10px" }}>
                        <div className={`p-1.5 rounded-md ${tx.type === "FUNDING" ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"}`}>
                          {tx.type === "FUNDING" ? <FaArrowDown size={10} /> : <FaArrowUp size={10} />}
                        </div>
                        <span className="font-bold text-slate-600 text-xs">{tx.type}</span>
                      </div>
                    </td>
                    <td style={{ padding: "20px 32px" }}>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-500 text-xs">{tx.purpose.replace(/_/g, " ")}</span>
                        {tx.business && (
                          <span className="text-[9px] text-indigo-400 font-bold uppercase flex items-center" style={{ gap: "3px" }}>
                            <FaBusinessTime size={8} /> {tx.business.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "20px 32px" }}>
                      <span className={`font-black text-base ${tx.type === "FUNDING" ? "text-emerald-600" : "text-slate-700"}`}>
                        {tx.type === "FUNDING" ? "+" : "-"}₦{tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ padding: "24px 32px" }}>
                      <span className={`rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(tx.status)}`} style={{ padding: "6px 16px" }}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ padding: "24px 32px" }}>
                      <span className="text-sm font-medium text-slate-400">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ padding: "24px 32px" }}>
                      {tx.status === "PENDING" && tx.type === "FUNDING" && (
                        <button 
                          onClick={() => handleVerify(tx.reference)}
                          disabled={isVerifying}
                          className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors"
                          style={{ padding: "6px 12px" }}
                        >
                          {isVerifying ? "..." : "Verify"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center flex flex-col items-center" style={{ padding: "80px" }}>
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center" style={{ marginBottom: "24px" }}>
                <FaHistory size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Transactions Found</h3>
              <p className="text-slate-500 max-w-sm">No activity matches your current filter.</p>
            </div>
          )}
        </div>

        {/* Pagination bar */}
        <div className="bg-slate-50/50 border-t border-slate-100" style={{ padding: "16px 32px" }}>
          <div className="flex justify-between items-center">
            <button 
              disabled={txPage === 0 || txLoading}
              onClick={() => setTxPage(p => p - 1)}
              className="text-[11px] font-black text-slate-400 uppercase tracking-widest disabled:opacity-30 hover:text-indigo-600 transition-colors"
            >
              Previous
            </button>
            <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Page {txPage + 1}</span>
            <button 
              disabled={transactions.length < txTake || txLoading}
              onClick={() => setTxPage(p => p + 1)}
              className="text-[11px] font-black text-slate-400 uppercase tracking-widest disabled:opacity-30 hover:text-indigo-600 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Funding Modal */}
      <AnimatePresence>
        {isFundingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFundingModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
              style={{ padding: "32px" }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: "24px" }}>
                <h3 className="text-lg font-black text-slate-800">Add Funds</h3>
                <button onClick={() => setIsFundingModalOpen(false)} className="text-slate-300 hover:text-slate-500 transition-colors">
                  <FaTimesCircle size={20} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4 mb-2">Amount to add (NGN)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">₦</span>
                    <input 
                      type="number" 
                      value={fundingAmount}
                      onChange={(e) => setFundingAmount(e.target.value)}
                      placeholder="5,000"
                      className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl text-xl font-black text-slate-700 outline-none focus:border-indigo-400 transition-colors"
                      style={{ padding: "16px 16px 16px 48px" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3" style={{ gap: "10px" }}>
                  {[1000, 5000, 10000].map(amt => (
                    <button 
                      key={amt}
                      onClick={() => setFundingAmount(amt.toString())}
                      className="bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 font-bold text-xs rounded-xl border border-slate-50 hover:border-indigo-100 transition-all"
                      style={{ padding: "10px" }}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFundWallet}
                  style={{ 
                    padding: "16px", 
                    background: "linear-gradient(to right, purple, #D22730)",
                    borderRadius: "16px"
                  }}
                  className="w-full text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                >
                  <FaPlus style={{ marginRight: "10px", fontSize: "12px" }} />
                  <span>Proceed to Payment</span>
                </motion.button>
                
                <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-tight"> Secure Transaction via Paystack </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletManager;
