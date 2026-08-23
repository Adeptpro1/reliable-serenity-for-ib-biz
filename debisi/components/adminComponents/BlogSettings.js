"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { UPDATE_BLOG, DELETE_BLOG } from "@/graphql/mutations/admin/blog";
import { GET_BLOGS, CREATE_BLOG } from "@/graphql/queries/admin/blog";
import Tables from "../otherComponents/Tables"; // Import your Tables component
import { toast } from "react-hot-toast";

export default function BlogSettings() {
  const { data, loading, refetch } = useQuery(GET_BLOGS, {
    fetchPolicy: "network-only",
  });
  const [createBlog, { loading: creating }] = useMutation(CREATE_BLOG);
  const [updateBlog, { loading: updating }] = useMutation(UPDATE_BLOG);
  const [deleteBlog, { loading: deleting }] = useMutation(DELETE_BLOG);

  const [form, setForm] = useState({
    id: null,
    title: "",
    content: "",
    mediaUrls: "",
  });

  if (loading) return <p className="p-6 text-gray-500">Loading blog posts...</p>;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!form.title.trim() || !form.content.trim() || !form.mediaUrls.trim()) {
      toast.error("Title, content, and media URLs are required.");
      return;
    }

    try {
      if (form.id) {
        await updateBlog({
          variables: {
            id: form.id,
            title: form.title,
            content: form.content,
            mediaUrls: form.mediaUrls,
          },
        });
        toast.success("Blog post updated successfully!");
      } else {
        await createBlog({
          variables: {
            title: form.title,
            content: form.content,
            mediaUrls: form.mediaUrls,
          },
        });
        toast.success("Blog post created successfully!");
      }
      setForm({ id: null, title: "", content: "", mediaUrls: "" });
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to save blog post");
    }
  };

  const handleEdit = (post) => {
    setForm({
      id: post.id,
      title: post.title || "",
      content: post.content || "",
      mediaUrls: post.mediaUrls || "",
    });
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`Are you sure you want to delete "${post.title}"?`)) return;
    try {
      await deleteBlog({ variables: { id: post.id } });
      toast.success("Blog post deleted");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to delete blog post");
    }
  };

  // Define columns for the Tables component
  const columns = [
    { field: "title", title: "Title" },
    { field: "createdAt", title: "Created At", hideOnMobile: true },
    { field: "mediaUrls", title: "Media URLs", hideOnMobile: true },
  ];

  // Prepare data for the Tables component
  const tableData = data?.blogPosts?.map((post) => ({
    ...post,
    createdAt: post.createdAt ? new Date(Number(post.createdAt) || post.createdAt).toLocaleDateString() : "—",
  })) || [];

  return (
    <div className="bg-gray-50 min-h-screen" style={{ padding: '1.5rem' }}>
      <h1 className="text-2xl font-bold" style={{ marginBottom: '1.5rem' }}>
        Admin Blog Management
      </h1>

      {/* Form */}
      <div className="bg-white rounded shadow" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <h2 className="text-lg font-semibold" style={{ marginBottom: '1rem' }}>
          {form.id ? 'Edit Blog Post' : 'Create Blog Post'}
        </h2>

        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="w-full border rounded"
          style={{ padding: '0.5rem', marginBottom: '0.5rem' }}
        />

        <textarea
          name="content"
          placeholder="Content"
          value={form.content}
          onChange={handleChange}
          className="w-full border rounded"
          style={{ padding: '0.5rem', marginBottom: '0.5rem' }}
        />

        <input
          type="text"
          name="mediaUrls"
          placeholder="Media URLs"
          value={form.mediaUrls}
          onChange={handleChange}
          className="w-full border rounded"
          style={{ padding: '0.5rem', marginBottom: '0.5rem' }}
        />

        <button
          onClick={handleSubmit}
          className="bg-black text-white rounded"
          style={{
            padding: '0.5rem 1rem',
            marginTop: '0.5rem',
          }}
        >
          {form.id ? 'Update' : 'Create'}
        </button>
      </div>

      {/* Blog List Table */}
      <div className="bg-white rounded shadow" style={{ padding: '1rem' }}>
        <h2 className="text-lg font-semibold" style={{ marginBottom: '1rem' }}>
          All Blog Posts
        </h2>
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
