"use client";

import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import Table from "../otherComponents/Tables";
import { FiBell, FiSend, FiTrash2, FiUsers } from "react-icons/fi";
import { toast } from "react-hot-toast";

// ─── GraphQL ────────────────────────────────────────────────────────────────

const GET_ALL_NOTIFICATIONS = gql`
  query AdminGetAllNotifications {
    adminAllNotifications {
      id
      title
      content
      isRead
      clicks
      createdAt
      user {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

const BROADCAST_NOTIFICATION = gql`
  mutation BroadcastNotification($title: String!, $content: String!, $type: String) {
    broadcastNotification(title: $title, content: $content, type: $type)
  }
`;

const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const NotificationsForAdmin = () => {
  const [form, setForm] = useState({ title: "", content: "" });

  const { data, loading, error, refetch } = useQuery(GET_ALL_NOTIFICATIONS, {
    fetchPolicy: "network-only",
  });

  const [broadcastNotification, { loading: broadcasting }] = useMutation(BROADCAST_NOTIFICATION, {
    onCompleted: () => {
      toast.success("Notification sent to all users!");
      setForm({ title: "", content: "" });
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const [deleteNotification] = useMutation(DELETE_NOTIFICATION, {
    onCompleted: () => {
      toast.success("Notification deleted");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const notifications = data?.adminAllNotifications || [];

  const handleSend = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      return toast.error("Title and message are required.");
    }
    broadcastNotification({ variables: { title: form.title, content: form.content } });
  };

  const handleDelete = (row) => {
    if (confirm("Delete this notification?")) {
      deleteNotification({ variables: { id: row.id } });
    }
  };

  const columns = [
    { title: "User", field: "user", render: (row) => (
      <div>
        <p className="font-semibold text-sm text-gray-800">{row.user?.firstName} {row.user?.lastName}</p>
        <p className="text-xs text-gray-400">{row.user?.email}</p>
      </div>
    )},
    { title: "Title", field: "title", render: (row) => <span className="font-medium">{row.title}</span> },
    { title: "Message", field: "content", render: (row) => (
      <span className="text-sm text-gray-500 max-w-xs truncate block" title={row.content}>{row.content}</span>
    )},
    { title: "Read", field: "isRead", render: (row) => row.isRead
      ? <span className="text-xs bg-green-50 text-green-700 font-bold px-2 py-1 rounded-full">Read</span>
      : <span className="text-xs bg-yellow-50 text-yellow-700 font-bold px-2 py-1 rounded-full">Unread</span>
    },
    { title: "Sent", field: "createdAt", render: (row) => (
      <span className="text-xs text-gray-400">{new Date(row.createdAt).toLocaleDateString()}</span>
    )},
  ];

  return (
    <div style={{ padding: "24px", backgroundColor: "#F9FAFB", minHeight: "100vh" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between" style={{ gap: "16px", marginBottom: "24px" }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-sm text-gray-500">Broadcast messages to all platform users</p>
        </div>
        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center" style={{ padding: "12px 20px", gap: "12px" }}>
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <FiUsers size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sent</p>
              <h2 className="text-xl font-bold text-gray-900">{notifications.length}</h2>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center" style={{ padding: "12px 20px", gap: "12px" }}>
            <div className="w-9 h-9 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
              <FiBell size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unread</p>
              <h2 className="text-xl font-bold text-gray-900">{notifications.filter(n => !n.isRead).length}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100" style={{ padding: "24px", marginBottom: "24px" }}>
        <div className="flex items-center" style={{ gap: "10px", marginBottom: "20px" }}>
          <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <FiSend size={14} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Broadcast to All Users</h2>
        </div>
        <form onSubmit={handleSend} className="flex flex-col" style={{ gap: "16px" }}>
          <div>
            <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: "6px" }}>Title</label>
            <input
              type="text"
              placeholder="Notification title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="block w-full border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
              style={{ padding: "10px 14px" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: "6px" }}>Message</label>
            <textarea
              placeholder="Write your notification message here..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="block w-full border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
              style={{ padding: "10px 14px", minHeight: "100px", resize: "vertical" }}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={broadcasting}
              className="flex items-center bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              style={{ padding: "10px 24px", gap: "8px" }}
            >
              <FiSend size={14} />
              {broadcasting ? "Sending..." : "Send to All Users"}
            </button>
          </div>
        </form>
      </div>

      {/* Notification Log */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100" style={{ padding: "20px" }}>
        <h2 className="text-base font-bold text-gray-800" style={{ marginBottom: "16px" }}>Notification Log</h2>
        {error && <p className="text-red-500 text-sm">Error: {error.message}</p>}
        <Table
          data={notifications}
          columns={columns}
          isLoading={loading}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default NotificationsForAdmin;
