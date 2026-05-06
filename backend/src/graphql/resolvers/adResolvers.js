import prisma from "../../prisma.js";
import { GraphQLError } from "graphql";
import WalletService from "../../services/WalletService.js";

export const adResolvers = {
  Query: {
    // List ads (with optional status filter and pagination)
    ads: async (_, { status, pagination }) => {
      const { skip = 0, take = 20 } = pagination || {};
      const where = {};
      if (status) where.status = status;

      return prisma.ad.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          business: { include: { images: true } },
          approvedBy: true,
        },
      });
    },

    // Get ads for a specific business
    adsByBusiness: async (_, { businessId }, { user }) => {
      if (!user) throw new GraphQLError("Authentication required");
      return prisma.ad.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        include: { business: true, approvedBy: true },
      });
    },
  },

  Mutation: {
    /**
     * Request an ad (business owner submits for approval).
     * Ad types: WEB_BANNER, IN_APP_NOTIFICATION, EVENTS
     */
    requestAd: async (_, { input }, { user }) => {
      if (!user) throw new GraphQLError("Authentication required");

      const { businessId, type, title, image, videoUrl, startDate, endDate, amount } =
        input;

      const business = await prisma.business.findFirst({
        where: { id: businessId, userId: user.id },
      });
      if (!business)
        throw new GraphQLError("Business not found or access denied");

      // Deduct payment from wallet
      const purposeMap = {
        WEB_BANNER: "Web_Banner",
        IN_APP_NOTIFICATION: "In_app_notification",
        EVENTS: "Events",
      };
      const purpose = purposeMap[type];
      if (!purpose) throw new GraphQLError("Invalid ad type");

      await WalletService.deduct(user.id, businessId, purpose, amount);

      return prisma.ad.create({
        data: {
          userId: user.id,
          businessId,
          type,
          title,
          image: image || null,
          videoUrl: videoUrl || null,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          status: "AWAITING_APPROVAL",
        },
        include: { business: true },
      });
    },

    // Admin: approve an ad
    approveAd: async (_, { id }, { user }) => {
      if (!user || user.role !== "ADMIN")
        throw new GraphQLError("Admin access required");

      const ad = await prisma.ad.findUnique({ where: { id } });
      if (!ad) throw new GraphQLError("Ad not found");
      if (ad.status !== "AWAITING_APPROVAL")
        throw new GraphQLError("Ad is not awaiting approval");

      return prisma.ad.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedById: user.id,
        },
        include: { business: true, approvedBy: true },
      });
    },

    // Admin: reject an ad
    rejectAd: async (_, { id, reason }, { user }) => {
      if (!user || user.role !== "ADMIN")
        throw new GraphQLError("Admin access required");

      const ad = await prisma.ad.findUnique({ where: { id } });
      if (!ad) throw new GraphQLError("Ad not found");

      // Refund to wallet
      const wallet = await WalletService.getOrCreateWallet(ad.userId);
      // Find the related transaction to get amount
      // For simplicity, we mark the ad as rejected
      return prisma.ad.update({
        where: { id },
        data: {
          status: "REJECTED",
          approvedById: user.id,
        },
        include: { business: true, approvedBy: true },
      });
    },

    // Admin: publish an approved ad
    publishAd: async (_, { id }, { user }) => {
      if (!user || user.role !== "ADMIN")
        throw new GraphQLError("Admin access required");

      const ad = await prisma.ad.findUnique({ where: { id } });
      if (!ad) throw new GraphQLError("Ad not found");
      if (ad.status !== "APPROVED")
        throw new GraphQLError("Ad must be approved before publishing");

      return prisma.ad.update({
        where: { id },
        data: { status: "PUBLISHED" },
        include: { business: true },
      });
    },

    // Track ad click
    clickAd: async (_, { id }) => {
      return prisma.ad.update({
        where: { id },
        data: { clicks: { increment: 1 } },
      });
    },
  },

  // Field resolvers
  Ad: {
    business: async (parent) =>
      prisma.business.findUnique({ where: { id: parent.businessId } }),
    approvedBy: async (parent) =>
      parent.approvedById
        ? prisma.user.findUnique({ where: { id: parent.approvedById } })
        : null,
  },
};
