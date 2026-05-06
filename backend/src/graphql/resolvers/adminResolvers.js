import prisma from "../../prisma.js";

export const adminResolvers = {
  Query: {
    adminUsersPaginated: async (_, { pagination }, { user, prisma }) => {
      if (!user || user.role !== "ADMIN") throw new Error("Admin access required");
      const { skip = 0, take = 20 } = pagination || {};
      return prisma.user.findMany({
        skip,
        take,
        include: { businesses: true },  
      });
    },

    adminBusinessesPaginated: async (_, { pagination }, { user, prisma }) => {
      if (!user || user.role !== "ADMIN") throw new Error("Admin access required");
      const { skip = 0, take = 20 } = pagination || {};
      return prisma.business.findMany({
        skip,
        take,
        include: {
          user: true,
          addresses: true,
          contactUrls: true,
        },
      });
    },

    adminAllNotifications: async (_, __, { user, prisma }) => {
      if (!user || user.role !== "ADMIN") throw new Error("Admin access required");
      return prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: true },
      });
    },

    // Top Header Setting Query
    topHeaderSetting: async (_, __, { prisma }) => {
      // Return the latest/only setting
      return prisma.topHeaderSetting.findFirst();
    },

    // Blog Posts Query
    blogPosts: (_, __, { prisma }) =>
      prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } }),
    blogPost: (_, { id }, { prisma }) =>
      prisma.blogPost.findUnique({ where: { id } }),

    // Sponsors Setting Query
    sponsors: async (_, __, { prisma }) => {
      return prisma.sponsorSetting.findMany({ orderBy: { createdAt: "desc" } });
    },
    sponsor: async (_, { id }, { prisma }) => {
      return prisma.sponsorSetting.findUnique({ where: { id } });
    },

    // Sponsorship Query
    sponsorships: async (_, __, { prisma }) => {
      return prisma.sponsorship.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
    },

    sponsorship: async (_, { id }, { prisma }) => {
      return prisma.sponsorship.findUnique({
        where: { id },
        include: {
          user: true,
          business: true,
        },
      });
    },

    // Pricing Queries
    pricings: async (_, __, { prisma }) => {
      return await prisma.pricing.findMany({
        orderBy: { createdAt: "desc" },
      });
    },

    pricing: async (_, { id }, { prisma }) => {
      return await prisma.pricing.findUnique({
        where: { id: id },
      });
    },

       // Web Banner Setting Query
    webBannerSetting: async (_, __, { prisma }) => {
      // Return the latest/only setting
      return prisma.webBannerSetting.findFirst();
    },
      // Read all web banners (list)
      webBanners: async (_, __, { prisma }) => {
        return prisma.webBannerSetting.findMany({ orderBy: { createdAt: 'desc' } });
      },
  },

  // ----------------- MUTATION RESOLVERS -----------------
  Mutation: {
    adminDeleteUser: async (_, { id }, { user, prisma }) => {
      if (!user || user.role !== "ADMIN") throw new Error("Admin access required");
      await prisma.user.delete({ where: { id } });
      return true;
    },

    adminDeleteBusiness: async (_, { id }, { user, prisma }) => {
      if (!user || user.role !== "ADMIN") throw new Error("Admin access required");
      await prisma.business.delete({ where: { id } });
      return true;
    },

    adminUpdateUser: async (_, { id, input }, { user, prisma }) => {
      if (!user || user.role !== "ADMIN") throw new Error("Admin access required");
      
      const updateData = { ...input };
      // Note: we can map or clean up any data if needed.
      
      return prisma.user.update({
        where: { id },
        data: updateData,
      });
    },

    adminUpdateBusiness: async (_, { id, input }, { user, prisma }) => {
      if (!user || user.role !== "ADMIN") throw new Error("Admin access required");
      
      const { name, description } = input;
      if (name && name.length > 40) throw new Error("Business name cannot exceed 40 characters");
      if (description && description.length > 150) throw new Error("Description cannot exceed 150 characters");

      const updateData = { ...input };
      
      return prisma.business.update({
        where: { id },
        data: updateData,
      });
    },

    adminDeleteNotice: async (_, { id }, { user, prisma }) => {
      if (!user || user.role !== "ADMIN") throw new Error("Admin access required");
      await prisma.noticeboard.delete({ where: { id } });
      return true;
    },

    adminDeleteVideo: async (_, { id }, { user, prisma }) => {
      if (!user || user.role !== "ADMIN") throw new Error("Admin access required");
      await prisma.businessVideo.delete({ where: { id } });
      return true;
    },

    adminUpdateNotice: async (_, { id, input }, { user, prisma }) => {
      if (!user || user.role !== "ADMIN") throw new Error("Admin access required");
      
      const updateData = { ...input };
      
      return prisma.noticeboard.update({
        where: { id },
        data: updateData,
      });
    },

    adminUpdateVideo: async (_, { id, input }, { user, prisma }) => {
      if (!user || user.role !== "ADMIN") throw new Error("Admin access required");
      
      const updateData = { ...input };
      
      return prisma.businessVideo.update({
        where: { id },
        data: updateData,
      });
    },

    adminDeleteWebBanner: async (_, { id }, { user, prisma }) => {
      if (!user || user.role !== "ADMIN") throw new Error("Admin access required");
      await prisma.webBannerSetting.delete({ where: { id } });
      return true;
    },


    // Top Header Setting Mutation
    updateTopHeaderSetting: async (_, args, { prisma }) => {
      let setting = await prisma.topHeaderSetting.findFirst();

      if (!setting) {
        return prisma.topHeaderSetting.create({
          data: {
            text: args.text || "",
            link: args.link || "",
            isVisible: args.isVisible ?? true,
          },
        });
      }

      return prisma.topHeaderSetting.update({
        where: { id: setting.id },
        data: {
          text: args.text ?? setting.text,
          link: args.link ?? setting.link,
          isVisible: args.isVisible ?? setting.isVisible,
        },
      });
    },

    // Blog Post Mutations
    createBlogPost: async (
      _,
      { title, content, mediaUrls },
      { prisma, user }
    ) => {
      if (!user || user.role !== "ADMIN") throw new Error("Not authorized");
      return prisma.blogPost.create({
        data: { title, content, mediaUrls, likes: 0, shares: 0 },
      });
    },

    updateBlogPost: async (
      _,
      { id, title, content, mediaUrls },
      { prisma, user }
    ) => {
      if (!user || user.role !== "ADMIN") throw new Error("Not authorized");
      return prisma.blogPost.update({
        where: { id },
        data: { title, content, mediaUrls },
      });
    },

    deleteBlogPost: async (_, { id }, { prisma, user }) => {
      if (!user || user.role !== "ADMIN") throw new Error("Not authorized");
      await prisma.blogPost.delete({ where: { id } });
      return true;
    },

    likeBlogPost: async (_, { id }, { prisma }) => {
      return prisma.blogPost.update({
        where: { id },
        data: { likes: { increment: 1 } },
      });
    },

    shareBlogPost: async (_, { id }, { prisma }) => {
      return prisma.blogPost.update({
        where: { id },
        data: { shares: { increment: 1 } },
      });
    },

    // Sponsor Setting Mutations
     createSponsor: async (_, { title, image, url }, { prisma }) => {
      return prisma.sponsorSetting.create({
        data: { title, image, url },
      });
    },
    updateSponsor: async (_, { id, title, image, url }, { prisma }) => {
      return prisma.sponsorSetting.update({
        where: { id },
        data: { title, image, url },
      });
    },
    deleteSponsor: async (_, { id }, { prisma }) => {
      await prisma.sponsorSetting.delete({ where: { id } });
      return true;
    },

    // Sponsorship Create
    createSponsorship: async (_, { input }, { prisma }) => {
      const {
        businessEmail,
        businessName,
        phone,
        website,
        logo,
        amount,
        startDate,
        endDate,
      } = input;

      // Check if there's a user with this email
      const existingUser = await prisma.user.findUnique({
        where: { email: businessEmail },
        include: { businesses: true },
      });

      let userId = null;
      let businessIds = [];

      if (existingUser) {
        userId = existingUser.id;
        businessIds = existingUser.businesses.map((b) => b.id); // collect all IDs
      }

      const sponsorship = await prisma.sponsorship.create({
        data: {
          userId,
          businessIds,
          businessName,
          businessEmail,
          phone,
          website,
          logo,
          amount,
          startDate,
          endDate,
        },
      });

      return sponsorship;
    },

    // Sponsorship Update
    updateSponsorship: async (_, { id, input }, { prisma, user }) => {
      // Optional admin check
      if (user.role !== "ADMIN") throw new Error("Unauthorized");

      const sponsorship = await prisma.sponsorship.findUnique({ where: { id } });
      if (!sponsorship) throw new Error("Sponsorship not found");

      return prisma.sponsorship.update({
        where: { id },
        data: {
          ...input,
          updatedAt: new Date(),
        },
      });
    },

    // Sponsorship Delete
    deleteSponsorship: async (_, { id }, { prisma, user }) => {
      // Optional admin check
      if (user.role !== "ADMIN") throw new Error("Unauthorized");

      const sponsorship = await prisma.sponsorship.findUnique({ where: { id } });
      if (!sponsorship) throw new Error("Sponsorship not found");

      await prisma.sponsorship.delete({ where: { id } });
      return true;
    },

    // Pricing Mutations
    createPricing: async (_, { input }, { prisma }) => {
      return await prisma.pricing.create({
        data: { ...input },
      });
    },

    updatePricing: async (_, { input }, { prisma }) => {
      const { id, ...data } = input;
      return await prisma.pricing.update({
        where: { id: id },
        data,
      });
    },

    deletePricing: async (_, { id }, { prisma }) => {
      await prisma.pricing.delete({ where: { id: id } });
      return true;
    },

    // Web Banner Setting Mutation
    updateWebBannerSetting: async (_, args, { prisma }) => {
      let setting = await prisma.webBannerSetting.findFirst();

      if (!setting) {
        return prisma.webBannerSetting.create({
          data: {
            title: args.title || "",
            text: args.text || "",
            image: args.image || "",
            url: args.link || "",
            isVisible: args.isVisible ?? true,
          },
        });
      }

      return prisma.webBannerSetting.update({
        where: { id: setting.id },
        data: {
          title: args.title ?? setting.title,
          text: args.text ?? setting.text,
          image: args.image ?? setting.image,
          url: args.link ?? setting.link,
          isVisible: args.isVisible ?? setting.isVisible,
        },
      });
    },
    // Create a new banner row
    createWebBanner: async (_, args, { prisma }) => {
      const { title, text, image, url, isVisible } = args;
      return prisma.webBannerSetting.create({
        data: {
          title: title || "",
          text: text || "",
          image: image || "",
          url: url || "",
          isVisible: isVisible ?? true,
        },
      });
    },
  },
};
