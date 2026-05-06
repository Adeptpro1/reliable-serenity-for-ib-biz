import prisma from "../../prisma.js";
import { getCache, setCache } from "../../utils/cache.js";
import { BusinessService } from "../../services/BusinessService.js";
import { NoticeService } from "../../services/NoticeService.js";
import AiService from "../../services/AiService.js";

export const businessResolvers = {
  Query: {
    // Public Paginated Business
    businessesPaginated: async (
      _,
      { pagination, userLocation, search, category },
    ) => {
      const { skip = 0, take = 20 } = pagination || {};
      const cacheKey = `businesses_paginated:${JSON.stringify({ pagination, userLocation, search, category })}`;

      const cachedData = await getCache(cacheKey);
      if (cachedData) return cachedData;

      const where = {};
      if (search || category) {
        where.AND = [];
        if (search) {
          const searchTerms = search.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
          const allCategories = [
            "AGRIBUSINESS", "MANUFACTURING", "RETAIL_WHOLESALE", "TECHNOLOGY", "HEALTHCARE", "EDUCATION",
            "TOURISM_HOSPITALITY", "REAL_ESTATE", "TRANSPORT_LOGISTICS", "FINANCIAL_SERVICES", "ENERGY",
            "MINING", "CREATIVE_ENTERTAINMENT", "PROFESSIONAL_SERVICES", "ENVIRONMENTAL_SERVICES",
            "SECURITY_SERVICES", "TELECOMMUNICATIONS", "MEDIA_PUBLISHING", "AUTOMOTIVE", "PERSONAL_SERVICES",
            "HOUSEHOLD_SERVICES"
          ];

          const orConditions = [];
          searchTerms.forEach(term => {
            orConditions.push({ name: { contains: term } });
            orConditions.push({ description: { contains: term } });
            orConditions.push({ addresses: { some: { address1: { contains: term } } } });
            orConditions.push({ addresses: { some: { address2: { contains: term } } } });

            const matchedCategories = allCategories.filter(c =>
              c.replace(/_/g, " ").toLowerCase().includes(term) ||
              c.toLowerCase().includes(term)
            );
            if (matchedCategories.length > 0) {
              orConditions.push({ category: { in: matchedCategories } });
            }
          });
          where.AND.push({ OR: orConditions });
        }
        if (category) {
          where.AND.push({ category: category });
        }
      }

      const includeRelations = {
        user: true,
        addresses: true,
        images: true,
        videos: true,
        notices: true,
        ads: true,
        reviews: true,
        contactUrls: true,
      };

      let result;

      if (userLocation) {
        // Need to sort in memory — fetch a capped set to avoid full-table load
        const MAX_FOR_SORT = 500;
        const businesses = await prisma.business.findMany({
          where,
          take: MAX_FOR_SORT,
          include: includeRelations,
        });

        const scoreAddr = (addresses, loc) =>
          Math.max(
            0,
            ...addresses.map((addr) => {
              if (loc.town && addr.town === loc.town) return 3;
              if (loc.city && addr.city === loc.city) return 2;
              if (loc.lg && addr.lg === loc.lg) return 1;
              return 0;
            })
          );

        businesses.sort(
          (a, b) =>
            scoreAddr(b.addresses, userLocation) -
            scoreAddr(a.addresses, userLocation)
        );

        result = businesses.slice(skip, skip + take);
      } else {
        // No location sort — push pagination straight to the DB
        result = await prisma.business.findMany({
          where,
          skip,
          take,
          include: includeRelations,
          orderBy: { createdAt: 'desc' },
        });
      }

      await setCache(cacheKey, result, 1800); // 30 minutes
      return result;
    },

    // Businesses Query (admin use) — capped at 100 to prevent full-table scan
    businesses: async () => {
      const cacheKey = "businesses";
      const cachedBusinesses = await getCache(cacheKey);
      if (cachedBusinesses) return cachedBusinesses;

      const dbBusinesses = await prisma.business.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          addresses: true,
          images: true,
          videos: true,
          notices: true,
          ads: true,
          reviews: true,
          contactUrls: true,
        },
      });

      await setCache(cacheKey, dbBusinesses, 3600);
      return dbBusinesses;
    },

    // Single Business Query
    business: async (_, { id }) => {
      const cacheKey = `business:${id}`;
      const cachedBusiness = await getCache(cacheKey);
      if (cachedBusiness) return cachedBusiness;

      const dbBusiness = await prisma.business.findUnique({
        where: { id: id },
        include: {
          user: true,
          // category: true,
          addresses: true,
          images: true,
          videos: true,
          notices: true,
          ads: true,
          reviews: true,
          contactUrls: true,
        },
      });
      if (!dbBusiness) return null;

      await setCache(cacheKey, dbBusiness, 3600);
      return dbBusiness;
    },

    // Single Business By Slug
    businessBySlug: async (_, { slug }) => {
      const cacheKey = `business_slug:${slug}`;
      const cachedBusiness = await getCache(cacheKey);
      if (cachedBusiness) return cachedBusiness;

      const dbBusiness = await prisma.business.findUnique({
        where: { slug: slug },
        include: {
          user: true,
          addresses: true,
          images: true,
          videos: true,
          notices: true,
          ads: true,
          reviews: {
            include: { user: true },
          },
          contactUrls: true,
        },
      });
      if (!dbBusiness) return null;

      await setCache(cacheKey, dbBusiness, 3600);
      return dbBusiness;
    },

    contactUrls: async () =>
      prisma.contactUrl.findMany({
        include: { business: true },
      }),

    analyzeSearchQuery: async (_, { prompt }, { user }) => {
      if (!user) throw new Error("You must be logged in to use AI Search.");
      if (!prompt || prompt.trim() === "") throw new Error("Prompt is empty");

      try {
        const intent = await AiService.extractSearchIntent(prompt);
        return intent;
      } catch (err) {
        console.error(
          "AI Search Intent extraction failed, falling back to manual search.",
        );
        return {
          keywords: null,
          category: null,
          town: null,
          city: null,
          lg: null,
        };
      }
    },

    noticeboards: async (_, { pagination, userLocation, search }) => {
      const { skip = 0, take = 20 } = pagination || {};

      const where = {};
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { content: { contains: search } },
          { business: { name: { contains: search } } },
          {
            business: {
              addresses: { some: { address1: { contains: search } } },
            },
          },
          {
            business: {
              addresses: { some: { address2: { contains: search } } },
            },
          },
        ];
      }

      let notices = await prisma.noticeboard.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          images: true,
          business: { include: { addresses: true } },
        },
      });

      if (userLocation) {
        notices.sort((a, b) => {
          const scoreA = Math.max(
            0,
            ...a.business.addresses.map((addr) => {
              if (userLocation.town && addr.town === userLocation.town)
                return 3;
              if (userLocation.city && addr.city === userLocation.city)
                return 2;
              if (userLocation.lg && addr.lg === userLocation.lg) return 1;
              return 0;
            }),
          );
          const scoreB = Math.max(
            0,
            ...b.business.addresses.map((addr) => {
              if (userLocation.town && addr.town === userLocation.town)
                return 3;
              if (userLocation.city && addr.city === userLocation.city)
                return 2;
              if (userLocation.lg && addr.lg === userLocation.lg) return 1;
              return 0;
            }),
          );
          return scoreB - scoreA;
        });
      }

      return notices.slice(skip, skip + take);
    },

    contactSubmissions: async (_, { noticeId }, { user }) => {
      if (!user) throw new Error("Authentication required");
      // Verify user owns the business associated with the notice
      const notice = await prisma.noticeboard.findUnique({
        where: { id: noticeId },
        include: { business: true },
      });
      if (
        !notice ||
        (user.role !== "ADMIN" && notice.business.userId !== user.id)
      ) {
        throw new Error("Access denied");
      }
      return prisma.contactSubmission.findMany({
        where: { noticeId },
        orderBy: { submittedAt: "desc" },
      });
    },
    publicAds: async (_, { type, limit }) => {
      return await prisma.ad.findMany({
        where: {
          type: type || undefined,
          status: "PUBLISHED",
          endDate: { gte: new Date() },
        },
        take: limit || 10,
        orderBy: { createdAt: "desc" },
        include: { business: true },
      });
    },
  },

  // ----------------- MUTATION RESOLVERS -----------------
  Mutation: {
    registerBusinessWithDetails: async (_, { input }, { user }) => {
      return await BusinessService.registerBusinessWithDetails(input, user);
    },

    updateBusiness: async (_, { id, input }, { user }) => {
      return await BusinessService.updateBusiness(id, input, user);
    },

    createNotice: async (_, { input }, { user }) => {
      return await NoticeService.createNotice(input, user);
    },

    updateNotice: async (_, { id, input }, { user }) => {
      return await NoticeService.updateNotice(id, input, user);
    },

    deleteNotice: async (_, { id }, { user }) => {
      return await NoticeService.deleteNotice(id, user);
    },

    boostNotice: async (_, { noticeId, days }, { user }) => {
      return await NoticeService.boostNotice(noticeId, days, user);
    },

    submitNoticeLead: async (_, input) => {
      // Input contains noticeId, name, email, phone, additionalData
      return await NoticeService.submitLead(input.noticeId, input);
    },

    setBusinessOfTheWeek: async (_, { businessId, isFeatured }, { user }) => {
      if (!user || user.role !== "ADMIN") {
        throw new Error("Admin access required");
      }

      const business = await prisma.business.findUnique({
        where: { id: businessId },
      });

      if (!business) {
        throw new Error("Business not found");
      }

      return await prisma.$transaction(async (tx) => {
        // If setting this business as featured, unset any existing featured business
        if (isFeatured) {
          await tx.business.updateMany({
            where: { isBusinessOfTheWeek: true },
            data: { isBusinessOfTheWeek: false },
          });
        }

        return await tx.business.update({
          where: { id: businessId },
          data: { isBusinessOfTheWeek: isFeatured },
        });
      });
    },
  },

  // ----------------- FIELD RESOLVERS -----------------
  // Only compute fields that are NOT already loaded via `include`.
  // If the parent query used `include`, parent.X already has the data —
  // returning it directly avoids a duplicate DB round-trip (N+1 prevention).
  Business: {
    user: async (parent) =>
      parent.user ?? prisma.user.findUnique({ where: { id: parent.userId } }),
    addresses: async (parent) =>
      parent.addresses ?? prisma.address.findMany({ where: { businessId: parent.id } }),
    images: async (parent) =>
      parent.images ?? prisma.businessImage.findMany({ where: { businessId: parent.id } }),
    contactUrls: async (parent) =>
      parent.contactUrls ?? prisma.contactUrl.findMany({ where: { businessId: parent.id } }),
    reviews: async (parent) =>
      parent.reviews ?? prisma.review.findMany({
        where: { businessId: parent.id },
        include: { user: true },
      }),
    notices: async (parent) =>
      parent.notices ?? prisma.noticeboard.findMany({
        where: { businessId: parent.id },
        include: { images: true },
      }),
    // Computed field — always aggregated from analytics
    shares: async (parent) => {
      const stats = await prisma.heatmapAnalytics.aggregate({
        where: { businessId: parent.id },
        _sum: { shares: true },
      });
      return stats._sum.shares || 0;
    },
  },

  Noticeboard: {
    images: async (parent) =>
      parent.images ?? prisma.noticeImage.findMany({ where: { noticeId: parent.id } }),
    contactSubmissions: async (parent) =>
      parent.contactSubmissions ?? prisma.contactSubmission.findMany({ where: { noticeId: parent.id } }),
    business: async (parent) =>
      parent.business ?? prisma.business.findUnique({ where: { id: parent.businessId } }),
    views: async (parent) => {
      const stats = await prisma.heatmapAnalytics.aggregate({
        where: { noticeId: parent.id },
        _sum: { pageViews: true },
      });
      return stats._sum.pageViews || 0;
    },
  },

  BusinessVideo: {
    business: async (parent) =>
      parent.business ?? prisma.business.findUnique({ where: { id: parent.businessId } }),
    shares: async (parent) => {
      const stats = await prisma.heatmapAnalytics.aggregate({
        where: { videoId: parent.id },
        _sum: { shares: true },
      });
      return stats._sum.shares || 0;
    },
    views: async (parent) => {
      const stats = await prisma.heatmapAnalytics.aggregate({
        where: { videoId: parent.id },
        _sum: { pageViews: true },
      });
      return (parent.views || 0) + (stats._sum.pageViews || 0);
    },
  },

  ContactUrl: {
    business: async (parent) =>
      parent.businessId
        ? parent.business ?? prisma.business.findUnique({ where: { id: parent.businessId } })
        : null,
  },
};
