import prisma from "../../prisma.js";
import { GraphQLError } from "graphql";
import WalletService from "../../services/WalletService.js";

export const topListingResolvers = {
  Query: {
    // Get all active top listings
    topLists: async (_, { type }) => {
      const now = new Date();
      const where = {
        startDate: { lte: now },
        endDate: { gte: now },
      };
      if (type) where.toplistad = type;

      return prisma.topListingAd.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          business: { include: { images: true, addresses: true, contactUrls: true } },
        },
      });
    },

    // Get top listings for a specific business
    topListsByBusiness: async (_, { businessId }) => {
      return prisma.topListingAd.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        include: { business: true },
      });
    },
  },

  Mutation: {
    /**
     * Purchase a top listing ad.
     * Types: BUSINESS_TOPLIST, NOTICE_TOPLIST, PRODUCT_TOPLIST
     */
    purchaseTopListing: async (_, { input }, { user }) => {
      if (!user) throw new GraphQLError("Authentication required");

      const { businessId, type, days } = input;

      if (!days || days <= 0 || days > 30)
        throw new GraphQLError("Days must be between 1 and 30");

      const business = await prisma.business.findFirst({
        where: { id: businessId, userId: user.id },
      });
      if (!business)
        throw new GraphQLError("Business not found or access denied");

      const cost = days * 200; // cost per day for top listing
      await WalletService.deduct(user.id, businessId, "Top_List_Biz", cost);

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      return prisma.topListingAd.create({
        data: {
          businessId,
          toplistad: type,
          startDate,
          endDate,
        },
        include: {
          business: { include: { images: true, addresses: true } },
        },
      });
    },
  },

  // Field resolvers
  TopListingAd: {
    business: async (parent) =>
      prisma.business.findUnique({ where: { id: parent.businessId } }),
  },
};
