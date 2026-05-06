import prisma from "../prisma.js";
import PaystackService from "./PaystackService.js";

class WalletService {
  static async getOrCreateWallet(userId) {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: { transactions: { orderBy: { createdAt: "desc" }, take: 10 } },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId, balance: 0 },
        include: { transactions: true },
      });
    }

    return wallet;
  }

  static async initializeFunding(userId, amount) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const data = await PaystackService.initializeTransaction(user.email, amount);
    
    // Optional: Log a PENDING transaction in our DB
    const wallet = await this.getOrCreateWallet(userId);
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: "FUNDING",
        purpose: "Wallet_Funding",
        reference: data.data.reference,
        status: "PENDING",
      },
    });

    return data.data;
  }

  static async verifyAndCredit(userId, reference) {
    const verification = await PaystackService.verifyTransaction(reference);

    if (verification.data.status !== "success") {
      throw new Error("Payment verification failed");
    }

    const { amount } = verification.data;
    const actualAmount = amount / 100; // Convert kobo back to NGN

    const wallet = await this.getOrCreateWallet(userId);

    return await prisma.$transaction(async (tx) => {
      // Find the pending transaction for this specific reference
      const transaction = await tx.walletTransaction.findFirst({
        where: { reference, walletId: wallet.id },
      });

      if (!transaction) throw new Error("Transaction record not found");

      // Idempotency guard: already credited — return wallet as-is
      if (transaction.status === "SUCCESS") {
        return tx.wallet.findUnique({ where: { id: wallet.id } });
      }

      // Update balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: actualAmount } },
      });

      // Mark transaction as success
      await tx.walletTransaction.update({
        where: { id: transaction.id },
        data: { status: "SUCCESS" },
      });

      return updatedWallet;
    });
  }

  /**
   * Deduct funds from wallet for a specific service.
   */
  static async deduct(userId, businessId, purpose, amount) {
    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.balance < amount) {
      throw new Error("Insufficient wallet balance");
    }

    return await prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          businessId,
          amount,
          type: "DEDUCTION",
          purpose,
          status: "SUCCESS",
        },
      });

      return updatedWallet;
    });
  }

  /**
   * Admin: Get platform-wide wallet statistics.
   */
  static async getAdminStats() {
    const [totalRevenue, totalUserBalances, stats] = await Promise.all([
      prisma.walletTransaction.aggregate({
        where: { type: "FUNDING", status: "SUCCESS" },
        _sum: { amount: true },
      }),
      prisma.wallet.aggregate({
        _sum: { balance: true },
      }),
      prisma.walletTransaction.groupBy({
        by: ["type"],
        where: { status: "SUCCESS" },
        _count: { _all: true },
      }),
    ]);

    const totalTransactionsCount = await prisma.walletTransaction.count({
      where: { status: "SUCCESS" },
    });

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalUserBalances: totalUserBalances._sum.balance || 0,
      totalTransactionsCount,
      fundingCount: stats.find((s) => s.type === "FUNDING")?._count?._all || 0,
      deductionCount: stats.find((s) => s.type === "DEDUCTION")?._count?._all || 0,
    };
  }

  /**
   * Admin: Get all transactions across the platform.
   */
  static async getAllTransactions(pagination = { skip: 0, take: 20 }) {
    return await prisma.walletTransaction.findMany({
      skip: pagination.skip || 0,
      take: pagination.take || 20,
      orderBy: { createdAt: "desc" },
      include: {
        wallet: { include: { user: true } },
        business: true,
      },
    });
  }
}

export default WalletService;
