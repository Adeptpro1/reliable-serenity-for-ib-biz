"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_EVENTS, CREATE_EVENT, DELETE_EVENT, UPDATE_EVENT } from "@/api/queries/events";
import AdminSearch from "./AdminSearch"; 
import Table from "../otherComponents/Tables";
import Modal from "../otherComponents/Modal";
import { FiCalendar, FiExternalLink, FiPlus } from "react-icons/fi";
import { toast } from "react-hot-toast";

const EventsForAdmin = () => {
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", date: "", imageUrl: "", link: "" });

  // Edit state
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", date: "", imageUrl: "", link: "" });

  const { data, loading, error, refetch } = useQuery(GET_EVENTS, {
    onCompleted: (data) => setFilteredEvents(data.events),
    fetchPolicy: "network-only",
  });

  const [createEvent, { loading: creating }] = useMutation(CREATE_EVENT, {
    onCompleted: () => {
      toast.success("Event created successfully!");
      setShowCreateForm(false);
      setFormData({ title: "", description: "", date: "", imageUrl: "", link: "" });
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [deleteEvent] = useMutation(DELETE_EVENT, {
    onCompleted: () => {
      toast.success("Event deleted!");
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [updateEvent, { loading: updating }] = useMutation(UPDATE_EVENT, {
    onCompleted: () => {
      toast.success("Event updated successfully!");
      setEditingEvent(null);
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const events = data?.events || [];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.date) {
      return toast.error("Title, Description, and Date are required!");
    }
    createEvent({ variables: { ...formData } });
  };

  const handleEdit = (row) => {
    setEditingEvent(row);
    // Convert timestamp back to datetime-local format if needed
    const dateValue = row.date
      ? new Date(Number(row.date) || row.date).toISOString().slice(0, 16)
      : "";
    setEditForm({
      title: row.title || "",
      description: row.description || "",
      date: dateValue,
      imageUrl: row.imageUrl || "",
      link: row.link || "",
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editForm.title || !editForm.description || !editForm.date) {
      return toast.error("Title, Description, and Date are required!");
    }
    updateEvent({
      variables: {
        id: editingEvent.id,
        title: editForm.title,
        description: editForm.description,
        date: editForm.date,
        imageUrl: editForm.imageUrl || null,
        link: editForm.link || null,
      },
    });
  };

  const handleDelete = (row) => {
    if (confirm("Delete this event?")) {
      deleteEvent({ variables: { id: row.id } });
    }
  };

  const columns = [
    { title: "ID", field: "id", render: (row) => <span className="text-[10px] text-gray-400">{row.id.slice(0, 8)}...</span> },
    { title: "Title", field: "title", render: (row) => <span style={{ fontWeight: 600 }}>{row.title}</span> },
    { title: "Date", field: "date", render: (row) => new Date(Number(row.date) || row.date).toLocaleString() },
    {
      title: "Link",
      field: "link",
      render: (row) => row.link ? (
        <a href={row.link} target="_blank" rel="noopener noreferrer"
          style={{ padding: "4px", color: "#2563EB", display: "inline-flex" }}
          title="Visit Link"
        >
          <FiExternalLink size={14} />
        </a>
      ) : <span className="text-gray-400 text-xs">—</span>
    },
  ];

  if (loading && !events.length) return <div style={{ padding: "40px", textAlign: "center" }}>Loading events...</div>;
  if (error) return <div style={{ padding: "40px", textAlign: "center", color: "#EF4444" }}>Error: {error.message}</div>;

  return (
    <div style={{ padding: "24px", backgroundColor: "#F9FAFB", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1F2937", margin: 0 }}>Platform Events</h1>
          <p style={{ fontSize: "14px", color: "#6B7280", margin: "4px 0 0" }}>Manage all platform events</p>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center" style={{ padding: "10px 16px", gap: "10px" }}>
            <FiCalendar className="text-blue-500" />
            <span className="text-sm font-semibold text-gray-700">{events.length} Events</span>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#2563EB", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}
          >
            <FiPlus /> {showCreateForm ? "Cancel" : "Create Event"}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", border: "1px solid #F3F4F6", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px", color: "#1F2937" }}>New Event</h2>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "16px" }}>
              <input type="text" placeholder="Event Title" value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E7EB", outline: "none" }}
              />
              <input type="datetime-local" value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E7EB", outline: "none" }}
              />
            </div>
            <textarea placeholder="Event Description" value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E5E7EB", outline: "none", minHeight: "100px", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: "16px" }}>
              <input type="text" placeholder="Image URL (optional)" value={formData.imageUrl}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E7EB", outline: "none" }}
              />
              <input type="text" placeholder="External Registration Link (optional)" value={formData.link}
                onChange={e => setFormData({ ...formData, link: e.target.value })}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E7EB", outline: "none" }}
              />
            </div>
            <button type="submit" disabled={creating}
              style={{ backgroundColor: "#10B981", color: "white", padding: "12px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: creating ? "not-allowed" : "pointer" }}
            >
              {creating ? "Creating..." : "Save Event"}
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: "#FFFFFF", padding: "20px", borderRadius: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", border: "1px solid #F3F4F6" }}>
        <div style={{ marginBottom: "24px" }}>
          <AdminSearch data={events} onFilter={setFilteredEvents} />
        </div>
        <Table data={filteredEvents} columns={columns} onEdit={handleEdit} onDelete={handleDelete} isLoading={loading} />
      </div>

      {/* Edit Modal */}
      {editingEvent && (
        <Modal title="Edit Event" onClose={() => setEditingEvent(null)}>
          <form onSubmit={handleUpdate} className="flex flex-col" style={{ gap: "16px" }}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date & Time</label>
              <input type="datetime-local" value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                rows="4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Image URL</label>
              <input type="text" value={editForm.imageUrl}
                onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Link</label>
              <input type="text" value={editForm.link}
                onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="https://..."
              />
            </div>
            <div className="flex justify-end pt-4">
              <button type="button" onClick={() => setEditingEvent(null)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3"
              >
                Cancel
              </button>
              <button type="submit" disabled={updating}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default EventsForAdmin;
