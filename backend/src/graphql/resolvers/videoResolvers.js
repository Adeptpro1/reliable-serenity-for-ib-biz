import prisma from "../../prisma.js";
import { GraphQLError } from "graphql";
import WalletService from "../../services/WalletService.js";

export const videoResolvers = {
  Query: {
    // List all business videos (showroom), boosted/sponsored first
    businessVideos: async (_, { pagination, userLocation, search }) => {
      const { skip = 0, take = 20 } = pagination || {};

      const where = {};
      if (search) {
        where.OR = [
          { business: { name: { contains: search } } },
          { business: { addresses: { some: { address1: { contains: search } } } } },
          { business: { addresses: { some: { address2: { contains: search } } } } },
        ];
      }

      let videos = await prisma.businessVideo.findMany({
        where,
        orderBy: [
          { isSponsored: "desc" },
          { boosted: "desc" },
          { views: "desc" },
        ],
        include: {
          business: { include: { addresses: true, images: true } },
        },
      });

      if (userLocation) {
        videos.sort((a, b) => {
          if (a.isSponsored !== b.isSponsored) return a.isSponsored ? -1 : 1;
          if (a.boosted !== b.boosted) return a.boosted ? -1 : 1;

          const scoreA = Math.max(0, ...a.business.addresses.map(addr => {
            if (userLocation.town && addr.town === userLocation.town) return 3;
            if (userLocation.city && addr.city === userLocation.city) return 2;
            if (userLocation.lg && addr.lg === userLocation.lg) return 1;
            return 0;
          }));
          const scoreB = Math.max(0, ...b.business.addresses.map(addr => {
            if (userLocation.town && addr.town === userLocation.town) return 3;
            if (userLocation.city && addr.city === userLocation.city) return 2;
            if (userLocation.lg && addr.lg === userLocation.lg) return 1;
            return 0;
          }));
          if (scoreA !== scoreB) return scoreB - scoreA;

          return b.views - a.views;
        });
      }

      return videos.slice(skip, skip + take);
    },

    // Videos for a specific business
    businessVideosByBusiness: async (_, { businessId }) => {
      return prisma.businessVideo.findMany({
        where: { businessId },
        orderBy: { views: "desc" },
        include: { business: true },
      });
    },
  },

  Mutation: {
    // Upload a video (business owner)
    uploadBusinessVideo: async (_, { input }, { user }) => {
      if (!user) throw new GraphQLError("Authentication required");

      const { businessId, videoUrl, duration } = input;

      const business = await prisma.business.findFirst({
        where: { id: businessId, userId: user.id },
      });
      if (!business)
        throw new GraphQLError("Business not found or access denied");

      return prisma.businessVideo.create({
        data: {
          businessId,
          videoUrl,
          duration: duration || 60,
        },
        include: { business: true },
      });
    },

    // Sponsor a video (pay to make it sponsored)
    sponsorVideo: async (_, { videoId, amount }, { user }) => {
      if (!user) throw new GraphQLError("Authentication required");

      const video = await prisma.businessVideo.findUnique({
        where: { id: videoId },
        include: { business: true },
      });
      if (!video || video.business.userId !== user.id) {
        throw new GraphQLError("Video not found or access denied");
      }

      await WalletService.deduct(
        user.id,
        video.businessId,
        "Sponsored_Video",
        amount
      );

      return prisma.businessVideo.update({
        where: { id: videoId },
        data: { isSponsored: true, boosted: true },
        include: { business: true },
      });
    },

    // Delete a video
    deleteBusinessVideo: async (_, { id }, { user }) => {
      if (!user) throw new GraphQLError("Authentication required");

      const video = await prisma.businessVideo.findUnique({
        where: { id },
        include: { business: true },
      });
      if (!video) throw new GraphQLError("Video not found");
      if (user.role !== "ADMIN" && video.business.userId !== user.id) {
        throw new GraphQLError("Access denied");
      }

      await prisma.businessVideo.delete({ where: { id } });
      return true;
    },

    // Increment view count
    viewVideo: async (_, { id }) => {
      return prisma.businessVideo.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    },

    // Like a video
    likeVideo: async (_, { id }) => {
      return prisma.businessVideo.update({
        where: { id },
        data: { likes: { increment: 1 } },
      });
    },
  },

  // Field resolvers
  BusinessVideo: {
    business: async (parent) =>
      prisma.business.findUnique({ where: { id: parent.businessId } }),
  },
};
