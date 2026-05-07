"use client";

import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaWallet, 
  FaArrowDown, 
  FaArrowUp, 
  FaHistory, 
  FaBusinessTime,
  FaUser,
  FaChartLine,
  FaFileCsv,
  FaFilePdf
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { 
  GET_ADMIN_WALLET_STATS, 
  GET_ADMIN_ALL_TRANSACTIONS 
} from "../../api/queries/admin/wallet";

const AdminWalletManager = () => {
  const [page, setPage] = useState(0);
  const take = 10;

  const { 
    data: statsData, 
    loading: statsLoading 
  } = useQuery(GET_ADMIN_WALLET_STATS);

  const { 
    data: txData, 
    loading: txLoading,
    refetch: refetchTx 
  } = useQuery(GET_ADMIN_ALL_TRANSACTIONS, {
    variables: { pagination: { skip: page * take, take } }
  });

  const stats = statsData?.adminWalletStats;
  const transactions = txData?.adminAllWalletTransactions || [];

  const exportToCSV = () => {
    const ws = XLSX.utils.json_to_sheet(transactions.map(tx => ({
      ID: tx.id,
      User: `${tx.wallet?.user?.firstName} ${tx.wallet?.user?.lastName}`,
      Email: tx.wallet?.user?.email,
      Type: tx.type,
      Purpose: tx.purpose,
      Business: tx.business?.name || "N/A",
      Amount: tx.amount,
      Date: new Date(tx.createdAt).toLocaleString()
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "Platform_Transactions.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Debisi NG - Global Transaction Ledger", 14, 15);
    
    const tableData = transactions.map(tx => [
      `${tx.wallet?.user?.firstName} ${tx.wallet?.user?.lastName}`,
      tx.type,
      tx.purpose.replace(/_/g, " "),
      `N${tx.amount.toLocaleString()}`,
      new Date(tx.createdAt).toLocaleDateString()
    ]);

    doc.autoTable({
      head: [['User', 'Type', 'Purpose', 'Amount', 'Date']],
      body: tableData,
      startY: 25
    });

    doc.save("Platform_Transactions.pdf");
  };

  if (statsLoading || txLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center" style={{ gap: "24px" }}>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Platform Financials</h1>
          <p className="text-sm text-slate-500 font-medium">Global wallet activity and revenue overview</p>
        </div>
        <div className="flex items-center gap-3">
            <button 
              onClick={exportToCSV}
              className="bg-emerald-600 text-white font-bold text-[11px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-2"
              style={{ padding: "10px 20px", borderRadius: "12px" }}
            >
              <FaFileCsv /> Export CSV
            </button>
            <button 
              onClick={exportToPDF}
              className="bg-rose-600 text-white font-bold text-[11px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-sm flex items-center gap-2"
              style={{ padding: "10px 20px", borderRadius: "12px" }}
            >
              <FaFilePdf /> Export PDF
            </button>
            <button 
              onClick={() => refetchTx()}
              className="bg-white border border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
              style={{ padding: "10px 20px", borderRadius: "12px" }}
            >
              Refresh Data
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: "24px" }}>
        {/* Total Revenue Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative"
          style={{ padding: "32px" }}
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
            <FaChartLine size={80} />
          </div>
          <div className="relative z-10">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl w-fit mb-6">
              <FaArrowDown className="text-lg" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Platform Revenue</p>
            <h2 className="text-3xl font-black text-slate-800">₦{stats?.totalRevenue?.toLocaleString()}</h2>
            <div className="mt-4 flex items-center gap-2">
               <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">{stats?.fundingCount} Deposits</span>
            </div>
          </div>
        </motion.div>

        {/* User Balances Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative"
          style={{ padding: "32px" }}
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
            <FaWallet size={80} />
          </div>
          <div className="relative z-10">
            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl w-fit mb-6">
              <FaWallet className="text-lg" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total User Credits</p>
            <h2 className="text-3xl font-black text-slate-800">₦{stats?.totalUserBalances?.toLocaleString()}</h2>
            <p className="text-[11px] text-slate-400 mt-4 font-medium italic">Outstanding platform liability</p>
          </div>
        </motion.div>

        {/* Volume Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative"
          style={{ padding: "32px" }}
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
            <FaHistory size={80} />
          </div>
          <div className="relative z-10">
            <div className="bg-rose-50 text-rose-600 p-3 rounded-2xl w-fit mb-6">
              <FaArrowUp className="text-lg" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Internal Spending</p>
            <h2 className="text-3xl font-black text-slate-800">₦{statsData?.adminWalletStats?.fundingCount ? "---" : "0"}</h2> 
            {/* Spending is basically deductionCount * amount. We'll show counts for now */}
            <div className="mt-4 flex items-center gap-2">
               <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-full">{stats?.deductionCount} Service Payments</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Global Transaction Ledger */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="border-b border-slate-50 flex items-center justify-between" style={{ padding: "24px 32px" }}>
          <div className="flex items-center" style={{ gap: "10px" }}>
            <div className="bg-slate-50 rounded-lg text-slate-400" style={{ padding: "10px" }}>
              <FaHistory />
            </div>
            <h2 className="text-lg font-black text-slate-800">Global Ledger</h2>
          </div>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Platform-wide audit</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ padding: "16px 32px" }}>User</th>
                <th className="text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ padding: "16px 32px" }}>Type</th>
                <th className="text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ padding: "16px 32px" }}>Purpose / Context</th>
                <th className="text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ padding: "16px 32px" }}>Amount</th>
                <th className="text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ padding: "16px 32px" }}>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td style={{ padding: "20px 32px" }}>
                    <div className="flex items-center" style={{ gap: "10px" }}>
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <FaUser size={12} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-xs">{tx.wallet?.user?.firstName} {tx.wallet?.user?.lastName}</span>
                        <span className="text-[10px] text-slate-400">{tx.wallet?.user?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "20px 32px" }}>
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
                      ₦{tx.amount.toLocaleString()}
                    </span>
                  </td>
                  <td style={{ padding: "20px 32px" }}>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {transactions.length === 0 && (
             <div className="p-20 text-center">
                <p className="text-slate-400 font-medium">No transactions found on the platform yet.</p>
             </div>
          )}
        </div>
        
        {/* Pagination */}
        <div className="bg-slate-50/50 border-t border-slate-50" style={{ padding: "16px 32px" }}>
          <div className="flex justify-between items-center">
            <button 
              disabled={page === 0}
              onClick={() => setPage(page-1)}
              className="text-[11px] font-black text-slate-400 uppercase tracking-widest disabled:opacity-30 hover:text-indigo-600 transition-colors"
            >
              Previous
            </button>
            <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Page {page + 1}</span>
            <button 
              disabled={transactions.length < take}
              onClick={() => setPage(page+1)}
              className="text-[11px] font-black text-slate-400 uppercase tracking-widest disabled:opacity-30 hover:text-indigo-600 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWalletManager;
