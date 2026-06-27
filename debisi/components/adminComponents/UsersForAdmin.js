"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { FiUsers, FiBriefcase } from "react-icons/fi";
import Table from "../otherComponents/Tables";
import {
  GET_ADMIN_USERS
} from "../../graphql/queries/admin/users";
import { ADMIN_DELETE_USER, ADMIN_UPDATE_USER } from "../../graphql/mutations/admin/users";
import Modal from "../otherComponents/Modal";
import AdminSearch from "./AdminSearch";

const UsersForAdmin = () => {
  const [page, setPage] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    isEmailVerified: false,
  });
  const [filteredUsers, setFilteredUsers] = useState([]);
  const take = 20;

  // Fetch users from GraphQL
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_USERS, {
    variables: { pagination: { take, skip: page * take } },
  });

  // Sync data to filtered state safely after mount
  useEffect(() => {
    if (data?.adminUsersPaginated) {
      const flattened = data.adminUsersPaginated.map((u) => ({
        ...u,
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
        businessesList: u.businesses?.map((b) => b.name).join(", ") || "",
      }));
      setFilteredUsers(flattened);
    }
  }, [data]);

  const [deleteUser, { loading: deleting }] = useMutation(ADMIN_DELETE_USER);
  const [updateUser, { loading: updating }] = useMutation(ADMIN_UPDATE_USER);

  // Accept the full row from Tables onDelete and delete by id
  const handleDelete = async (row) => {
    if (!row || !row.id) return;
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser({ variables: { id: row.id } });
        alert("User deleted successfully");
        await refetch();
      } catch (err) {
        alert("Failed to delete user");
        console.error(err);
      }
    }
  };

  const handleEdit = (row) => {
    setEditingUser(row);
    setEditForm({
      firstName: row.firstName || "",
      lastName: row.lastName || "",
      email: row.email || "",
      role: row.role || "USER",
      isEmailVerified: row.isEmailVerified || false,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateUser({
        variables: {
          id: editingUser.id,
          input: editForm,
        },
      });
      alert("User updated successfully");
      setEditingUser(null);
      await refetch();
    } catch (err) {
      alert("Failed to update user");
      console.error(err);
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error loading users.</p>;

  const users = data?.adminUsersPaginated || [];

  // Helper for search to always have access to latest full list
  const flatUsers = (data?.adminUsersPaginated || []).map((u) => ({
    ...u,
    name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
    businessesList: u.businesses?.map((b) => b.name).join(", ") || "",
  }));

  const columns = [
    { title: "ID", field: "id", hideOnMobile: true },
    { title: "Name", field: "name" },
    { title: "Email", field: "email", hideOnMobile: true },
    { title: "Role", field: "role" },
    { title: "Businesses", field: "businessesList", hideOnMobile: true },
  ];

  const usersWithBusiness = users.filter(
    (u) => u.businesses && u.businesses.length > 0
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between" style={{ gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-sm text-gray-500">Manage and monitor all platform users</p>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '24px', marginBottom: '24px' }}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow" style={{ padding: '24px', gap: '16px' }}>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">
            <FiUsers />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Users</p>
            <h2 className="text-3xl font-bold text-gray-900">
              {users.length}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow" style={{ padding: '24px', gap: '16px' }}>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">
            <FiBriefcase />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">With Business</p>
            <h2 className="text-3xl font-bold text-gray-900">
              {usersWithBusiness.length}
            </h2>
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
        <div className="mb-6">
          <AdminSearch data={flatUsers} onFilter={setFilteredUsers} />
        </div>
        <Table 
          data={filteredUsers} 
          columns={columns} 
          onDelete={handleDelete} 
          onEdit={handleEdit}
          isLoading={loading || deleting || updating} 
        />

        <div className="flex items-center justify-between" style={{ marginTop: '24px', paddingLeft: '8px', paddingRight: '8px' }}>
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="flex items-center bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
            style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', gap: '8px' }}
          >
            Previous Page
          </button>
          
          <div className="text-sm font-medium text-gray-400">
            Page <span className="text-gray-900 font-bold">{page + 1}</span>
          </div>

          <button
            disabled={users.length < take}
            onClick={() => setPage(page + 1)}
            className="flex items-center bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
            style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', gap: '8px' }}
          >
            Next Page
          </button>
        </div>
      </div>

      {editingUser && (
        <Modal title="Edit User" onClose={() => setEditingUser(null)}>
          <form onSubmit={handleUpdate} className="flex flex-col" style={{ gap: '16px' }}>
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={editForm.isEmailVerified}
                onChange={(e) => setEditForm({ ...editForm, isEmailVerified: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Email Verified</label>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
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

export default UsersForAdmin;
