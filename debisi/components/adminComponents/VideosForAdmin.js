"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ADMIN_VIDEOS } from "@/graphql/queries/business/videos";
import { ADMIN_DELETE_VIDEO, ADMIN_UPDATE_VIDEO } from "../../graphql/mutations/admin/videos";
import AdminSearch from "./AdminSearch";
import Table from "../otherComponents/Tables";
import Modal from "../otherComponents/Modal";
import { FiVideo } from "react-icons/fi";
import { toast } from "react-hot-toast";

const VideosForAdmin = () => {
  const [filteredVideos, setFilteredVideos] = useState([]);

  const { data, loading, error, refetch } = useQuery(GET_ADMIN_VIDEOS, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data?.businessVideos) {
      setFilteredVideos(data.businessVideos);
    }
  }, [data]);

  const [deleteVideo] = useMutation(ADMIN_DELETE_VIDEO, {
    onCompleted: () => {
      toast.success("Video deleted successfully");
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [updateVideo, { loading: updating }] = useMutation(ADMIN_UPDATE_VIDEO);

  const [editingVideo, setEditingVideo] = useState(null);
  const [editForm, setEditForm] = useState({
    boosted: false,
    isSponsored: false,
  });

  const videos = data?.businessVideos || [];

  const handleDelete = async (row) => {
    if (!row) return;
    if (window.confirm("Are you sure you want to delete this video?")) {
      await deleteVideo({ variables: { id: row.id } });
    }
  };

  const handleEdit = (row) => {
    setEditingVideo(row);
    setEditForm({
      boosted: row.boosted || false,
      isSponsored: row.isSponsored || false,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateVideo({
        variables: {
          id: editingVideo.id,
          input: editForm,
        },
      });
      toast.success("Video updated successfully");
      setEditingVideo(null);
      await refetch();
    } catch (err) {
      toast.error("Failed to update video");
    }
  };

  const columns = [
    { title: "ID", field: "id", render: (row) => <span className="text-[10px] text-gray-400">{row.id.slice(0, 8)}...</span> },
    { title: "Business", field: "business", render: (row) => <span className="font-semibold">{row.business?.name || "N/A"}</span> },
    {
      title: "Video URL",
      field: "videoUrl",
      render: (row) => (
        <a
          href={row.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Watch Video
        </a>
      ),
    },
    { title: "Boosted", field: "boosted", render: (row) => (row.boosted ? "Yes" : "No") },
    { title: "Sponsored", field: "isSponsored", render: (row) => (row.isSponsored ? "Yes" : "No") },
    { title: "Views", field: "views" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Overview Section */}
      <h1 className="text-2xl font-bold text-gray-800" style={{ padding: '5px', marginBottom: '5px'}}>Overview of Videos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
      <div className="bg-white rounded-lg shadow flex items-center" style={{ padding: '10px'}}>
      <div className="bg-blue-100 rounded-full text-blue-600" style={{ padding: '5px'}}>
          <FiVideo size={17} />
        </div>
        <div style={{ marginLeft: '5px'}}>
          <p className="text-gray-600">Total Videos</p>
          <h2 className="text-xl font-semibold text-gray-800">{videos.length}</h2>
        </div>
      </div>
      </div>

      {/* Search & Table */}
      <div className="bg-white p-5 rounded-lg shadow">
        <AdminSearch data={videos} onFilter={setFilteredVideos} />
        <Table data={filteredVideos} columns={columns} onEdit={handleEdit} onDelete={handleDelete} isLoading={loading} />
      </div>

      {editingVideo && (
        <Modal title="Edit Video" onClose={() => setEditingVideo(null)}>
          <form onSubmit={handleUpdate} className="flex flex-col" style={{ gap: '16px' }}>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={editForm.boosted}
                onChange={(e) => setEditForm({ ...editForm, boosted: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Boosted</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={editForm.isSponsored}
                onChange={(e) => setEditForm({ ...editForm, isSponsored: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Sponsored</label>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setEditingVideo(null)}
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

export default VideosForAdmin;
