import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { USERS_PAGINATED, ADMIN_USERS_PAGINATED } from "@/api/queries/admin/users";
import { UPDATE_USER, DELETE_USER } from "@/api/mutations/admin/users";

const UserDetail = ({ isAdmin = false }) => {
  const [page, setPage] = useState(0);
  const take = 20;
  const skip = page * take;
  const { data, loading, error, refetch } = useQuery(
    isAdmin ? ADMIN_USERS_PAGINATED : USERS_PAGINATED,
    { variables: { skip, take } }
  );


  const users = data?.usersPaginated || data?.adminUsersPaginated || [];

  // Admin mutations
  const [deleteUserMutation, { loading: deleting }] = useMutation(DELETE_USER);
  const [updateUserMutation] = useMutation(UPDATE_USER);

  // Simple update handler (could be a modal/form in real app)
  const handleUpdate = async (user) => {
    const input = { firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role };
    await updateUserMutation({ variables: { id: user.id, input } });
    refetch();
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUserMutation({ variables: { id: userId } });
      refetch();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Users</h2>
      <div className="bg-white shadow-md rounded-lg p-4">
        {loading ? (
          <p className="text-center py-4">Loading users...</p>
        ) : error ? (
          <p className="text-red-500 text-center py-4">Error: {error.message}</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500">No users found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id} className="py-2 flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <span className="px-3 py-1 bg-gray-200 rounded-full text-xs">{user.role}</span>
                {/* Admin controls: update/delete */}
                {isAdmin && (
                  <div className="flex gap-2">
                    <button className="text-blue-600" onClick={() => handleUpdate(user)}>Update</button>
                    <button className="text-red-600" onClick={() => handleDelete(user.id)} disabled={deleting}>Delete</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {/* Pagination controls */}
        <div className="flex justify-between mt-4">
          <button disabled={page === 0} onClick={() => setPage(page - 1)} className="px-3 py-1 bg-gray-200 rounded">Prev</button>
          <button disabled={users.length < take} onClick={() => setPage(page + 1)} className="px-3 py-1 bg-gray-200 rounded">Next</button>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
