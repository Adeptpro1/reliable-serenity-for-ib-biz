import WalletService from "../../services/WalletService.js";

export const walletResolvers = {
  Query: {
    myWallet: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return WalletService.getOrCreateWallet(user.id);
    },
    walletTransactions: async (_, { businessId, pagination }, { user, prisma }) => {
      if (!user) throw new Error("Not authenticated");
      const { skip = 0, take = 20 } = pagination || {};
      
      const wallet = await WalletService.getOrCreateWallet(user.id);
      const whereClause = { walletId: wallet.id };
      if (businessId) {
        whereClause.businessId = businessId;
      }

      return prisma.walletTransaction.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { business: true },
      });
    },
    adminWalletStats: async (_, __, { user }) => {
      // @auth directive handles role check, but service does the work
      return WalletService.getAdminStats();
    },
    adminAllWalletTransactions: async (_, { pagination }, { user }) => {
      return WalletService.getAllTransactions(pagination);
    },
  },

  Mutation: {
    initializeWalletFunding: async (_, { amount }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return WalletService.initializeFunding(user.id, amount);
    },
    verifyWalletFunding: async (_, { reference }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return WalletService.verifyAndCredit(user.id, reference);
    },
  },

  User: {
    wallet: async (parent) => WalletService.getOrCreateWallet(parent.id),
  },

  Wallet: {
    user: async (parent, __, { prisma }) => prisma.user.findUnique({ where: { id: parent.userId } }),
    transactions: async (parent, __, { prisma }) => 
      prisma.walletTransaction.findMany({ 
        where: { walletId: parent.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
  },

  WalletTransaction: {
    wallet: async (parent, __, { prisma }) => prisma.wallet.findUnique({ where: { id: parent.walletId } }),
    business: async (parent, __, { prisma }) => {
      if (!parent.businessId) return null;
      return prisma.business.findUnique({ where: { id: parent.businessId } });
    },
  },
};
