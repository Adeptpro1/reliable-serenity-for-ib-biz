import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const eventResolvers = {
  Query: {
    events: async () => {
      return prisma.event.findMany({
        orderBy: { date: "asc" },
      });
    },
    event: async (_, { id }) => {
      return prisma.event.findUnique({
        where: { id },
      });
    },
  },
  Mutation: {
    createEvent: async (_, { title, description, date, imageUrl, link }, { user }) => {
      if (!user || user.role !== "ADMIN") {
        throw new Error("Not authorized. Admin only.");
      }
      return prisma.event.create({
        data: {
          title,
          description,
          date: new Date(date),
          imageUrl,
          link,
        },
      });
    },
    updateEvent: async (_, { id, title, description, date, imageUrl, link }, { user }) => {
      if (!user || user.role !== "ADMIN") {
        throw new Error("Not authorized. Admin only.");
      }
      return prisma.event.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(date && { date: new Date(date) }),
          ...(imageUrl && { imageUrl }),
          ...(link !== undefined && { link }),
        },
      });
    },
    deleteEvent: async (_, { id }, { user }) => {
      if (!user || user.role !== "ADMIN") {
        throw new Error("Not authorized. Admin only.");
      }
      await prisma.event.delete({ where: { id } });
      return true;
    },
  },
  Event: {
    createdAt: (parent) => parent.createdAt.toISOString(),
    updatedAt: (parent) => parent.updatedAt.toISOString(),
    date: (parent) => parent.date.toISOString(),
  },
};
