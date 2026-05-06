import prisma from "../prisma.js";
import { GraphQLError } from "graphql";
import slugify from "slugify";
import { delCache, clearCachePrefix } from "../utils/cache.js";

const NAME_MAX_LENGTH = 40;
const DESCRIPTION_MAX_LENGTH = 150;
const PHONE_MAX_LENGTH = 20;
const ADDRESS_MAX_LENGTH = 120;
const SOCIAL_URL_MAX_LENGTH = 250;

export class BusinessService {
  static async registerBusinessWithDetails(input, user) {
    if (!user) throw new GraphQLError("Authentication required");

    const {
      name,
      category,
      description,
      phone,
      isMadeInOyo,
      addresses,
      contactUrls,
      imageUrl,
      galleryImages,
    } = input;

    if (name && name.length > NAME_MAX_LENGTH) {
      throw new GraphQLError(`Business name cannot exceed ${NAME_MAX_LENGTH} characters`);
    }
    if (description && description.length > DESCRIPTION_MAX_LENGTH) {
      throw new GraphQLError(`Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters`);
    }

    if (phone && phone.length > PHONE_MAX_LENGTH) {
      throw new GraphQLError(`Phone number cannot exceed ${PHONE_MAX_LENGTH} characters`);
    }

    if (addresses.length > 2)
      throw new GraphQLError("Only two addresses allowed");

    for (const addr of addresses) {
      if (addr.address1 && addr.address1.length > ADDRESS_MAX_LENGTH) {
        throw new GraphQLError(`Address 1 cannot exceed ${ADDRESS_MAX_LENGTH} characters`);
      }
      if (addr.address2 && addr.address2.length > ADDRESS_MAX_LENGTH) {
        throw new GraphQLError(`Address 2 cannot exceed ${ADDRESS_MAX_LENGTH} characters`);
      }
    }

    if (contactUrls) {
      for (const contact of contactUrls) {
        if (contact.url && contact.url.length > SOCIAL_URL_MAX_LENGTH) {
          throw new GraphQLError(`Social URL cannot exceed ${SOCIAL_URL_MAX_LENGTH} characters`);
        }
      }
    }

    const processedAddresses = input.addresses.map((addr) => ({
      ...addr,
      address2: addr.address2 || null,
    }));

    const uniqueContactTypes = new Set();
    for (const contact of contactUrls) {
      if (uniqueContactTypes.has(contact.type)) {
        throw new GraphQLError(`Duplicate contact type: ${contact.type}`);
      }
      uniqueContactTypes.add(contact.type);
    }

    let baseSlug = slugify(name, { lower: true, strict: true });

    const blockedSlugs = [
      "debisi",
      "debisi-ng",
      "debisi-cp",
      "debisi-ibadan",
      "debising",
      "debisicp",
      "debisiibadan",
    ];
    if (blockedSlugs.includes(baseSlug)) {
      throw new GraphQLError(
        "This business name is reserved by the system. Please use a different name.",
      );
    }

    let slug = baseSlug;
    let count = 1;
    while (await prisma.business.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    let newBusiness;
    try {
      newBusiness = await prisma.business.create({
        data: {
          name,
          category,
          userId: user.id,
          description,
          phone,
          isMadeInOyo,
          slug,
        },
      });
    } catch (error) {
      if (error.code === "P2002" && error.meta?.target?.includes("name")) {
        throw new GraphQLError(
          "Business name already exists. Please choose a different name.",
        );
      }
      throw error;
    }

    await Promise.all([
      ...processedAddresses.map((addr) =>
        prisma.address.create({
          data: { ...addr, businessId: newBusiness.id },
        }),
      ),
      ...contactUrls.map((contact) =>
        prisma.contactUrl.create({
          data: {
            ...contact,
            businessId: newBusiness.id,
          },
        }),
      ),
      imageUrl
        ? prisma.businessImage.create({
            data: {
              imageUrl,
              isLogo: true,
              businessId: newBusiness.id,
            },
          })
        : Promise.resolve(),
      ...(galleryImages || []).slice(0, 4).map((url) =>
        prisma.businessImage.create({
          data: {
            imageUrl: url,
            isLogo: false,
            businessId: newBusiness.id,
          },
        }),
      ),
    ]);

    const result = await prisma.business.findUnique({
      where: { id: newBusiness.id },
      include: {
        addresses: true,
        contactUrls: true,
        images: true,
      },
    });

    await delCache("businesses");
    await clearCachePrefix("businesses_paginated:");

    return result;
  }

  static async updateBusiness(id, input, user) {
    if (!user) throw new GraphQLError("Authentication required");

    const existingBusiness = await prisma.business.findFirst({
      where: { id: id, userId: user.id },
      include: { addresses: true, contactUrls: true, images: true },
    });
    if (!existingBusiness) throw new GraphQLError("Business not found");

    const {
      name,
      category,
      description,
      phone,
      isMadeInOyo,
      addresses,
      contactUrls,
      imageUrl,
      galleryImages,
      slug,
    } = input;

    if (slug) {
      const blockedSlugs = [
        "debisi",
        "debisi-ng",
        "debisi-cp",
        "debisi-ibadan",
        "debising",
        "debisicp",
        "debisiibadan",
      ];
      if (blockedSlugs.includes(slug.toLowerCase())) {
        throw new GraphQLError("This URL slug is reserved and cannot be used.");
      }

      const slugExists = await prisma.business.findFirst({
        where: { slug, NOT: { id: id } },
      });
      if (slugExists)
        throw new GraphQLError("Slug already in use. Choose another");
    }

    if (name && name.length > NAME_MAX_LENGTH) {
      throw new GraphQLError(`Business name cannot exceed ${NAME_MAX_LENGTH} characters`);
    }
    if (description && description.length > DESCRIPTION_MAX_LENGTH) {
      throw new GraphQLError(`Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters`);
    }

    if (phone && phone.length > PHONE_MAX_LENGTH) {
      throw new GraphQLError(`Phone number cannot exceed ${PHONE_MAX_LENGTH} characters`);
    }

    if (addresses && addresses.length > 2) {
      throw new GraphQLError("Only two addresses allowed");
    }

    if (addresses) {
      for (const addr of addresses) {
        if (addr.address1 && addr.address1.length > ADDRESS_MAX_LENGTH) {
          throw new GraphQLError(`Address 1 cannot exceed ${ADDRESS_MAX_LENGTH} characters`);
        }
        if (addr.address2 && addr.address2.length > ADDRESS_MAX_LENGTH) {
          throw new GraphQLError(`Address 2 cannot exceed ${ADDRESS_MAX_LENGTH} characters`);
        }
      }
    }

    if (contactUrls) {
      for (const contact of contactUrls) {
        if (contact.url && contact.url.length > SOCIAL_URL_MAX_LENGTH) {
          throw new GraphQLError(`Social URL cannot exceed ${SOCIAL_URL_MAX_LENGTH} characters`);
        }
      }
    }

    if (contactUrls) {
      const uniqueContactTypes = new Set();
      for (const contact of contactUrls) {
        if (uniqueContactTypes.has(contact.type)) {
          throw new GraphQLError(`Duplicate contact type: ${contact.type}`);
        }
        uniqueContactTypes.add(contact.type);
      }
    }

    const updatedBusiness = await prisma.$transaction(async (tx) => {
      const businessUpdateData = {};
      if (name !== undefined) businessUpdateData.name = name;
      if (category !== undefined) businessUpdateData.category = category;
      if (description !== undefined)
        businessUpdateData.description = description;
      if (phone !== undefined) businessUpdateData.phone = phone;
      if (isMadeInOyo !== undefined)
        businessUpdateData.isMadeInOyo = isMadeInOyo;
      if (slug !== undefined) businessUpdateData.slug = slug;

      const updatedBusiness = await tx.business.update({
        where: { id: id },
        data: businessUpdateData,
      });

      if (addresses) {
        await tx.address.deleteMany({
          where: { businessId: id },
        });

        const processedAddresses = addresses.map((addr) => ({
          ...addr,
          address2: addr.address2 || null,
        }));

        await Promise.all(
          processedAddresses.map((addr) =>
            tx.address.create({
              data: { ...addr, businessId: id },
            }),
          ),
        );
      }

      if (contactUrls) {
        await tx.contactUrl.deleteMany({
          where: { businessId: id },
        });

        await Promise.all(
          contactUrls.map((contact) =>
            tx.contactUrl.create({
              data: {
                ...contact,
                businessId: id,
              },
            }),
          ),
        );
      }

      if (imageUrl !== undefined) {
        await tx.businessImage.deleteMany({
          where: { businessId: id, isLogo: true },
        });

        if (imageUrl) {
          await tx.businessImage.create({
            data: {
              imageUrl,
              isLogo: true,
              businessId: id,
            },
          });
        }
      }

      if (galleryImages) {
        await tx.businessImage.deleteMany({
          where: { businessId: id, isLogo: false },
        });

        await Promise.all(
          galleryImages.slice(0, 4).map((url) =>
            tx.businessImage.create({
              data: {
                imageUrl: url,
                isLogo: false,
                businessId: id,
              },
            }),
          ),
        );
      }

      return tx.business.findUnique({
        where: { id: id },
        include: {
          addresses: true,
          contactUrls: true,
          images: true,
        },
      });
    });

    await delCache(
      [
        "businesses",
        `business:${id}`,
        `business_slug:${existingBusiness.slug}`,
        existingBusiness.slug !== slug ? `business_slug:${slug}` : null,
      ].filter(Boolean),
    );

    await clearCachePrefix("businesses_paginated:");

    return updatedBusiness;
  }
}
