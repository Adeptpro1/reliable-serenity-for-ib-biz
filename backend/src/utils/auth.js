import prisma from '../prisma.js';
import { firebaseAdmin } from '../config/firebase.js';

// Verify Firebase ID token
export const verifyToken = async (token) => {
  try {
    return await firebaseAdmin.auth().verifyIdToken(token);
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);
    return null;
  }
};

// src/utils/auth.js
export const getAuthUser = async (token) => {
  if (!token) return null;

  try {
    const decoded = await verifyToken(token);
    if (!decoded?.uid) return null;

    // Validate the token belongs to THIS Firebase project
    // Set FIREBASE_PROJECT_ID in your .env (same value as NEXT_PUBLIC_FIREBASE_PROJECT_ID)
    const expectedProjectId = process.env.FIREBASE_PROJECT_ID;
    if (expectedProjectId && decoded.aud !== expectedProjectId) {
      console.warn('[getAuthUser] Token audience mismatch. Expected:', expectedProjectId, 'Got:', decoded.aud);
      return null;
    }

    // Check if user exists by firebaseUid
    let user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        gender: true,
        lg: true,
        city: true,
        town: true,
        state: true,
        dob: true
      }
    });

    // If user doesn't exist by firebaseUid, try to find by email (for migration)
    if (!user && decoded.email) {
      user = await prisma.user.findUnique({
        where: { email: decoded.email },
      });

      if (user) {
        // Link firebaseUid to existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid: decoded.uid },
          select: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            lastName: true,
            phone: true,
            gender: true,
            lg: true,
            city: true,
            town: true,
            state: true,
            dob: true
          }
        });
      }
    }

    // Auto-create user if not found (Ensures robustness if initial registration sync failed)
    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: decoded.uid,
          email: decoded.email,
          firstName: decoded.name?.split(' ')[0] || 'User',
          lastName: decoded.name?.split(' ').slice(1).join(' ') || '',
          role: 'USER',
          isEmailVerified: decoded.email_verified || false
        },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          phone: true,
          gender: true,
          lg: true,
          city: true,
          town: true,
          state: true,
          dob: true
        }
      });
    }

    return user;

  } catch (error) {
    console.error('getAuthUser error:', error);
    return null;
  }
};

// The following functions are no longer needed for Firebase Auth but kept for compatibility if referenced elsewhere
export const hashPassword = async (password) => {
  // Passwords are managed by Firebase
  return null;
};

export const comparePassword = async (password, hashedPassword) => {
  // Passwords are managed by Firebase
  return false;
};

export const signToken = (user) => {
  // No longer used, frontend uses Firebase ID token
  return null;
};

export const signRefreshToken = (user, exp = "7d") => {
  // No longer used, Firebase handles refresh tokens
  return null;
};

export const verifyRefreshToken = (token) => {
  // No longer used, Firebase handles refresh tokens
  return null;
};
