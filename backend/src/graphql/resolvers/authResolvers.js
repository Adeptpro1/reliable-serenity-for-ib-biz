import { AuthService } from "../../services/AuthService.js";

export const authResolvers = {
  Mutation: {
    refreshToken: async (_, { token }) => {
      return await AuthService.refreshToken(token);
    },

    registerUser: async (_, args) => {
      return await AuthService.registerUser(args);
    },

    loginUser: async (_, { email, password }, { req, res }) => {
      return await AuthService.loginUser(email, password, res);
    },

    loginAdmin: async (_, { email, password }, { req, res }) => {
      return await AuthService.loginAdmin(email, password, res);
    },

    verifyEmail: async (_, { token }) => {
      return await AuthService.verifyEmail(token);
    },

    resendVerificationEmail: async (_, { email }) => {
      return await AuthService.resendVerificationEmail(email);
    },

    forgotPassword: async (_, { email }) => {
      return await AuthService.forgotPassword(email);
    },

    resetPassword: async (_, { token, newPassword }) => {
      return await AuthService.resetPassword(token, newPassword);
    },

    changePassword: async (_, { oldPassword, newPassword }, { user }) => {
      return await AuthService.changePassword(user, oldPassword, newPassword);
    },

    logout: async (_, { token }, { req, res }) => {
      return await AuthService.logout(token, res);
    },
  },
};
