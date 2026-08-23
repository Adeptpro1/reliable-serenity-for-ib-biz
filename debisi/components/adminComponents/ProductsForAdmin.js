"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { 
  GET_ADMIN_PRODUCTS, 
  ADMIN_TOGGLE_PRODUCT_STATUS, 
  ADMIN_DELETE_PRODUCT 
} from "@/graphql/queries/admin/products";
import Tables from "../otherComponents/Tables";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { 
  FiShoppingBag, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiTrash2, 
  FiEye, 
  FiX, 
  FiUser, 
  FiCalendar,
  FiTrendingUp
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductsForAdmin() {
  const [filterType, setFilterType] = useState("ALL"); // ALL, ACTIVE, INACTIVE, FLAGGED
  const [selectedReportProduct, setSelectedReportProduct] = useState(null);

  const { data, loading, error, refetch } = useQuery(GET_ADMIN_PRODUCTS, {
    variables: {
      pagination: { take: 100 },
      isActive: filterType === "ACTIVE" ? true : filterType === "INACTIVE" ? false : undefined,
      isFlagged: filterType === "FLAGGED" ? true : undefined,
    },
    fetchPolicy: "network-only",
  });

  const [toggleStatus, { loading: toggling }] = useMutation(ADMIN_TOGGLE_PRODUCT_STATUS, {
    onCompleted: () => {
      toast.success("Product status updated!");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const [deleteProduct, { loading: deleting }] = useMutation(ADMIN_DELETE_PRODUCT, {
    onCompleted: () => {
      toast.success("Product deleted successfully");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const rawProducts = data?.adminAllProducts || [];

  const handleToggle = async (row) => {
    try {
      await toggleStatus({
        variables: {
          id: row.id,
          isActive: !row.isActive,
        },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Are you sure you want to permanently delete "${row.title}"?`)) {
      try {
        await deleteProduct({ variables: { id: row.id } });
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Metrics
  const totalCount = rawProducts.length;
  const activeCount = rawProducts.filter((p) => p.isActive).length;
  const flaggedCount = rawProducts.filter((p) => p.reports && p.reports.length > 0).length;

  const tableData = rawProducts.map((p) => ({
    ...p,
    businessName: p.business?.name || "Independent",
    reportCount: p.reports?.length || 0,
    priceFormatted: `₦${Number(p.price || 0).toLocaleString()}`,
    imagePreview: (
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative flex items-center justify-center">
        {p.images && p.images[0] ? (
          <Image
            src={p.images[0].imageUrl}
            alt={p.title}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <FiShoppingBag className="text-slate-400" />
        )}
      </div>
    ),
  }));

  const columns = [
    { title: "Image", field: "imagePreview" },
    {
      title: "Product Title",
      field: "title",
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800 line-clamp-1">{row.title}</p>
          <p className="text-xs text-slate-400 font-medium">{row.category || "General"}</p>
        </div>
      ),
    },
    {
      title: "Merchant",
      field: "businessName",
      render: (row) => (
        <span className="font-semibold text-slate-700 text-xs">{row.businessName}</span>
      ),
    },
    {
      title: "Price / Stock",
      field: "priceFormatted",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 text-sm">{row.priceFormatted}</span>
          <p className="text-[11px] text-slate-400">Stock: {row.stock}</p>
        </div>
      ),
    },
    {
      title: "Reports",
      field: "reportCount",
      render: (row) => {
        const count = row.reportCount;
        if (count === 0) {
          return <span className="text-xs text-slate-400 font-medium">Clean</span>;
        }
        return (
          <button
            onClick={() => setSelectedReportProduct(row)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
          >
            <FiAlertTriangle size={12} />
            {count} {count === 1 ? "Report" : "Reports"}
          </button>
        );
      },
    },
    {
      title: "Status",
      field: "isActive",
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            row.isActive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {row.isActive ? <FiCheckCircle size={12} /> : <FiAlertTriangle size={12} />}
          {row.isActive ? "Active" : "Deactivated"}
        </span>
      ),
    },
    {
      title: "Actions",
      field: "id",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggle(row)}
            disabled={toggling}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              row.isActive
                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {row.isActive ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={() => handleDelete(row)}
            disabled={deleting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete product"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Marketplace Products & Anti-Fraud</h1>
          <p className="text-sm text-slate-500">Monitor listed products, review buyer fraud reports, and moderate listings</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
            <FiShoppingBag />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{totalCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <FiCheckCircle />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Listings</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{activeCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl">
            <FiAlertTriangle />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flagged by Buyers</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{flaggedCount}</h3>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: "ALL", label: "All Listings" },
          { id: "ACTIVE", label: "Active" },
          { id: "INACTIVE", label: "Deactivated" },
          { id: "FLAGGED", label: `Flagged (${flaggedCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl mb-4">
            Failed to load products: {error.message}
          </div>
        )}

        <Tables
          columns={columns}
          data={tableData}
          isLoading={loading}
          hideSearch={false}
        />
      </div>

      {/* Reports Details Modal */}
      <AnimatePresence>
        {selectedReportProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Buyer Reports & Flags</h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Product: {selectedReportProduct.title}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReportProduct(null)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {selectedReportProduct.reports && selectedReportProduct.reports.length > 0 ? (
                  selectedReportProduct.reports.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <FiUser size={13} className="text-slate-400" />
                          {r.user
                            ? `${r.user.firstName} ${r.user.lastName}`
                            : "Anonymous Buyer"}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <FiCalendar size={12} />
                          {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {r.user?.email && (
                        <p className="text-[11px] text-slate-500">{r.user.email}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-sm text-slate-400">
                    No individual report logs available.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedReportProduct(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleToggle(selectedReportProduct);
                    setSelectedReportProduct(null);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-colors ${
                    selectedReportProduct.isActive
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {selectedReportProduct.isActive ? "Deactivate Listing" : "Reactivate Listing"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
