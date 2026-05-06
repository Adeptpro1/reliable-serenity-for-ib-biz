import prisma from "../../prisma.js";
import { GraphQLError } from "graphql";
import WalletService from "../../services/WalletService.js";

export const verificationResolvers = {
  Query: {
    adminVerifications: async (_, { status, pagination }, { user }) => {
      const { skip = 0, take = 20 } = pagination || {};
      const where = {};
      if (status) where.status = status;

      return prisma.businessVerification.findMany({
        where,
        skip,
        take,
        orderBy: { submittedAt: "desc" },
        include: {
          business: true,
          reviewer: true,
        },
      });
    },

    businessVerification: async (_, { businessId }, { user }) => {
      return prisma.businessVerification.findFirst({
        where: { businessId },
        orderBy: { submittedAt: "desc" },
        include: {
          business: true,
          reviewer: true,
        },
      });
    },
  },

  Mutation: {
    submitBusinessVerification: async (_, { input }, { user }) => {
      const { businessId, ...details } = input;

      const business = await prisma.business.findUnique({
        where: { id: businessId },
      });

      if (!business || business.userId !== user.id) {
        throw new GraphQLError("Business not found or access denied");
      }

      // Check for existing pending/approved verification
      const existing = await prisma.businessVerification.findFirst({
        where: {
          businessId,
          status: { in: ["PENDING", "APPROVED"] },
        },
      });

      if (existing) {
        if (existing.status === "APPROVED") {
          throw new GraphQLError("Business is already verified");
        }
        throw new GraphQLError("There is already a pending verification for this business");
      }

      const amount = input.paymentAmount || 50000; // 500 Naira in kobo as per schema default? Or 50,000 kobo (500 NGN)? 
      // User requested 50,000 in schema: "paymentAmount Int @default(50000) // kobo" which is 500 NGN.

      // Deduct from wallet
      await WalletService.deduct(user.id, businessId, "Biz_Verification", amount / 100); 
      // Note: WalletService.deduct seems to take amount in NGN (judging by actualAmount = amount / 100 in verifyAndCredit)
      // I should double check WalletService.deduct amount usage.
      // In WalletService.js: "actualAmount = amount / 100" in verifyAndCredit hints input to Paystack was Kobo.
      // In deduct: "updatedWallet = await tx.wallet.update({ data: { balance: { decrement: amount } } })"
      // This means deduct expects same units as balance. Balance is NGN.
      // So if schema default 50000 kobo, then amount for deduct should be 500.

      const verification = await prisma.businessVerification.create({
        data: {
          businessId,
          ...details,
          paymentAmount: amount,
          paymentStatus: "PAID",
          status: "PENDING",
        },
        include: { business: true },
      });

      return verification;
    },

    reviewBusinessVerification: async (_, { input }, { user }) => {
      const { verificationId, status, reviewerNotes } = input;

      const verification = await prisma.businessVerification.findUnique({
        where: { id: verificationId },
        include: { business: true },
      });

      if (!verification) {
        throw new GraphQLError("Verification request not found");
      }

      return await prisma.$transaction(async (tx) => {
        const updated = await tx.businessVerification.update({
          where: { id: verificationId },
          data: {
            status,
            reviewerNotes,
            reviewedBy: user.id,
            reviewedAt: new Date(),
          },
        });

        // If approved, update business isVerified flag
        if (status === "APPROVED") {
          await tx.business.update({
            where: { id: verification.businessId },
            data: { isVerified: true },
          });
        } else if (status === "REJECTED") {
            // Optional: logic if needed when rejected, e.g. set business verified to false if it was true
            await tx.business.update({
                where: { id: verification.businessId },
                data: { isVerified: false },
              });
        }

        return updated;
      });
    },
  },

  BusinessVerification: {
    reviewer: async (parent) => {
      if (!parent.reviewedBy) return null;
      return prisma.user.findUnique({ where: { id: parent.reviewedBy } });
    },
    business: async (parent) => {
      return prisma.business.findUnique({ where: { id: parent.businessId } });
    },
  },
};
