"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import Table from "../otherComponents/Tables";
import Modal from "../otherComponents/Modal";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { 
  FiImage, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiExternalLink, 
  FiCheckCircle, 
  FiEye, 
  FiEyeOff, 
  FiLayers,
  FiVideo
} from "react-icons/fi";

const GET_WEB_BANNER = gql`
  query GetWebBanner {
    webBannerSetting {
      id
      title
      text
      image
      videoUrl
      url
      placement
      isVisible
    }
  }
`;

const GET_WEB_BANNERS = gql`
  query GetWebBanners {
    webBanners {
      id
      title
      text
      image
      videoUrl
      url
      placement
      isVisible
      createdAt
    }
  }
`;

const UPDATE_WEB_BANNER = gql`
  mutation UpdateWebBanner(
    $id: ID
    $title: String
    $text: String
    $image: String
    $videoUrl: String
    $url: String
    $placement: String
    $isVisible: Boolean
  ) {
    updateWebBannerSetting(
      id: $id
      title: $title
      text: $text
      image: $image
      videoUrl: $videoUrl
      url: $url
      placement: $placement
      isVisible: $isVisible
    ) {
      id
      title
      text
      image
      videoUrl
      url
      placement
      isVisible
    }
  }
`;

const CREATE_WEB_BANNER_MUTATION = gql`
  mutation CreateWebBanner(
    $title: String
    $text: String
    $image: String
    $videoUrl: String
    $url: String
    $placement: String
    $isVisible: Boolean
  ) {
    createWebBanner(
      title: $title
      text: $text
      image: $image
      videoUrl: $videoUrl
      url: $url
      placement: $placement
      isVisible: $isVisible
    ) {
      id
      title
      text
      image
      videoUrl
      url
      placement
      isVisible
    }
  }
`;

const DELETE_WEB_BANNER = gql`
  mutation AdminDeleteWebBanner($id: ID!) {
    adminDeleteWebBanner(id: $id)
  }
`;

const PLACEMENT_OPTIONS = [
  { value: "HOME_SLIDER", label: "Home Slider (Top)" },
  { value: "BUSINESS_TOP", label: "Business Section Mosaic" },
  { value: "VIDEO_TOP", label: "Video Section Mosaic" },
  { value: "NOTICE_TOP", label: "Notice Section Mosaic" },
  { value: "EXTRA_TOP", label: "Extra Bottom Mosaic" },
];

export default function WebBanner() {
  const { data: listData, loading: listLoading, error, refetch: refetchList } = useQuery(GET_WEB_BANNERS, {
    fetchPolicy: "network-only",
  });
  const [updateWebBanner, { loading: updating }] = useMutation(UPDATE_WEB_BANNER);
  const [createWebBanner, { loading: creating }] = useMutation(CREATE_WEB_BANNER_MUTATION);
  const [deleteWebBanner] = useMutation(DELETE_WEB_BANNER);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form, setForm] = useState({
    id: null,
    title: "",
    text: "",
    image: "",
    videoUrl: "",
    url: "",
    placement: "HOME_SLIDER",
    isVisible: true,
  });

  const banners = listData?.webBanners || [];

  const openCreateModal = () => {
    setEditingBanner(null);
    setForm({
      id: null,
      title: "",
      text: "",
      image: "",
      videoUrl: "",
      url: "",
      placement: "HOME_SLIDER",
      isVisible: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditingBanner(row);
    setForm({
      id: row.id,
      title: row.title || "",
      text: row.text || "",
      image: row.image || "",
      videoUrl: row.videoUrl || "",
      url: row.url || "",
      placement: row.placement || "HOME_SLIDER",
      isVisible: row.isVisible ?? true,
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.image.trim()) {
      toast.error("Banner title and image URL are required.");
      return;
    }

    try {
      if (editingBanner) {
        const { __typename, createdAt, ...variables } = form;
        await updateWebBanner({ variables });
        toast.success("Web banner updated successfully!");
      } else {
        const { id, __typename, createdAt, ...variables } = form;
        await createWebBanner({ variables });
        toast.success("New web banner created successfully!");
      }
      setIsModalOpen(false);
      await refetchList();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save banner");
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete banner "${row.title}"? This cannot be undone.`)) return;
    try {
      await deleteWebBanner({ variables: { id: row.id } });
      await refetchList();
      toast.success("Banner deleted successfully.");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete banner.");
    }
  };

  const formatPlacement = (placement) => {
    const opt = PLACEMENT_OPTIONS.find((p) => p.value === placement);
    return opt ? opt.label : placement || "HOME_SLIDER";
  };

  const columns = [
    {
      title: "Preview",
      field: "image",
      render: (row) => (
        <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 relative border border-slate-200 flex items-center justify-center">
          {row.image ? (
            <img
              src={row.image}
              alt={row.title || "Banner preview"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <FiImage className="text-slate-400" />
          )}
        </div>
      ),
    },
    {
      title: "Banner Details",
      field: "title",
      render: (row) => (
        <div>
          <p className="font-bold text-sm text-slate-800 line-clamp-1">{row.title}</p>
          {row.text && <p className="text-xs text-slate-400 line-clamp-1">{row.text}</p>}
        </div>
      ),
    },
    {
      title: "Placement",
      field: "placement",
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
          {formatPlacement(row.placement)}
        </span>
      ),
    },
    {
      title: "Redirect Link",
      field: "url",
      render: (row) =>
        row.url ? (
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 max-w-[150px] truncate"
            title={row.url}
          >
            {row.url} <FiExternalLink size={11} />
          </a>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      title: "Status",
      field: "isVisible",
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            row.isVisible
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-slate-100 text-slate-500 border border-slate-200"
          }`}
        >
          {row.isVisible ? <FiEye size={12} /> : <FiEyeOff size={12} />}
          {row.isVisible ? "Visible" : "Hidden"}
        </span>
      ),
    },
  ];

  const totalBanners = banners.length;
  const activeBanners = banners.filter((b) => b.isVisible).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Web Banners & Hero Slots</h1>
          <p className="text-sm text-gray-500">Manage promotional web banners, mosaics, and carousel slider items</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
        >
          <FiPlus size={16} /> Add New Banner
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
            <FiLayers />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Banners</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{totalBanners}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <FiCheckCircle />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live & Visible</p>
            <h3 className="text-2xl font-extrabold text-slate-800">{activeBanners}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
            <FiImage />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placements Configured</p>
            <h3 className="text-2xl font-extrabold text-slate-800">
              {new Set(banners.map((b) => b.placement)).size}
            </h3>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
          Failed to load web banners: {error.message}
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <Table
          data={banners}
          columns={columns}
          isLoading={listLoading}
          onEdit={(row) => openEditModal(row)}
          onDelete={(row) => handleDelete(row)}
        />
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <Modal
          title={editingBanner ? "Edit Web Banner" : "Create New Web Banner"}
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Banner Title
              </label>
              <input
                type="text"
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Summer Super Deals"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Subtext / Description (Optional)
              </label>
              <input
                type="text"
                name="text"
                value={form.text}
                onChange={handleChange}
                placeholder="e.g. Discover up to 50% discounts from verified merchants"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Image URL
              </label>
              <input
                type="url"
                name="image"
                required
                value={form.image}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Video / GIF URL (Optional)
              </label>
              <input
                type="url"
                name="videoUrl"
                value={form.videoUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Redirect Link URL (Optional)
              </label>
              <input
                type="text"
                name="url"
                value={form.url}
                onChange={handleChange}
                placeholder="/showroom or https://..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Placement Section
              </label>
              <select
                name="placement"
                value={form.placement}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-gray-800"
              >
                {PLACEMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-800">Visible on Site</p>
                <p className="text-[11px] text-gray-400">Control if this banner is actively rendered</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isVisible"
                  checked={form.isVisible}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || updating}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {creating || updating ? "Saving..." : editingBanner ? "Save Changes" : "Create Banner"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
