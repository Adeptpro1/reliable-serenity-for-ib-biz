import prisma from "../prisma.js";
import { GraphQLError } from "graphql";

export class AuthService {
    // Refresh token is now handled by Firebase Client SDK
    static async refreshToken(token) {
        throw new GraphQLError("Refresh tokens are now managed by Firebase.");
    }

    static async registerUser(args) {
        const { firstName, lastName, email, phone, role, dob, gender, lg, city, town, state, agreedToPolicy, firebaseUid } = args;

        // Check for existing user by email or firebaseUid
        let existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { firebaseUid }
                ]
            }
        });

        if (existingUser) {
            if (firebaseUid && !existingUser.firebaseUid) {
                // Link firebaseUid to existing user
                const updatedUser = await prisma.user.update({
                    where: { id: existingUser.id },
                    data: { firebaseUid },
                });
                return { user: updatedUser };
            }
            return { user: existingUser };
        }

        const newUser = await prisma.user.create({
            data: {
                firstName, lastName, email, phone,
                role: role || "USER", dob: dob ? new Date(dob) : null,
                gender, lg, city, town, state, agreedToPolicy,
                firebaseUid,
                isEmailVerified: true, // Firebase handles verification
            },
        });

        return { user: newUser };
    }

    // Login is handled by Firebase Client SDK, the backend verifies the ID token in context
    static async loginUser(email, password, res) {
        throw new GraphQLError("Login is now managed by Firebase. Please use Firebase Client SDK.");
    }

    static async loginAdmin(email, password, res) {
        throw new GraphQLError("Admin login is now managed by Firebase.");
    }

    static async verifyEmail(token) {
        throw new GraphQLError("Email verification is now managed by Firebase.");
    }

    static async resendVerificationEmail(email) {
        throw new GraphQLError("Email verification is now managed by Firebase.");
    }

    static async forgotPassword(email) {
        throw new GraphQLError("Password reset is now managed by Firebase.");
    }

    static async resetPassword(token, newPassword) {
        throw new GraphQLError("Password reset is now managed by Firebase.");
    }

    static async changePassword(user, oldPassword, newPassword) {
        // This could still be implemented if wanted, but Firebase also has methods for this
        throw new GraphQLError("Change password is now managed by Firebase.");
    }

    static async logout(token, res) {
        if (res && res.clearCookie) {
            res.clearCookie('refreshToken');
            res.clearCookie('userToken');
        }
        return true;
    }
}
