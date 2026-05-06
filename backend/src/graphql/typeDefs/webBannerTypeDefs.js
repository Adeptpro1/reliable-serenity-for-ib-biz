import { gql } from "apollo-server-express";

const webBannerTypeDefs = gql`

type WebBannerSetting {
  id: ID!
  title: String
  text: String
  image: String
  url: String
  isVisible: Boolean!
  createdAt: String!
  updatedAt: String!
}

type Query {
  webBannerSetting: WebBannerSetting
  webBanners: [WebBannerSetting!]!
}

type Mutation {
  updateWebBannerSetting(title: String, text: String, image: String, url: String, isVisible: Boolean): WebBannerSetting
  createWebBanner(title: String, text: String, image: String, url: String, isVisible: Boolean): WebBannerSetting
}
`;

export default webBannerTypeDefs;