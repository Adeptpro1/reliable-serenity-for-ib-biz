import prisma from "../../prisma.js";
import { GraphQLError } from "graphql";

export const reviewResolvers = {
  Query: {
    // Get reviews for a specific business
    reviews: async (_, { businessId }) => {
      return prisma.review.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        include: {
          user: true,
          business: true,
        },
      });
    },
  },

  Mutation: {
    // Create or update a review (one review per user per business)
    createReview: async (_, { businessId, rating }, { user }) => {
      if (!user) throw new GraphQLError("Authentication required");
      if (rating < 1 || rating > 5)
        throw new GraphQLError("Rating must be between 1 and 5");

      // Check business exists (handle both ID and Slug for robustness)
      const business = await prisma.business.findFirst({
        where: {
          OR: [
            { id: businessId },
            { slug: businessId }
          ]
        },
      });
      if (!business) throw new GraphQLError("Business not found");

      // Prevent reviewing own business
      if (business.userId === user.id) {
        throw new GraphQLError("You cannot review your own business");
      }

      // Check if user already reviewed this business – update if so
      const existing = await prisma.review.findFirst({
        where: { businessId: business.id, userId: user.id },
      });

      const result = await (existing
        ? prisma.review.update({
            where: { id: existing.id },
            data: { rating },
            include: { user: true, business: true },
          })
        : prisma.review.create({
            data: {
              businessId: business.id,
              userId: user.id,
              rating,
            },
            include: { user: true, business: true },
          }));

      // Cache Invalidation for Business average rating update
      try {
        const { deleteCache } = await import("../../utils/cache.js");
        await deleteCache(`business:${business.id}`);
        if (result.business?.slug) {
          await deleteCache(`business_slug:${result.business.slug}`);
        }
      } catch (err) {
        console.error("Cache invalidation failed (review):", err);
      }

      return result;
    },

    // Delete a review (own review or admin)
    deleteReview: async (_, { id }, { user }) => {
      if (!user) throw new GraphQLError("Authentication required");

      const review = await prisma.review.findUnique({ where: { id } });
      if (!review) throw new GraphQLError("Review not found");

      if (user.role !== "ADMIN" && review.userId !== user.id) {
        throw new GraphQLError("Access denied");
      }

      await prisma.review.delete({ where: { id } });
      return true;
    },
  },

  // Field resolvers
  Review: {
    user: async (parent) =>
      prisma.user.findUnique({ where: { id: parent.userId } }),
    business: async (parent) =>
      prisma.business.findUnique({ where: { id: parent.businessId } }),
  },
};
