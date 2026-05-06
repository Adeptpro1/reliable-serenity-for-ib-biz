import prisma from "../../prisma.js";
import { GraphQLError } from "graphql";

export const notificationResolvers = {
  Query: {
    notifications: async (_, __, { user }) => {
      if (!user) throw new GraphQLError("Authentication required");

      return prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
    },
  },

  Mutation: {
    markNotificationRead: async (_, { id }, { user }) => {
      if (!user) throw new GraphQLError("Authentication required");

      const notification = await prisma.notification.findUnique({
        where: { id },
      });

      if (!notification || notification.userId !== user.id) {
        throw new GraphQLError("Notification not found");
      }

      return prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
    },

    deleteNotification: async (_, { id }, { user }) => {
      if (!user) throw new GraphQLError("Authentication required");

      const notification = await prisma.notification.findUnique({
        where: { id },
      });

      if (!notification || (user.role !== "ADMIN" && notification.userId !== user.id)) {
        throw new GraphQLError("Notification not found or access denied");
      }

      await prisma.notification.delete({
        where: { id },
      });

      return true;
    },

    broadcastNotification: async (_, { title, content }, { user }) => {
      // Get all users
      const users = await prisma.user.findMany({
        select: { id: true },
      });

      const notificationData = users.map((u) => ({
        userId: u.id,
        title,
        content,
      }));

      // Prisma createMany is efficient for this
      await prisma.notification.createMany({
        data: notificationData,
      });

      return true;
    },
  },

  Notification: {
    user: async (parent) => {
      return prisma.user.findUnique({ where: { id: parent.userId } });
    },
  },
};
