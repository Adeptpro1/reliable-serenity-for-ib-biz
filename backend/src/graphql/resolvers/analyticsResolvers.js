import prisma from "../../prisma.js";
import { GraphQLError } from "graphql";

export const analyticsResolvers = {
  Query: {
    businessAnalytics: async (_, { businessId }, { user }) => {
      if (!user) throw new GraphQLError("Authentication required");

      let businessIds = [];
      if (businessId) {
        const business = await prisma.business.findUnique({
          where: { id: businessId },
        });

        if (!business || business.userId !== user.id) {
          throw new GraphQLError("Business not found or access denied");
        }
        businessIds = [businessId];
      } else {
        // Combined analytics for all user's businesses
        const userBusinesses = await prisma.business.findMany({
          where: { userId: user.id },
          select: { id: true },
        });
        businessIds = userBusinesses.map(b => b.id);
      }

      if (businessIds.length === 0) {
        return {
          totalViews: 0,
          totalClicks: 0,
          totalLeads: 0,
          totalShares: 0,
          viewsOverTime: [],
          leadsOverTime: [],
          sharesOverTime: [],
        };
      }

      // Aggregate views and clicks from HeatmapAnalytics
      const heatmapStats = await prisma.heatmapAnalytics.aggregate({
        where: { businessId: { in: businessIds } },
        _sum: {
          pageViews: true,
          urlClicks: true,
          shares: true,
        },
      });

      const totalViews = heatmapStats._sum.pageViews || 0;
      const totalClicks = heatmapStats._sum.urlClicks || 0;
      const totalShares = heatmapStats._sum.shares || 0;

      // Count leads from Follows
      const followLeadsCount = await prisma.follow.count({
        where: { businessId: { in: businessIds } },
      });

      // Count leads from ContactSubmissions
      const noticeLeadsCount = await prisma.contactSubmission.count({
        where: {
          notice: {
            businessId: { in: businessIds },
          },
        },
      });

      const totalLeads = followLeadsCount + noticeLeadsCount;

      // Get daily breakdown for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
 
      const analyticsData = await prisma.heatmapAnalytics.findMany({
        where: {
            businessId: { in: businessIds },
            createdAt: { gte: thirtyDaysAgo }
        },
        select: {
            createdAt: true,
            pageViews: true,
            shares: true
        }
      });

      const formatData = (data, field) => {
          const map = {};
          data.forEach(item => {
              const date = item.createdAt.toISOString().split('T')[0];
              map[date] = (map[date] || 0) + (item[field] || 0);
          });
          return Object.entries(map).map(([date, count]) => ({ date, count })).sort((a,b) => a.date.localeCompare(b.date));
      };
 
      const viewsOverTime = formatData(analyticsData, 'pageViews');
      const sharesOverTime = formatData(analyticsData, 'shares');
 
      // For leads over time, we need to combine follow creation dates and contact submission dates
      const followsOverTimeData = await prisma.follow.findMany({
          where: { businessId: { in: businessIds }, createdAt: { gte: thirtyDaysAgo } },
          select: { createdAt: true }
      });
      
      const contactsOverTimeData = await prisma.contactSubmission.findMany({
          where: { 
              notice: { businessId: { in: businessIds } },
              submittedAt: { gte: thirtyDaysAgo }
          },
          select: { submittedAt: true }
      });

      const leadsMap = {};
      followsOverTimeData.forEach(item => {
          const date = item.createdAt.toISOString().split('T')[0];
          leadsMap[date] = (leadsMap[date] || 0) + 1;
      });
      contactsOverTimeData.forEach(item => {
          const date = item.submittedAt.toISOString().split('T')[0];
          leadsMap[date] = (leadsMap[date] || 0) + 1;
      });
      const leadsOverTime = Object.entries(leadsMap).map(([date, count]) => ({ date, count })).sort((a,b) => a.date.localeCompare(b.date));

      return {
        totalViews,
        totalClicks,
        totalLeads,
        totalShares,
        viewsOverTime,
        leadsOverTime,
        sharesOverTime,
      };
    },
  },

  Mutation: {
    trackActivity: async (_, { input }, { user }) => {
      const { businessId, videoId, noticeId, productId, activityType } = input;
      
      // Logic: upsert a record for today or just create a new record per interaction for precise heatmap?
      // Usually heatmap/analytics is logged. We'll create a new record or update a bucket.
     // record per day per entity per user-if logged in
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const where = {
          userId: user?.id || null,
          businessId: businessId || null,
          videoId: videoId || null,
          noticeId: noticeId || null,
          productId: productId || null,
          createdAt: { gte: today }
      };

      const existingBucket = await prisma.heatmapAnalytics.findFirst({ where });

      const dataToUpdate = {};
      if (activityType === "VIEW") dataToUpdate.pageViews = { increment: 1 };
      if (activityType === "CLICK") dataToUpdate.urlClicks = { increment: 1 };
      if (activityType === "LIKE") dataToUpdate.likes = { increment: 1 };
      if (activityType === "DOWNLOAD") dataToUpdate.downloads = { increment: 1 };
      if (activityType === "SHARE") dataToUpdate.shares = { increment: 1 };

      if (existingBucket) {
        await prisma.heatmapAnalytics.update({
          where: { id: existingBucket.id },
          data: dataToUpdate,
        });
      } else {
        await prisma.heatmapAnalytics.create({
          data: {
            userId: user?.id || null,
            businessId,
            videoId,
            noticeId,
            productId,
            pageViews: activityType === "VIEW" ? 1 : 0,
            urlClicks: activityType === "CLICK" ? 1 : 0,
            likes: activityType === "LIKE" ? 1 : 0,
            downloads: activityType === "DOWNLOAD" ? 1 : 0,
            shares: activityType === "SHARE" ? 1 : 0,
          },
        });
      }

      // Cache Invalidation for Business
      if (activityType === "SHARE" && businessId) {
        try {
          const { deleteCache } = await import("../../utils/cache.js");
          const biz = await prisma.business.findUnique({ where: { id: businessId } });
          if (biz) {
            await deleteCache(`business:${businessId}`);
            await deleteCache(`business_slug:${biz.slug}`);
          }
        } catch (err) {
          console.error("Cache invalidation failed:", err);
        }
      }

      return true;
    },
  },
};
