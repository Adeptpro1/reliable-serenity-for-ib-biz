import prisma from "../../prisma.js";

export const therapyResolvers = {
  Query: {
    therapyRequests: async (_, __, { user }) => {
      if (!user || user.role !== "ADMIN") {
        throw new Error("Not authorized. Admin only.");
      }
      return prisma.therapySessionRequest.findMany({
        orderBy: { createdAt: "desc" },
      });
    },
  },
  Mutation: {
    requestTherapySession: async (_, { name, email, phone, message }) => {
      return prisma.therapySessionRequest.create({
        data: {
          name,
          email,
          phone,
          message,
        },
      });
    },
    updateTherapyRequestStatus: async (_, { id, status }, { user }) => {
      if (!user || user.role !== "ADMIN") {
        throw new Error("Not authorized. Admin only.");
      }
      return prisma.therapySessionRequest.update({
        where: { id },
        data: { status },
      });
    },
  },
  TherapySessionRequest: {
    createdAt: (parent) => parent.createdAt.toISOString(),
    updatedAt: (parent) => parent.updatedAt.toISOString(),
  },
};
