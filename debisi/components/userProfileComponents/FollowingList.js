import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import Link from "next/link";
import { FaTrash, FaExternalLinkAlt } from "react-icons/fa";
import { GET_MY_FOLLOWS } from "@/graphql/queries/business/follow";
import { UNFOLLOW_BUSINESS } from "@/graphql/mutations/business/follow";
import { toast } from "react-hot-toast";
import bnwLogo from "@/images/debisi_logo_bnw.png";
import Image from "next/image";

const FollowingList = () => {
  const { data, loading, refetch } = useQuery(GET_MY_FOLLOWS, {
    fetchPolicy: "cache-and-network",
  });

  const [unfollowBusiness, { loading: unfollowing }] = useMutation(UNFOLLOW_BUSINESS);

  const handleUnfollow = async (businessId, businessName) => {
    const confirm = window.confirm(`Are you sure you want to unfollow ${businessName}?`);
    if (!confirm) return;

    try {
      await unfollowBusiness({
        variables: { businessId },
      });
      toast.success(`Unfollowed ${businessName}`);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to unfollow business.");
    }
  };

  const follows = data?.myFollows || [];

  if (loading && follows.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (follows.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <div className="text-4xl mb-3">🏢</div>
        <h3 className="text-base font-bold text-slate-700">Not following any businesses</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Explore the directory to find and follow verified businesses to receive updates and notices!
        </p>
        <Link href="/directory">
          <button className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold rounded-lg hover:shadow-md transition-all">
            Explore Directory
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
      {follows.map((follow) => {
        const logoImg = follow.business.images?.find((img) => img.isLogo)?.imageUrl || bnwLogo;
        return (
          <div
            key={follow.id}
            className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
                <Image
                  src={logoImg}
                  alt={follow.business.name}
                  fill
                  sizes="48px"
                  unoptimized
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-800 truncate flex items-center gap-1.5">
                  {follow.business.name}
                  {follow.business.isVerified && (
                    <span className="text-blue-500" title="Verified">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </span>
                  )}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Followed on {new Date(follow.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/${follow.business.slug}`}>
                <button
                  className="p-2 text-slate-400 hover:text-purple-600 bg-slate-50 hover:bg-purple-50 rounded-xl transition-all border border-slate-100"
                  title="Visit Page"
                >
                  <FaExternalLinkAlt size={12} />
                </button>
              </Link>
              <button
                onClick={() => handleUnfollow(follow.business.id, follow.business.name)}
                disabled={unfollowing}
                className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl transition-all border border-slate-100"
                title="Unfollow"
              >
                <FaTrash size={12} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FollowingList;
