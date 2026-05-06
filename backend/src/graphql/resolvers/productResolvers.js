import prisma from "../../prisma.js";
import { ProductService } from "../../services/ProductService.js";

export const productResolvers = {
  Query: {
    // List products with optional filtering
    products: async (_, { category, isMadeInOyo, search, price, minPrice, maxPrice, location, pagination, userLocation }) => {
      const { skip = 0, take = 20 } = pagination || {};
      const where = { isActive: true };

      if (category) where.category = category;
      if (isMadeInOyo !== undefined) where.isMadeInOyo = isMadeInOyo;
      
      // Price filtering
      if (price) {
        where.price = { lte: price };
      } else if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = minPrice;
        if (maxPrice !== undefined) where.price.lte = maxPrice;
      }

      // Location filtering
      if (location) {
        where.location = { contains: location };
      }

      // Full-text search on title + description
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { description: { contains: search } },
        ];
      }

      let productsResponse = await prisma.product.findMany({
        where,
        orderBy: [
          { isBoosted: "desc" }, // Boosted products first
          { createdAt: "desc" },
        ],
        include: {
          images: true,
          business: { include: { addresses: true, contactUrls: true, images: true } },
        },
      });

      if (userLocation) {
        productsResponse.sort((a, b) => {
          if (a.isBoosted !== b.isBoosted) return a.isBoosted ? -1 : 1;

          const scoreA = Math.max(0, ...a.business.addresses.map(addr => {
            if (userLocation.town && addr.town === userLocation.town) return 3;
            if (userLocation.city && addr.city === userLocation.city) return 2;
            if (userLocation.lg && addr.lg === userLocation.lg) return 1;
            return 0;
          }));
          const scoreB = Math.max(0, ...b.business.addresses.map(addr => {
            if (userLocation.town && addr.town === userLocation.town) return 3;
            if (userLocation.city && addr.city === userLocation.city) return 2;
            if (userLocation.lg && addr.lg === userLocation.lg) return 1;
            return 0;
          }));
          if (scoreA !== scoreB) return scoreB - scoreA;
          
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
      }

      return productsResponse.slice(skip, skip + take);
    },

    // Single product by ID
    product: async (_, { id }) => {
      return prisma.product.findUnique({
        where: { id },
        include: {
          images: true,
          business: { include: { addresses: true, contactUrls: true, images: true } },
          reports: true,
        },
      });
    },

    // New: Business products query
    businessProducts: async (_, { businessId }) => {
      return prisma.product.findMany({
        where: { businessId, isActive: true },
        include: { images: true },
        orderBy: { createdAt: "desc" },
      });
    },
  },

  Mutation: {
    createProduct: async (_, { input }, { user }) => {
      return ProductService.createProduct(input, user);
    },

    updateProduct: async (_, { id, input }, { user }) => {
      return ProductService.updateProduct(id, input, user);
    },

    deleteProduct: async (_, { id }, { user }) => {
      return ProductService.deleteProduct(id, user);
    },

    boostProduct: async (_, { productId, days }, { user }) => {
      return ProductService.boostProduct(productId, days, user);
    },

    reportProduct: async (_, { productId }, { user }) => {
      return ProductService.reportProduct(productId, user);
    },
  },

  // Field resolvers
  Product: {
    business: async (parent) =>
      prisma.business.findUnique({
        where: { id: parent.businessId },
        include: { addresses: true, contactUrls: true, images: true },
      }),
    images: async (parent) =>
      prisma.productImage.findMany({ where: { productId: parent.id } }),
    reports: async (parent) =>
      prisma.productReport.findMany({ where: { productId: parent.id } }),
  },
};
