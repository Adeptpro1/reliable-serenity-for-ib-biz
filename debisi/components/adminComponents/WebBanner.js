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
      url
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
      url
      isVisible
      createdAt
    }
  }
`;

const UPDATE_WEB_BANNER = gql`
  mutation UpdateWebBanner($title: String, $text: String, $image: String, $url: String, $isVisible: Boolean) {
    updateWebBannerSetting(title: $title, text: $text, image: $image, url: $url, isVisible: $isVisible) {
      id
      title
      text
      image
      url
      isVisible
    }
  }
`;

const CREATE_WEB_BANNER_MUTATION = gql`
  mutation CreateWebBanner($title: String, $text: String, $image: String, $url: String, $isVisible: Boolean) {
    createWebBanner(title: $title, text: $text, image: $image, url: $url, isVisible: $isVisible) {
      id
      title
      text
      image
      url
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
    title: "",
    text: "",
    image: "",
    url: "",
    isVisible: true,
  });

  // Populate when data loads
  useEffect(() => {
    if (data?.webBannerSetting) {
      const { id, __typename, ...cleanData } = data.webBannerSetting;
      setForm({
        title: cleanData.title || "",
        text: cleanData.text || "",
        image: cleanData.image || "",
        url: cleanData.url || "",
        isVisible: cleanData.isVisible ?? true,
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
    await updateWebBanner({ variables: form });
    alert("Web Banner updated!");
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
        name="url"
        value={form.url || ""}
        onChange={handleChange}
        placeholder="Web Banner Url"
        className="w-full border rounded"
        style={{ padding: '10px', marginBottom: '16px'}}
      />
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
            await createWebBanner({ variables: form });
            await refetchList();
            alert('New banner added');
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
            { title: 'Preview', field: 'image' },
            { title: 'Title', field: 'title' },
            { title: 'Text', field: 'text' },
            { title: 'URL', field: 'url' },
            { title: 'Visible', field: 'isVisible' },
            { title: 'Created', field: 'createdAt' },
          ]}
          isLoading={listLoading}
          onEdit={(row) => {
            // populate form with selected banner for quick edit
            setForm({
              title: row.title || "",
              text: row.text || "",
              image: row.image || "",
              url: row.url || "",
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
