
// src/middleware/authMiddleware.js
import prisma from '../prisma.js';
import { getAuthUser } from '../utils/auth.js';

export const authMiddleware = async ({ req, res }) => {
  try {
    let token = req.headers.authorization?.replace('Bearer ', '');

    // Fallback to cookie if token is not in headers
    if (!token && req.cookies && req.cookies.userToken) {
      token = req.cookies.userToken;
    }

    // if (process.env.NODE_ENV !== 'production') console.log('[AuthMiddleware] Token found:', !!token);

    // Skip auth for introspection querie
    if (req.body?.operationName === 'IntrospectionQuery' ||
      req.body?.operationName === 'RefreshToken') {

      return { user: null, business: null, prisma, req };
    }

    // Authenticate user (fetch from DB with role)
    const user = await getAuthUser(token);

    let business = null;

    // Auto-detect business if user is not admin
    const hasBusinessId =
      req.body?.variables?.businessId !== undefined &&
      req.body?.variables?.businessId !== null;

    if (user && hasBusinessId && user.role !== 'ADMIN') {
      business = await prisma.business.findFirst({
        where: {
          id: req.body.variables.businessId,
          userId: user.id
        },
        select: {
          id: true,
          name: true
        }
      });
    }

    return { user, business, prisma, req, res };

  } catch (error) {
    console.warn('[AuthMiddleware] Auth error:', error.message);
    return { user: null, business: null, prisma, req, res };
  }
};
