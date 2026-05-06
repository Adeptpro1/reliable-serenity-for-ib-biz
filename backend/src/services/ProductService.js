import prisma from "../prisma.js";
import { GraphQLError } from "graphql";
import WalletService from "./WalletService.js";

export class ProductService {
  /**
   * Create a new product for a business.
   */
  static async createProduct(input, user) {
    if (!user) throw new GraphQLError("Authentication required");

    const {
      businessId,
      title,
      description,
      price,
      location,
      isMadeInOyo,
      stock,
      discount,
      deliveryOption,
      category,
      contactPreference,
      images,
    } = input;

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: user.id },
    });
    if (!business)
      throw new GraphQLError("Business not found or access denied");

    const product = await prisma.product.create({
      data: {
        businessId,
        title,
        description,
        price,
        location,
        isMadeInOyo: isMadeInOyo ?? false,
        stock: stock ?? 1,
        discount: discount ?? 0,
        deliveryOption,
        category,
        contactPreference,
      },
    });

    // Create product images if provided
    if (images && images.length > 0) {
      await Promise.all(
        images.slice(0, 5).map((img, index) =>
          prisma.productImage.create({
            data: {
              productId: product.id,
              imageUrl: img,
              isPrimary: index === 0,
            },
          })
        )
      );
    }

    return prisma.product.findUnique({
      where: { id: product.id },
      include: {
        images: true,
        business: { include: { addresses: true, contactUrls: true } },
      },
    });
  }

  /**
   * Update an existing product.
   */
  static async updateProduct(id, input, user) {
    if (!user) throw new GraphQLError("Authentication required");

    const product = await prisma.product.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!product || product.business.userId !== user.id) {
      throw new GraphQLError("Product not found or access denied");
    }

    const {
      title,
      description,
      price,
      location,
      isMadeInOyo,
      stock,
      discount,
      deliveryOption,
      category,
      contactPreference,
      isActive,
      images,
    } = input;

    return await prisma.$transaction(async (tx) => {
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = price;
      if (location !== undefined) updateData.location = location;
      if (isMadeInOyo !== undefined) updateData.isMadeInOyo = isMadeInOyo;
      if (stock !== undefined) updateData.stock = stock;
      if (discount !== undefined) updateData.discount = discount;
      if (deliveryOption !== undefined) updateData.deliveryOption = deliveryOption;
      if (category !== undefined) updateData.category = category;
      if (contactPreference !== undefined) updateData.contactPreference = contactPreference;
      if (isActive !== undefined) updateData.isActive = isActive;

      await tx.product.update({
        where: { id },
        data: updateData,
      });

      // Replace images if provided
      if (images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length > 0) {
          await Promise.all(
            images.slice(0, 5).map((img, index) =>
              tx.productImage.create({
                data: {
                  productId: id,
                  imageUrl: img,
                  isPrimary: index === 0,
                },
              })
            )
          );
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          images: true,
          business: { include: { addresses: true, contactUrls: true } },
        },
      });
    });
  }

  /**
   * Delete a product.
   */
  static async deleteProduct(id, user) {
    if (!user) throw new GraphQLError("Authentication required");

    const product = await prisma.product.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!product) throw new GraphQLError("Product not found");
    if (user.role !== "ADMIN" && product.business.userId !== user.id) {
      throw new GraphQLError("Access denied");
    }

    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productReport.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    return true;
  }

  /**
   * Boost a product – deducts from wallet, sets isBoosted = true.
   */
  static async boostProduct(productId, days, user) {
    if (!user) throw new GraphQLError("Authentication required");
    if (!days || days <= 0 || days > 30) throw new GraphQLError("Boost days must be between 1 and 30");

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { business: true },
    });

    if (!product || product.business.userId !== user.id) {
      throw new GraphQLError("Product not found or access denied");
    }

    const cost = days * 100; // cost per day
    await WalletService.deduct(user.id, product.businessId, "Top_List_Product", cost);

    // Stack on top of existing active boost, or start from now
    let currentExpiry = product.boostExpiresAt || new Date();
    if (currentExpiry < new Date()) currentExpiry = new Date();
    const newExpiry = new Date(currentExpiry);
    newExpiry.setDate(newExpiry.getDate() + days);

    return prisma.product.update({
      where: { id: productId },
      data: { isBoosted: true, boostExpiresAt: newExpiry },
      include: {
        images: true,
        business: { include: { addresses: true, contactUrls: true } },
      },
    });
  }

  /**
   * Report a product (flag for review).
   */
  static async reportProduct(productId, user) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new GraphQLError("Product not found");

    return prisma.productReport.create({
      data: {
        productId,
        userId: user?.id || null,
      },
      include: { product: true },
    });
  }
}
