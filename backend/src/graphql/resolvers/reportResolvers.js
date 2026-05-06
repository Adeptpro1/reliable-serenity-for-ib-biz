import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const reportResolvers = {
  Query: {
    exportLeadsCSV: async (_, { noticeId }, { user }) => {
      if (!user) {
        throw new Error("Not authorized");
      }

      const notice = await prisma.noticeboard.findUnique({
        where: { id: noticeId },
        include: { business: true },
      });

      if (!notice) {
        throw new Error("Notice not found");
      }

      if (notice.business.userId !== user.id && user.role !== "ADMIN") {
        throw new Error("Not authorized to export these leads");
      }

      const leads = await prisma.contactSubmission.findMany({
        where: { noticeId },
        orderBy: { submittedAt: "desc" },
      });

      if (leads.length === 0) {
        return "Name,Email,Phone,SubmittedAt\nNo leads,No leads,No leads,";
      }

      const flattenData = leads.map(lead => {
        const base = {
          Name: lead.name,
          Email: lead.email,
          Phone: lead.phone || "",
          SubmittedAt: lead.submittedAt.toISOString(),
        };
        if (lead.additionalData && typeof lead.additionalData === 'object') {
          for (const [key, value] of Object.entries(lead.additionalData)) {
            base[key] = value || "";
          }
        }
        return base;
      });

      // Simple CSV string generation
      const keys = Array.from(new Set(flattenData.flatMap(Object.keys)));
      const csvHeaders = keys.join(",");
      const csvRows = flattenData.map(row => {
        return keys.map(k => `"${(row[k] || "").toString().replace(/"/g, '""')}"`).join(",");
      }).join("\n");

      return `${csvHeaders}\n${csvRows}`;
    },
  },
};
