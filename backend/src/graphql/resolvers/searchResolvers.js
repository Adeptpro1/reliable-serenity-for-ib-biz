import prisma from "../../prisma.js";

export const searchResolvers = {
  Query: {
    /**
     * Search businesses with locality-first prioritization.
     * Businesses in the same town/city/lg as the user appear first.
     */
    search: async (_, { query, filter }, { user }) => {
      const where = {};

      // Apply filters
      if (filter?.category) where.category = filter.category;
      if (filter?.verified) where.isVerified = true;
      if (filter?.madeInOyo) where.isMadeInOyo = true;

      // Text search on name and description
      if (query) {
        where.OR = [
          { name: { contains: query } },
          { description: { contains: query } },
        ];
      }

      // City/category filter from the filter input
      const cityFilter = filter?.city;

      const businesses = await prisma.business.findMany({
        where,
        include: {
          addresses: true,
          images: true,
          contactUrls: true,
          reviews: true,
          user: true,
        },
      });

      // Locality-first sorting
      // Priority: verified businesses first, then businesses whose address
      // matches the user's location (town > city > lg), then the rest
      const userTown = user?.town || null;
      const userCity = user?.city || null;
      const userLg = user?.lg || null;

      const scored = businesses.map((biz) => {
        let score = 0;

        // Verified businesses get a bonus
        if (biz.isVerified) score += 100;

        // Match locality from addresses
        if (biz.addresses && biz.addresses.length > 0) {
          for (const addr of biz.addresses) {
            // If a specific city filter was provided, prioritize that
            if (cityFilter && addr.city === cityFilter) {
              score += 50;
            }
            // Otherwise, match the user's location
            if (userTown && addr.town === userTown) score += 30;
            if (userCity && addr.city === userCity) score += 20;
            if (userLg && addr.lg === userLg) score += 10;
          }
        }

        return { ...biz, _score: score };
      });

      // Sort by score descending, then by createdAt descending
      scored.sort((a, b) => {
        if (b._score !== a._score) return b._score - a._score;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      // Remove the internal score field before returning
      return scored.map(({ _score, ...biz }) => biz);
    },
  },
};
