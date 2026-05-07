// import React, { useState } from "react";
// import { useQuery } from "@apollo/client";
// import { BUSINESSES_PAGINATED, ADMIN_BUSINESSES_PAGINATED } from "@/api/queries/admin/businesses";
// import { UPDATE_BUSINESS, DELETE_BUSINESS } from "@/api/mutations/admin/businesses";
//   // Admin mutations
//   const [deleteBusinessMutation, { loading: deleting }] = useMutation(DELETE_BUSINESS);
//   const [updateBusinessMutation] = useMutation(UPDATE_BUSINESS);

//   // Simple update handler (could be a modal/form in real app)
//   const handleUpdate = async (business) => {
//     const input = { name: business.name, category: business.category };
//     await updateBusinessMutation({ variables: { id: business.id, input } });
//     // Optionally refetch
//   };

//   const handleDelete = async (businessId) => {
//     if (window.confirm("Are you sure you want to delete this business?")) {
//       await deleteBusinessMutation({ variables: { id: businessId } });
//       // Optionally refetch
//     }
//   };

// const BusinessDetail = ({ isAdmin = false }) => {
//   const [page, setPage] = useState(0);
//   const take = 20;
//   const skip = page * take;
//   const { data, loading, error } = useQuery(
//     isAdmin ? ADMIN_BUSINESSES_PAGINATED : BUSINESSES_PAGINATED,
//     { variables: { skip, take } }
//   );

//   const businesses = data?.businessesPaginated || data?.adminBusinessesPaginated || [];

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <h2 className="text-2xl font-semibold mb-4">Businesses</h2>
//       <div className="bg-white shadow-md rounded-lg p-4">
//         {loading ? (
//           <p className="text-center py-4">Loading businesses...</p>
//         ) : error ? (
//           <p className="text-red-500 text-center py-4">Error: {error.message}</p>
//         ) : businesses.length === 0 ? (
//           <p className="text-gray-500">No businesses found.</p>
//         ) : (
//           <ul className="divide-y divide-gray-200">
//             {businesses.map((business) => (
//               <li key={business.id} className="py-3 flex justify-between items-center">
//                 <div>
//                   <p className="text-lg font-medium">{business.name}</p>
//                   <p className="text-sm text-gray-600">
//                     {business.category || "No category"} • {business.addresses?.[0]?.town}, {business.addresses?.[0]?.city}
//                   </p>
//                 </div>
//                 {/* Admin controls: update/delete */}
//                 {isAdmin && (
//                   <div className="flex gap-2">
//                     <button className="text-blue-600" onClick={() => handleUpdate(business)}>Update</button>
//                     <button className="text-red-600" onClick={() => handleDelete(business.id)} disabled={deleting}>Delete</button>
//                   </div>
//                 )}
//               </li>
//             ))}
//           </ul>
//         )}
//         {/* Pagination controls */}
//         <div className="flex justify-between mt-4">
//           <button disabled={page === 0} onClick={() => setPage(page - 1)} className="px-3 py-1 bg-gray-200 rounded">Prev</button>
//           <button disabled={businesses.length < take} onClick={() => setPage(page + 1)} className="px-3 py-1 bg-gray-200 rounded">Next</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BusinessDetail;
