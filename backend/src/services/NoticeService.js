import prisma from "../prisma.js";
import { GraphQLError } from "graphql";
import WalletService from "./WalletService.js";

export class NoticeService {
  static async createNotice(input, user) {
    if (!user) throw new GraphQLError("Authentication required");

    const { 
      businessId, 
      title, 
      content, 
      callToAction, 
      link, 
      images, 
      leadFields, 
      boostDays 
    } = input;

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: user.id }
    });
    if (!business) throw new GraphQLError("Business not found or access denied");

    // Handle initial boost if requested
    let boosted = false;
    let boostExpiresAt = null;

    if (boostDays && boostDays > 0) {
      const cost = boostDays * 100;
      await WalletService.deduct(user.id, businessId, "Notice_Boost", cost);
      boosted = true;
      boostExpiresAt = new Date();
      boostExpiresAt.setDate(boostExpiresAt.getDate() + boostDays);
    }

    const notice = await prisma.noticeboard.create({
      data: {
        businessId,
        title,
        content,
        callToAction,
        link,
        leadFields: leadFields || null,
        boosted,
        boostExpiresAt,
        startDate: new Date(),
        endDate: boostExpiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days visibility
      }
    });

    if (images && images.length > 0) {
      await Promise.all(images.slice(0, 2).map(imageUrl => 
        prisma.noticeImage.create({
          data: { noticeId: notice.id, imageUrl }
        })
      ));
    }

    return prisma.noticeboard.findUnique({
      where: { id: notice.id },
      include: { images: true, business: true }
    });
  }

  static async updateNotice(id, input, user) {
    if (!user) throw new GraphQLError("Authentication required");

    const notice = await prisma.noticeboard.findUnique({
      where: { id },
      include: { business: true }
    });

    if (!notice || notice.business.userId !== user.id) {
      throw new GraphQLError("Notice not found or access denied");
    }

    const { title, content, callToAction, link, images, leadFields } = input;

    return await prisma.$transaction(async (tx) => {
      const updatedNotice = await tx.noticeboard.update({
        where: { id },
        data: {
          title: title !== undefined ? title : undefined,
          content: content !== undefined ? content : undefined,
          callToAction: callToAction !== undefined ? callToAction : undefined,
          link: link !== undefined ? link : undefined,
          leadFields: leadFields !== undefined ? leadFields : undefined,
        }
      });

      if (images !== undefined) {
        await tx.noticeImage.deleteMany({ where: { noticeId: id } });
        if (images && images.length > 0) {
          await Promise.all(images.slice(0, 2).map(imageUrl => 
            tx.noticeImage.create({
              data: { noticeId: id, imageUrl }
            })
          ));
        }
      }

      return tx.noticeboard.findUnique({
        where: { id },
        include: { images: true, business: true }
      });
    });
  }

  static async deleteNotice(id, user) {
    if (!user) throw new GraphQLError("Authentication required");

    const notice = await prisma.noticeboard.findUnique({
      where: { id },
      include: { business: true }
    });

    if (!notice || (user.role !== "ADMIN" && notice.business.userId !== user.id)) {
      throw new GraphQLError("Notice not found or access denied");
    }

    await prisma.noticeImage.deleteMany({ where: { noticeId: id } });
    await prisma.contactSubmission.deleteMany({ where: { noticeId: id } });
    await prisma.noticeboard.delete({ where: { id } });

    return true;
  }

  static async boostNotice(noticeId, days, user) {
    if (!user) throw new GraphQLError("Authentication required");
    if (!days || days <= 0) throw new GraphQLError("Invalid boost duration");

    const notice = await prisma.noticeboard.findUnique({
      where: { id: noticeId },
      include: { business: true }
    });

    if (!notice || notice.business.userId !== user.id) {
      throw new GraphQLError("Notice not found or access denied");
    }

    const cost = days * 100;
    await WalletService.deduct(user.id, notice.businessId, "Notice_Boost", cost);

    let currentExpiry = notice.boostExpiresAt || new Date();
    if (currentExpiry < new Date()) currentExpiry = new Date();
    
    const newExpiry = new Date(currentExpiry);
    newExpiry.setDate(newExpiry.getDate() + days);

    return prisma.noticeboard.update({
      where: { id: noticeId },
      data: {
        boosted: true,
        boostExpiresAt: newExpiry,
        endDate: newExpiry // Sync end date for visibility
      },
      include: { images: true, business: true }
    });
  }

  static async submitLead(noticeId, input) {
    const notice = await prisma.noticeboard.findUnique({
      where: { id: noticeId }
    });

    if (!notice) throw new GraphQLError("Notice not found");

    // Check if boost is active
    const now = new Date();
    const isBoostActive = notice.boosted && notice.boostExpiresAt && notice.boostExpiresAt > now;

    if (!isBoostActive) {
      throw new GraphQLError("Contact collection is currently disabled for this notice");
    }

    const { name, email, phone, additionalData } = input;

    // Idempotency: prevent the same email submitting twice for the same notice
    if (email) {
      const existing = await prisma.contactSubmission.findFirst({
        where: { noticeId, email },
      });
      if (existing) {
        throw new GraphQLError("You have already submitted a lead for this notice.");
      }
    }

    return prisma.contactSubmission.create({
      data: {
        noticeId,
        name,
        email,
        phone,
        additionalData: additionalData || null
      },
      include: { notice: true }
    });
  }
}
