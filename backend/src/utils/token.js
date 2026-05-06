import bcrypt from 'bcryptjs';

/**
 * Generates a random token and its bcrypt hash
 */
export async function generateVerificationToken(ttlMinutes = 60) {
  const rawToken = await bcrypt.genSalt(32); // bcrypt can generate random strings
  const hashedToken = await bcrypt.hash(rawToken, 12);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  return { rawToken, hashedToken, expiresAt };
}

/** Verifies a token against its bcrypt hash */
export async function verifyToken(token, hashedToken) {
  return await bcrypt.compare(token, hashedToken);
}

// // src/utils/auth.js
// import bcrypt from 'bcryptjs';

export const hashToken = async (token) => {
  const saltRounds = 12;
  return await bcrypt.hash(token, saltRounds);
};

// Update your verifyRefreshToken to use async
export const verifyRefreshToken = async (token) => {
  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    
    // Additional check: verify token exists in DB and is valid
    const hashedToken = await hashToken(token);
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        tokenHash: hashedToken,
        userId: payload.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      }
    });

    return storedToken ? payload : null;
  } catch {
    return null;
  }
};
// Usage
// Generate
// const { rawToken, hashedToken, expiresAt } = await generateVerificationToken();

// // Verify  
// const isValid = await verifyToken(userProvidedToken, storedHashedToken);