"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ADMIN_NOTICES, DELETE_NOTICE } from "@/graphql/queries/business/notice";
import { EXPORT_LEADS_CSV } from "@/graphql/queries/report";
import AdminSearch from "./AdminSearch"; 
import Table from "../otherComponents/Tables";
import { FiClipboard, FiTrash2, FiTrendingUp, FiExternalLink } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useApolloClient } from "@apollo/client";
import { ADMIN_DELETE_NOTICE, ADMIN_UPDATE_NOTICE } from "../../graphql/mutations/admin/notices";
import Modal from "../otherComponents/Modal";


const NoticesForAdmin = () => {
  const [filteredNotices, setFilteredNotices] = useState([]);
  
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_NOTICES);
  
  useEffect(() => {
    if (data?.noticeboards) {
      setFilteredNotices(data.noticeboards);
    }
  }, [data]);

  const [deleteNotice] = useMutation(ADMIN_DELETE_NOTICE, {
    onCompleted: () => {
      toast.success("Notice deleted successfully");
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [updateNotice, { loading: updating }] = useMutation(ADMIN_UPDATE_NOTICE);

  const [editingNotice, setEditingNotice] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    boosted: false,
  });

  const handleDelete = async (row) => {
    if (!row) return;
    if (window.confirm("Are you sure you want to delete this notice?")) {
      await deleteNotice({ variables: { id: row.id } });
    }
  };

  const handleEdit = (row) => {
    setEditingNotice(row);
    setEditForm({
      title: row.title || "",
      content: row.content || "",
      boosted: row.boosted || false,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateNotice({
        variables: {
          id: editingNotice.id,
          input: editForm,
        },
      });
      toast.success("Notice updated successfully");
      setEditingNotice(null);
      await refetch();
    } catch (err) {
      toast.error("Failed to update notice");
    }
  };


  const client = useApolloClient();

  const handleExportCSV = async (noticeId, noticeTitle) => {
    try {
      const { data } = await client.query({
        query: EXPORT_LEADS_CSV,
        variables: { noticeId },
        fetchPolicy: "network-only"
      });
      
      const csvString = data.exportLeadsCSV;
      
      // Trigger download
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Leads_${noticeTitle.replace(/\s+/g, "_")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV Downloaded successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to download CSV");
    }
  };

  const notices = data?.noticeboards || [];

  const columns = [
    { title: "ID", field: "id", render: (row) => <span className="text-[10px] text-gray-400">{row.id.slice(0, 8)}...</span> },
    { title: "Business", field: "business", render: (row) => <span className="font-semibold">{row.business.name}</span> },
    { title: "Title", field: "title" },
    { 
      title: "Boosted", 
      field: "boosted", 
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.boosted ? (
            <span className="flex items-center gap-1 text-orange-600 font-bold text-xs bg-orange-50 px-2 py-1 rounded-full">
              <FiTrendingUp /> YES
            </span>
          ) : (
            <span className="text-gray-400 text-xs">NO</span>
          )}
        </div>
      ) 
    },
    { 
      title: "Expiry", 
      field: "boostExpiresAt", 
      render: (row) => row.boostExpiresAt ? new Date(row.boostExpiresAt).toLocaleDateString() : "N/A" 
    },
    { 
      title: "Quick Links", 
      field: "actions", 
      render: (row) => (
        <div className="flex gap-2">
           <button 
            onClick={(e) => {
              e.stopPropagation();
              handleExportCSV(row.id, row.title)
            }}
            className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100"
            title="Export Leads CSV"
          >
            <FiClipboard size={14} />
          </button>
        </div>
      )
    },
  ];

  if (loading) return <div className="p-10 text-center">Loading notices...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Global Notice Board</h1>
        <div className="flex gap-4">
           <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <FiClipboard size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Total Notices</p>
                <h2 className="text-xl font-bold text-gray-800">{notices.length}</h2>
              </div>
           </div>
           <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <FiTrendingUp size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Boosted</p>
                <h2 className="text-xl font-bold text-gray-800">{notices.filter(n => n.boosted).length}</h2>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-6">
          <AdminSearch data={notices} onFilter={setFilteredNotices} />
        </div>
        <Table data={filteredNotices} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      {editingNotice && (
        <Modal title="Edit Notice" onClose={() => setEditingNotice(null)}>
          <form onSubmit={handleUpdate} className="flex flex-col" style={{ gap: '16px' }}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                rows="4"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={editForm.boosted}
                onChange={(e) => setEditForm({ ...editForm, boosted: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Boosted</label>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setEditingNotice(null)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {updating ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default NoticesForAdmin;
