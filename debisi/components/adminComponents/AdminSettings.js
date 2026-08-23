"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { toast } from "react-hot-toast";
import { FiLayout, FiLink, FiType, FiEye, FiCheckCircle, FiSave, FiExternalLink } from "react-icons/fi";
import { motion } from "framer-motion";

const GET_TOP_HEADER = gql`
  query {
    topHeaderSetting {
      id
      text
      link
      isVisible
    }
  }
`;

const UPDATE_TOP_HEADER = gql`
  mutation UpdateTopHeader($text: String, $link: String, $isVisible: Boolean) {
    updateTopHeaderSetting(text: $text, link: $link, isVisible: $isVisible) {
      id
      text
      link
      isVisible
    }
  }
`;

export default function AdminSettings() {
  const { data, loading, error } = useQuery(GET_TOP_HEADER, {
    fetchPolicy: "network-only",
  });
  const [updateTopHeader, { loading: saving }] = useMutation(UPDATE_TOP_HEADER);

  const [form, setForm] = useState({
    text: "",
    link: "",
    isVisible: true,
  });

  // Populate when data loads
  useEffect(() => {
    if (data?.topHeaderSetting) {
      setForm({
        text: data.topHeaderSetting.text || "",
        link: data.topHeaderSetting.link || "",
        isVisible: data.topHeaderSetting.isVisible ?? true,
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      await updateTopHeader({
        variables: {
          text: form.text,
          link: form.link,
          isVisible: form.isVisible,
        },
      });
      toast.success("Top Header updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update top header");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Top Header Announcement</h1>
          <p className="text-sm text-gray-500">
            Configure the global notification banner displayed across the top of the platform
          </p>
        </div>
        <div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              form.isVisible
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${form.isVisible ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}
            />
            {form.isVisible ? "Banner Active on Site" : "Banner Hidden"}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100">
          Failed to load settings: {error.message}
        </div>
      )}

      {/* Live Preview Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <FiEye size={14} /> Live Preview (How visitors see it)
          </span>
          {form.link && (
            <a
              href={form.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              Test Link <FiExternalLink size={12} />
            </a>
          )}
        </div>

        <div
          className={`p-3.5 rounded-xl transition-all duration-300 text-center flex items-center justify-center gap-2 ${
            form.isVisible
              ? "bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white shadow-sm"
              : "bg-gray-100 text-gray-400 border border-dashed border-gray-300"
          }`}
        >
          {form.isVisible ? (
            <p className="text-xs sm:text-sm font-medium tracking-wide">
              {form.text || "Welcome to Debisi — discover premier verified businesses and products!"}
              {form.link && (
                <span className="underline ml-2 font-bold cursor-pointer opacity-90 hover:opacity-100">
                  Learn more &rarr;
                </span>
              )}
            </p>
          ) : (
            <p className="text-xs font-medium italic text-gray-400">
              Banner is currently disabled and will not appear on the website.
            </p>
          )}
        </div>
      </div>

      {/* Configuration Form Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
            <FiLayout />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Header Content & Controls</h2>
            <p className="text-xs text-gray-400">Edit text, redirect target, and website visibility</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Announcement Message
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FiType size={16} />
              </div>
              <input
                type="text"
                name="text"
                value={form.text}
                onChange={handleChange}
                placeholder="e.g., Special Launch Promo: Get 20% off verified listings this week!"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Keep it concise for maximum impact on mobile screens.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Call-to-Action Link URL (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FiLink size={16} />
              </div>
              <input
                type="text"
                name="link"
                value={form.link}
                onChange={handleChange}
                placeholder="e.g., /pricing or https://debisi.com/deals"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800"
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-800">Display Top Header</p>
              <p className="text-xs text-gray-400">Toggle whether this announcement is visible to site visitors</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isVisible"
                checked={form.isVisible}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving || loading}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave size={16} />
              {saving ? "Saving Changes..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
