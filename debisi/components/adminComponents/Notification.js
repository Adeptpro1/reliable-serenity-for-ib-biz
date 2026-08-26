"use client";

import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import Table from "../otherComponents/Tables";
import AdminSearch from "./AdminSearch";
import { FiBell, FiSend, FiTrash2, FiUsers, FiMail } from "react-icons/fi";
import { toast } from "react-hot-toast";

// ─── GraphQL ────────────────────────────────────────────────────────────────

const GET_ALL_NOTIFICATIONS = gql`
  query AdminGetAllNotifications($pagination: PaginationInput, $isRead: Boolean) {
    adminNotificationsCount
    unreadCount: adminNotificationsCount(isRead: false)
    adminAllNotifications(pagination: $pagination, isRead: $isRead) {
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
  mutation BroadcastNotification($title: String!, $content: String!, $type: String, $userId: ID, $sendPush: Boolean) {
    broadcastNotification(title: $title, content: $content, type: $type, userId: $userId, sendPush: $sendPush)
  }
`;

const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;

const GET_USERS_LIST = gql`
  query GetUsersListForNotification($pagination: PaginationInput) {
    adminUsersPaginated(pagination: $pagination) {
      id
      firstName
      lastName
      email
    }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const NotificationsForAdmin = () => {
  const [form, setForm] = useState({ title: "", content: "", type: "ALL", userId: "", sendPush: false });
  const [page, setPage] = useState(0);
  const [readFilter, setReadFilter] = useState("ALL"); // ALL, UNREAD, READ
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const take = 20;

  const isReadVar = readFilter === "UNREAD" ? false : readFilter === "READ" ? true : undefined;

  const { data, loading, error, refetch } = useQuery(GET_ALL_NOTIFICATIONS, {
    variables: {
      pagination: { take, skip: page * take },
      isRead: isReadVar,
    },
    fetchPolicy: "network-only",
  });

  const { data: usersData } = useQuery(GET_USERS_LIST, {
    variables: { pagination: { take: 1000 } },
    skip: form.type !== "SPECIFIC",
  });

  const users = usersData?.adminUsersPaginated || [];

  const [broadcastNotification, { loading: broadcasting }] = useMutation(BROADCAST_NOTIFICATION, {
    onCompleted: () => {
      toast.success("Notification sent!");
      setForm({ title: "", content: "", type: "ALL", userId: "", sendPush: false });
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
  const totalCount = data?.adminNotificationsCount || notifications.length;
  const unreadCount = data?.unreadCount ?? notifications.filter((n) => !n.isRead).length;

  const handleSend = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      return toast.error("Title and message are required.");
    }
    if (form.type === "SPECIFIC" && !form.userId) {
      return toast.error("Please select a specific recipient.");
    }

    broadcastNotification({
      variables: {
        title: form.title,
        content: form.content,
        type: form.type === "SPECIFIC" ? null : form.type,
        userId: form.type === "SPECIFIC" ? form.userId : null,
        sendPush: form.sendPush,
      },
    });
  };

  const handleDelete = (row) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      deleteNotification({ variables: { id: row.id } });
    }
  };

  const columns = [
    {
      title: "User",
      field: "user",
      render: (row) => (
        <div>
          <p className="font-semibold text-sm text-gray-800">
            {row.user?.firstName} {row.user?.lastName}
          </p>
          <p className="text-xs text-gray-400">{row.user?.email}</p>
        </div>
      ),
    },
    {
      title: "Title",
      field: "title",
      render: (row) => <span className="font-medium">{row.title}</span>,
    },
    {
      title: "Message",
      field: "content",
      render: (row) => (
        <span className="text-sm text-gray-500 max-w-xs truncate block" title={row.content}>
          {row.content}
        </span>
      ),
    },
    {
      title: "Status",
      field: "isRead",
      render: (row) =>
        row.isRead ? (
          <span className="text-xs bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded-full">
            Read
          </span>
        ) : (
          <span className="text-xs bg-yellow-50 text-yellow-700 font-bold px-2.5 py-1 rounded-full">
            Unread
          </span>
        ),
    },
    {
      title: "Sent",
      field: "createdAt",
      render: (row) => (
        <span className="text-xs text-gray-400">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", backgroundColor: "#F9FAFB", minHeight: "100vh" }}>
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between"
        style={{ gap: "16px", marginBottom: "24px" }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-sm text-gray-500">Broadcast messages and monitor alerts to all platform users</p>
        </div>
        {/* Stats */}
        <div className="flex items-center gap-4">
          <div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center"
            style={{ padding: "12px 20px", gap: "12px" }}
          >
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <FiUsers size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sent</p>
              <h2 className="text-xl font-bold text-gray-900">{totalCount}</h2>
            </div>
          </div>
          <div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center"
            style={{ padding: "12px 20px", gap: "12px" }}
          >
            <div className="w-9 h-9 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
              <FiBell size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unread</p>
              <h2 className="text-xl font-bold text-gray-900">{unreadCount}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Form */}
      <div
        className="bg-white rounded-2xl shadow-sm border border-gray-100"
        style={{ padding: "24px", marginBottom: "24px" }}
      >
        <div className="flex items-center" style={{ gap: "10px", marginBottom: "20px" }}>
          <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <FiSend size={14} />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Send Notification</h2>
        </div>
        <form onSubmit={handleSend} className="flex flex-col" style={{ gap: "16px" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: "6px" }}>
                Send To
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value, userId: "" })}
                className="block w-full border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all text-gray-700"
                style={{ padding: "10px 14px" }}
              >
                <option value="ALL">All Users</option>
                <option value="WITH_BUSINESS">Users with Business</option>
                <option value="WITHOUT_BUSINESS">Users without Business</option>
                <option value="SPECIFIC">Specific User</option>
              </select>
            </div>

            {form.type === "SPECIFIC" && (
              <div>
                <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: "6px" }}>
                  Select User
                </label>
                <select
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  className="block w-full border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all text-gray-700"
                  style={{ padding: "10px 14px" }}
                >
                  <option value="">Choose a user...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: "6px" }}>
              Title
            </label>
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
            <label className="block text-sm font-medium text-gray-700" style={{ marginBottom: "6px" }}>
              Message
            </label>
            <textarea
              placeholder="Write your notification message here..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="block w-full border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
              style={{ padding: "10px 14px", minHeight: "100px", resize: "vertical" }}
            />
          </div>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <input
              type="checkbox"
              id="sendPush"
              checked={form.sendPush}
              onChange={(e) => setForm({ ...form, sendPush: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-200 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="sendPush" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
              Send as Push Notification (routes users to notifications screen)
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={broadcasting}
              className="flex items-center bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              style={{ padding: "10px 24px", gap: "8px" }}
            >
              <FiSend size={14} />
              {broadcasting
                ? "Sending..."
                : form.type === "SPECIFIC"
                ? "Send to User"
                : `Send to ${
                    form.type === "ALL"
                      ? "All Users"
                      : form.type === "WITH_BUSINESS"
                      ? "Business Owners"
                      : "Non-Business Owners"
                  }`}
            </button>
          </div>
        </form>
      </div>

      {/* Notification Log */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100" style={{ padding: "20px" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-base font-bold text-gray-800">Notification Log</h2>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-fit">
            {[
              { id: "ALL", label: "All" },
              { id: "UNREAD", label: "Unread" },
              { id: "READ", label: "Read" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setReadFilter(tab.id);
                  setPage(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  readFilter === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">Error: {error.message}</p>}

        <div className="mb-4">
          <AdminSearch data={notifications} onFilter={setFilteredNotifications} />
        </div>

        <Table
          data={filteredNotifications.length > 0 ? filteredNotifications : notifications}
          columns={columns}
          isLoading={loading}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        <div
          className="flex items-center justify-between"
          style={{ marginTop: "24px", paddingLeft: "8px", paddingRight: "8px" }}
        >
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
            style={{ padding: "8px 16px" }}
          >
            Previous Page
          </button>

          <div className="text-sm font-medium text-gray-400">
            Page <span className="text-gray-900 font-bold">{page + 1}</span>
          </div>

          <button
            disabled={notifications.length < take}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
            style={{ padding: "8px 16px" }}
          >
            Next Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsForAdmin;
