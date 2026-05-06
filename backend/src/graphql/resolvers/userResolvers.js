import redis from "../../config/redis.js";
import prisma from "../../prisma.js";

export const userResolvers = {
  // ----------------- QUERIES -----------------

  Query: {
    // Public Paginated Users Query
    usersPaginated: async (_, { pagination }) => {
      const { skip = 0, take = 20 } = pagination || {};
      return prisma.user.findMany({
        skip,
        take,
        include: {
          businesses: true,
          reviews: true,
          notifications: true,
        },
      });
    },

    // Users Query
    users: async () => {
      const cacheKey = "users";
      const cachedUsers = await redis.get(cacheKey);
      if (cachedUsers) return JSON.parse(cachedUsers);

      const dbUsers = await prisma.user.findMany({
        include: {
          businesses: true,
          reviews: true,
          notifications: true,
          aiInteractions: true,
        },
      });

      await redis.set(cacheKey, JSON.stringify(dbUsers), "EX", 3600);
      return dbUsers;
    },

    // Single User Query
    user: async (_, { id }) => {
      const cacheKey = `user:${id}`;
      const cachedUser = await redis.get(cacheKey);
      if (cachedUser) return JSON.parse(cachedUser);

      const dbUser = await prisma.user.findUnique({
        where: { id: id },
        include: {
          businesses: true,
          reviews: true,
          notifications: true,
          aiInteractions: true,
        },
      });
      if (!dbUser) return null;

      await redis.set(cacheKey, JSON.stringify(dbUser), "EX", 3600);
      return dbUser;
    },

    // Current Authenticated User Query
    me: async (_, __, { user, prisma }) => {
      if (!user) throw new Error("Not authenticated");
      return prisma.user.findUnique({
        where: { id: user.id },
        include: {
          reviews: true,
          notifications: true,
          sponsors: true,
          businesses: {
            include: {
              addresses: true,
              contactUrls: true,
              images: true,
              videos: true,
              notices: true,
              products: true,
              analytics: true,
              ads: true,
            },
          },
        },
      });
    },
  },

  // ----------------- MUTATIONS -----------------

  Mutation: {
    // Update User Mutation
    updateUser: async (_, { input }, { user, prisma }) => {
      if (!user) throw new Error("Authentication required");

      const { firstName, lastName, phone } = input;
      if (firstName && firstName.length > 30) throw new Error("First name cannot exceed 30 characters");
      if (lastName && lastName.length > 30) throw new Error("Last name cannot exceed 30 characters");
      if (phone && phone.length > 20) throw new Error("Phone number cannot exceed 20 characters");

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...input,
          dob: input.dob ? new Date(input.dob) : undefined,
        },
      });

      await redis.del("users");
      await redis.del(`user:${user.id}`);
      return updatedUser;
    },
  },

  // ----------------- FIELD RESOLVERS -----------------
  User: {
    businesses: async (parent) =>
      prisma.business.findMany({ where: { userId: parent.id } }),
  },
};
