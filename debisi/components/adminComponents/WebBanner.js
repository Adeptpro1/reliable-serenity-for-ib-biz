"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import Table from "../otherComponents/Tables";

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
  mutation UpdateWebBanner($id: ID, $title: String, $text: String, $image: String, $videoUrl: String, $url: String, $placement: String, $isVisible: Boolean) {
    updateWebBannerSetting(id: $id, title: $title, text: $text, image: $image, videoUrl: $videoUrl, url: $url, placement: $placement, isVisible: $isVisible) {
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
  mutation CreateWebBanner($title: String, $text: String, $image: String, $videoUrl: String, $url: String, $placement: String, $isVisible: Boolean) {
    createWebBanner(title: $title, text: $text, image: $image, videoUrl: $videoUrl, url: $url, placement: $placement, isVisible: $isVisible) {
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

export default function WebBanner() {
  const { data, loading } = useQuery(GET_WEB_BANNER);
  const { data: listData, loading: listLoading, refetch: refetchList } = useQuery(GET_WEB_BANNERS);
  const [updateWebBanner] = useMutation(UPDATE_WEB_BANNER);
  const [createWebBanner] = useMutation(CREATE_WEB_BANNER_MUTATION);
  const [deleteWebBanner] = useMutation(DELETE_WEB_BANNER);

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

  // Populate when data loads
  useEffect(() => {
    if (data?.webBannerSetting) {
      const { id, __typename, ...cleanData } = data.webBannerSetting;
      setForm({
        id: data.webBannerSetting.id,
        title: data.webBannerSetting.title || "",
        text: data.webBannerSetting.text || "",
        image: data.webBannerSetting.image || "",
        videoUrl: data.webBannerSetting.videoUrl || "",
        url: data.webBannerSetting.url || "",
        placement: data.webBannerSetting.placement || "HOME_SLIDER",
        isVisible: data.webBannerSetting.isVisible ?? true,
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    try {
      const { __typename, createdAt, ...variables } = form;
      await updateWebBanner({ variables });
      await refetchList();
      alert("Web Banner updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update banner");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="bg-white rounded shadow" style={{padding: '24px'}}>
      <h2 className="text-lg font-bold" style={{marginBottom: '16px'}}>Web Banner Settings</h2>
      <input
        type="text"
        name="title"
        value={form.title || ""}
        onChange={handleChange}
        placeholder="Banner Title"
        className="w-full border rounded"
        style={{ padding: '10px', marginBottom: '16px'}}
      />
      <input
        type="text"
        name="text"
        value={form.text || ""}
        onChange={handleChange}
        placeholder="Banner Text"
        className="w-full border rounded"
        style={{ padding: '10px', marginBottom: '16px'}}
      />

      {/* change to file picker later */}
      <input
        type="text"
        name="image"
        value={form.image || ""}
        onChange={handleChange}
        placeholder="Banner Image Url"
        className="w-full border rounded"
        style={{ padding: '10px', marginBottom: '16px'}}
      />
      <input
        type="text"
        name="videoUrl"
        value={form.videoUrl || ""}
        onChange={handleChange}
        placeholder="Banner Video Url (Optional for GIFs/Videos)"
        className="w-full border rounded"
        style={{ padding: '10px', marginBottom: '16px'}}
      />
      <input
        type="text"
        name="url"
        value={form.url || ""}
        onChange={handleChange}
        placeholder="Web Banner Link Url"
        className="w-full border rounded"
        style={{ padding: '10px', marginBottom: '16px'}}
      />
      <div style={{ marginBottom: '16px' }}>
        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Placement</label>
        <select
          name="placement"
          value={form.placement}
          onChange={handleChange}
          className="w-full border rounded"
          style={{ padding: '10px' }}
        >
          <option value="HOME_SLIDER">Home Slider (Top)</option>
          <option value="BUSINESS_TOP">Business Section Mosaic</option>
          <option value="VIDEO_TOP">Video Section Mosaic</option>
          <option value="NOTICE_TOP">Notice Section Mosaic</option>
          <option value="EXTRA_TOP">Extra Bottom Mosaic</option>
        </select>
      </div>
      <label className="flex items-center space-x-2" style={{marginBottom: '8px'}}>
        <input
          type="checkbox"
          name="isVisible"
          checked={form.isVisible}
          onChange={handleChange}
        />
        <span>Show Web Banner</span>
      </label>
      <button
        onClick={handleSubmit}
        className="bg-black text-white rounded"
        style={{ padding: '10px'}}
      >
        Save Settings
      </button>
      <button
        onClick={async () => {
          try {
            const { id, __typename, createdAt, ...variables } = form;
            await createWebBanner({ variables });
            await refetchList();
            alert('New banner added');
            // Clear form
            setForm({ id: null, title: "", text: "", image: "", videoUrl: "", url: "", placement: "HOME_SLIDER", isVisible: true });
          } catch (err) {
            console.error(err);
            alert('Failed to add banner');
          }
        }}
        className="bg-green-600 text-white rounded"
        style={{ padding: '10px', marginLeft: '16px' }}
      >
        Add New Banner
      </button>
      
      {/* List existing banners from the database */}
      <div className="mt-8">
        <h3 className="text-md font-semibold mb-3">All Web Banners</h3>
        <Table
          data={listData?.webBanners || []}
          columns={[
            { title: 'Placement', field: 'placement' },
            { title: 'Preview', field: 'image' },
            { title: 'Video', field: 'videoUrl' },
            { title: 'Title', field: 'title' },
            { title: 'URL', field: 'url' },
            { title: 'Visible', field: 'isVisible' },
          ]}
          isLoading={listLoading}
          onEdit={(row) => {
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
          }}
          onDelete={async (row) => {
            if (!confirm(`Delete banner "${row.title}"? This cannot be undone.`)) return;
            try {
              await deleteWebBanner({ variables: { id: row.id } });
              await refetchList();
              alert('Banner deleted successfully.');
            } catch (err) {
              console.error(err);
              alert('Failed to delete banner.');
            }
          }}
        />
      </div>
    </div>
  );
}
