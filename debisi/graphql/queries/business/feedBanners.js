import { gql } from "@apollo/client";

export const GET_ACTIVE_FEED_BANNERS = gql`
  query GetActiveFeedBanners {
    activeMobileFeedBanners {
      id
      title
      description
      images
      ctaUrl
      status
    }
  }
`;

export const CLICK_FEED_BANNER = gql`
  mutation ClickMobileFeedBanner($id: ID!) {
    clickMobileFeedBanner(id: $id) {
      id
      clicks
    }
  }
`;

export const RECORD_FEED_BANNER_IMPRESSION = gql`
  mutation RecordMobileFeedBannerImpression($id: ID!) {
    recordMobileFeedBannerImpression(id: $id) {
      id
      impressions
    }
  }
`;
