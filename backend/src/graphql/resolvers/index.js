import { commonResolvers } from "./commonResolvers.js";
import { userResolvers } from "./userResolvers.js";
import { businessResolvers } from "./businessResolvers.js";
import { adminResolvers } from "./adminResolvers.js";
import { authResolvers } from "./authResolvers.js";
import { walletResolvers } from "./walletResolvers.js";
import { productResolvers } from "./productResolvers.js";
import { searchResolvers } from "./searchResolvers.js";
import { reviewResolvers } from "./reviewResolvers.js";
import { followResolvers } from "./followResolvers.js";
import { videoResolvers } from "./videoResolvers.js";
import { adResolvers } from "./adResolvers.js";
import { topListingResolvers } from "./topListingResolvers.js";
import { verificationResolvers } from "./verificationResolvers.js";
import { notificationResolvers } from "./notificationResolvers.js";
import { analyticsResolvers } from "./analyticsResolvers.js";
import { therapyResolvers } from "./therapyResolvers.js";
import { eventResolvers } from "./eventResolvers.js";
import { reportResolvers } from "./reportResolvers.js";

// Utility to merge resolvers
const mergeResolvers = (...resolvers) => {
  return resolvers.reduce((acc, resolver) => {
    for (const [type, fields] of Object.entries(resolver)) {
      if (!acc[type]) acc[type] = {};
      Object.assign(acc[type], fields);
    }
    return acc;
  }, {});
};

export const resolvers = mergeResolvers(
  commonResolvers,
  userResolvers,
  businessResolvers,
  adminResolvers,
  authResolvers,
  walletResolvers,
  productResolvers,
  searchResolvers,
  reviewResolvers,
  followResolvers,
  videoResolvers,
  adResolvers,
  topListingResolvers,
  verificationResolvers,
  notificationResolvers,
  analyticsResolvers,
  therapyResolvers,
  eventResolvers,
  reportResolvers
);




