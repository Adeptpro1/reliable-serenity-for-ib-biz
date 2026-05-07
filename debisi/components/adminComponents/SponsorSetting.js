"use client";
import Image from "next/image";

import { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import Tables from "../otherComponents/Tables"; // Import the Tables component

const GET_SPONSORS = gql`
  query {
    sponsors {
      id
      title
      image
      url
    }
  }
`;

const CREATE_SPONSOR = gql`
  mutation CreateSponsor($title: String!, $image: String!, $url: String!) {
    createSponsor(title: $title, image: $image, url: $url) {
      id
      title
      image
      url
    }
  }
`;

const UPDATE_SPONSOR = gql`
  mutation UpdateSponsor($id: ID!, $title: String, $image: String, $url: String) {
    updateSponsor(id: $id, title: $title, image: $image, url: $url) {
      id
      title
      image
      url
    }
  }
`;

const DELETE_SPONSOR = gql`
  mutation DeleteSponsor($id: ID!) {
    deleteSponsor(id: $id)
  }
`;

export default function SponsorSetting() {
  const { data, loading, error, refetch } = useQuery(GET_SPONSORS);
  const [createSponsor] = useMutation(CREATE_SPONSOR);
  const [updateSponsor] = useMutation(UPDATE_SPONSOR);
  const [deleteSponsor] = useMutation(DELETE_SPONSOR);

  const [form, setForm] = useState({ id: null, title: "", image: "", url: "" });
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateSponsor({ variables: { ...form } });
      } else {
        await createSponsor({ variables: { title: form.title, image: form.image, url: form.url } });
      }
      setForm({ id: null, title: "", image: "", url: "" });
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error('Error submitting sponsor:', error);
      alert('Failed to save sponsor. Please try again.');
    }
  };

  const handleEdit = (sponsor) => {
    setForm(sponsor);
    setIsEditing(true);
  };

  const handleDelete = async (sponsor) => {
    if (window.confirm('Are you sure you want to delete this sponsor?')) {
      try {
        await deleteSponsor({ variables: { id: sponsor.id } });
        refetch();
      } catch (error) {
        console.error('Error deleting sponsor:', error);
        alert('Failed to delete sponsor. Please try again.');
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading sponsors</p>;

  // Define columns for the Tables component
  const columns = [
    { field: "title", title: "Title" },
    { field: "image", title: "Image" },
    { field: "url", title: "Website URL" },
  ];

  // Prepare data for the Tables component
  const tableData = data?.sponsors?.map((s) => ({
    ...s,
    image: (
      <Image
        src={s.image}
        alt={s.title}
        style={{ width: "50px", height: "50px", objectFit: "contain" }}
      width={800} height={800} />
    ),
    url: (
      <a
        href={s.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: "14px", color: "#2563eb", textDecoration: "underline" }}
      >
        {s.url}
      </a>
    ),
  })) || [];

  return (
    <div style={{ padding: "24px", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>Manage Sponsors</h1>

      <div style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        marginBottom: "24px"
      }}>
        <h2 style={{ fontWeight: "600", marginBottom: "8px" }}>
          {isEditing ? "Edit Sponsor" : "Add Sponsor"}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "8px",
              border: "1px solid #e2e8f0",
              borderRadius: "4px"
            }}
            required
          />
          <input
            type="url"
            placeholder="Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "8px",
              border: "1px solid #e2e8f0",
              borderRadius: "4px"
            }}
            required
          />
          <input
            type="url"
            placeholder="Website URL"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "16px",
              border: "1px solid #e2e8f0",
              borderRadius: "4px"
            }}
            required
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="submit"
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                padding: "8px 16px",
                borderRadius: "4px",
                fontWeight: "500"
              }}
            >
              {isEditing ? "Update Sponsor" : "Add Sponsor"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setForm({ id: null, title: "", image: "", url: "" });
                }}
                style={{
                  backgroundColor: "#gray-200",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  fontWeight: "500"
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ fontWeight: "600", marginBottom: "8px" }}>Sponsors List</h2>
        <Tables
          data={tableData}
          columns={columns}
          isLoading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
