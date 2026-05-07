"use client";

import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

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
  const { data, loading } = useQuery(GET_TOP_HEADER);
  const [updateTopHeader] = useMutation(UPDATE_TOP_HEADER);

  const [form, setForm] = useState({
    text: "",
    link: "",
    isVisible: true,
  });

  // Populate when data loads
  useState(() => {
    if (data?.topHeaderSetting) {
      setForm(data.topHeaderSetting);
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
    await updateTopHeader({ variables: form });
    alert("Top Header updated!");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="bg-white rounded shadow" style={{padding: '24px'}}>
      <h2 className="text-lg font-bold" style={{marginBottom: '16px'}}>Top Header Settings</h2>
      <input
        type="text"
        name="text"
        value={form.text || ""}
        onChange={handleChange}
        placeholder="Header Text"
        className="w-full border rounded"
        style={{ padding: '10px', marginBottom: '16px'}}
      />
      <input
        type="text"
        name="link"
        value={form.link || ""}
        onChange={handleChange}
        placeholder="Header Link"
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
        <span>Show Top Header</span>
      </label>
      <button
        onClick={handleSubmit}
        className="bg-black text-white rounded"
        style={{ padding: '10px'}}
      >
        Save Settings
      </button>
    </div>
  );
}
