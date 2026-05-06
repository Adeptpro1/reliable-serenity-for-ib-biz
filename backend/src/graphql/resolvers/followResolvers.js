import prisma from "../../prisma.js";
import { GraphQLError } from "graphql";

export const followResolvers = {
  Query: {
    // Get followers of a business (for business owner / admin)
    businessFollowers: async (_, { businessId, pagination }, { user }) => {
      if (!user) throw new GraphQLError("Authentication required");

      const { skip = 0, take = 20 } = pagination || {};

      // Verify ownership or admin
      const business = await prisma.business.findUnique({
        where: { id: businessId },
      });
      if (!business) throw new GraphQLError("Business not found");
      if (user.role !== "ADMIN" && business.userId !== user.id) {
        throw new GraphQLError("Access denied");
      }

      return prisma.follow.findMany({
        where: { businessId },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { user: true, business: true },
      });
    },

    // Get businesses the current user follows
    myFollows: async (_, { pagination }, { user }) => {
      if (!user) throw new GraphQLError("Authentication required");
      const { skip = 0, take = 20 } = pagination || {};

      return prisma.follow.findMany({
        where: { userId: user.id },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { business: { include: { images: true, addresses: true } } },
      });
    },

    // Check if current user follows a business
    isFollowing: async (_, { businessId }, { user }) => {
      if (!user) return false;
      const follow = await prisma.follow.findUnique({
        where: { userId_businessId: { userId: user.id, businessId } },
      });
      return !!follow;
    },

    // Get follower count for a business (public)
    followerCount: async (_, { businessId }) => {
      return prisma.follow.count({ where: { businessId } });
    },
  },

  Mutation: {
    /**
     * Follow a business. Requires name + at least one contact (email or phone).
     * This acts as lead generation for the business being followed.
     */
    followBusiness: async (_, { input }, { user }) => {
      const { businessId, name, email, phone } = input;

      if (!name || name.trim().length === 0) {
        throw new GraphQLError("Name is required");
      }
      if (!email && !phone) {
        throw new GraphQLError(
          "At least one contact (email or phone) is required"
        );
      }

      // Check business exists
      const business = await prisma.business.findUnique({
        where: { id: businessId },
      });
      if (!business) throw new GraphQLError("Business not found");

      // If user is logged in, check for existing follow
      if (user) {
        const existing = await prisma.follow.findUnique({
          where: { userId_businessId: { userId: user.id, businessId } },
        });
        if (existing) {
          throw new GraphQLError("You already follow this business");
        }
      }

      return prisma.follow.create({
        data: {
          userId: user?.id || null,
          businessId,
          name: name.trim(),
          email: email || null,
          phone: phone || null,
        },
        include: { business: true, user: true },
      });
    },

    // Unfollow a business
    unfollowBusiness: async (_, { businessId }, { user }) => {
      if (!user) throw new GraphQLError("Authentication required");

      const follow = await prisma.follow.findUnique({
        where: { userId_businessId: { userId: user.id, businessId } },
      });
      if (!follow) throw new GraphQLError("You are not following this business");

      await prisma.follow.delete({ where: { id: follow.id } });
      return true;
    },
  },

  // Field resolvers
  Follow: {
    user: async (parent) =>
      parent.userId
        ? prisma.user.findUnique({ where: { id: parent.userId } })
        : null,
    business: async (parent) =>
      prisma.business.findUnique({ where: { id: parent.businessId } }),
  },
};
