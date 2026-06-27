"use client";

import { useQuery, useMutation } from "@apollo/client";
import { useState } from "react";
import { FaBell, FaCheck, FaTrash, FaTimes } from "react-icons/fa";
import Modal from "@/components/otherComponents/Modal";
import {
  GET_MY_NOTIFICATIONS,
  MARK_NOTIFICATION_READ,
  DELETE_NOTIFICATION,
} from "@/api/queries/notifications";

const UserNotification = () => {
  const [selectedNotification, setSelectedNotification] = useState(null);

  const { data, loading, error, refetch } = useQuery(GET_MY_NOTIFICATIONS, {
    fetchPolicy: "network-only",
  });

  const [markRead] = useMutation(MARK_NOTIFICATION_READ, {
    onCompleted: () => refetch(),
  });

  const [deleteNotification] = useMutation(DELETE_NOTIFICATION, {
    onCompleted: () => refetch(),
  });

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = (id, e) => {
    if (e) e.stopPropagation();
    markRead({ variables: { id } });
  };

  const handleDelete = (id, e) => {
    if (e) e.stopPropagation();
    deleteNotification({ variables: { id } });
  };

  const handleMarkAllRead = () => {
    const unread = notifications.filter((n) => !n.isRead);
    unread.forEach((n) => markRead({ variables: { id: n.id } }));
  };

  const handleClearAll = () => {
    if (confirm("Clear all notifications?")) {
      notifications.forEach((n) =>
        deleteNotification({ variables: { id: n.id } }),
      );
    }
  };

  const openDetail = (notification) => {
    setSelectedNotification(notification);
    if (!notification.isRead) {
      handleMarkRead(notification.id);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        style={{ marginTop: "10px" }}
      >
        <div className="animate-pulse text-gray-400 font-medium">
          Loading notifications...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        style={{ marginTop: "10px" }}
      >
        <p className="text-red-500 text-sm">
          Failed to load notifications: {error.message}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50" style={{ marginTop: "10px" }}>
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {unreadCount} unread message{unreadCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="flex-1 sm:flex-none text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  padding: "6px 12px",
                  backgroundColor: "purple",
                  fontSize: "13px",
                }}
              >
                <FaCheck className="w-3 h-3" />
                Read All
              </button>
              <button
                onClick={handleClearAll}
                disabled={notifications.length === 0}
                className="flex-1 sm:flex-none text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#D22730",
                  fontSize: "13px",
                }}
              >
                <FaTrash className="w-3 h-3" />
                Clear All
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <FaBell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">
                  You&apos;re all caught up!
                </p>
                <p className="text-gray-300 text-sm mt-1">
                  No notifications yet.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => openDetail(notification)}
                  className="bg-white rounded-xl shadow-sm border cursor-pointer hover:shadow-md transition-shadow p-3 sm:p-4 flex flex-col xs:flex-row items-start justify-between gap-3"
                  style={{
                    borderColor: notification.isRead ? "#F3F4F6" : "#EFF6FF",
                    borderLeftWidth: notification.isRead ? "1px" : "3px",
                    borderLeftColor: notification.isRead
                      ? "#F3F4F6"
                      : "#3B82F6",
                  }}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor: notification.isRead
                          ? "#F9FAFB"
                          : "#EFF6FF",
                      }}
                    >
                      <FaBell
                        className="w-3 h-3"
                        style={{
                          color: notification.isRead ? "#9CA3AF" : "#3B82F6",
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`font-semibold text-sm ${notification.isRead ? "text-gray-600" : "text-gray-900"} break-words`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2 break-words">
                        {notification.content}
                      </p>
                      <p className="text-gray-300 text-[10px] sm:text-xs mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 self-end xs:self-start ml-auto xs:ml-4 flex-shrink-0">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => handleMarkRead(notification.id, e)}
                        className="p-2 rounded-full hover:bg-blue-50 transition-colors"
                        title="Mark as read"
                        style={{ color: "#3B82F6" }}
                      >
                        <FaCheck className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(notification.id, e)}
                      className="p-2 rounded-full hover:bg-red-50 transition-colors"
                      title="Delete notification"
                      style={{ color: "#D22730" }}
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedNotification && (
        <Modal onClose={() => setSelectedNotification(null)}>
          <div style={{ padding: "8px" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <FaBell className="w-4 h-4 text-blue-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                {selectedNotification.title}
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {selectedNotification.content}
            </p>
            <p className="text-xs text-gray-400 mt-4">
              {new Date(selectedNotification.createdAt).toLocaleString()}
            </p>
          </div>
        </Modal>
      )}
    </>
  );
};

export default UserNotification;
