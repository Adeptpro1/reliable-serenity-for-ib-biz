import { gql } from "apollo-server-express";

const businessTypeDefs = gql`
  type Business {
    id: ID!
    name: String!
    slug: String!
    description: String!
    category: BusinessCategory!
    phone: String
    user: User!
    addresses: [BusinessAddress!]
    isVerified: Boolean!
    isMadeInOyo: Boolean!
    images: [BusinessImage!]
    products: [Product!]
    notices: [Noticeboard!]
    videos: [BusinessVideo!]
    reviews: [Review!]
    ads: [Ad!]
    topListAds: [TopListingAd!]
    payments: [Payment]
    contactUrls: [ContactUrl]
    verifications: [BusinessVerification!]
    heatmap: HeatmapAnalytics
    shares: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type BusinessAddress {
    id: ID!
    business: Business!
    address1: String!
    address2: String
    town: Town!
    city: City!
    lg: Lg!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type HeatmapAnalytics {
    id: ID!
    business: Business!
    video: BusinessVideo!
    notice: Noticeboard!
    pageViews: Int!
    contactClicks: Int!
    searchAppearances: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Product {
    id: ID!
    title: String!
    description: String!
    location: String
    city: City
    lg: Lg
    town: Town
    price: Float!
    stock: Int!
    discount: Float
    isMadeInOyo: Boolean!
    deliveryOption: DeliveryOption
    category: ProductCategory!
    contactPreference: ContactType
    isBoosted: Boolean!
    isActive: Boolean!
    images: [ProductImage!]!
    business: Business!
    analytics: HeatmapAnalytics
    reports: [ProductReport!]
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Noticeboard {
    id: ID!
    title: String!
    content: String!
    likes: Int!
    shares: Int!
    views: Int!
    callToAction: String
    link: String
    locationBoundary: String
    business: Business!
    analytics: HeatmapAnalytics
    contactPreference: ContactType!
    contactSubmissions: [ContactSubmission!]
    contacts: [NoticeContact!]
    images: [NoticeImage!]
    leadFields: JSON
    boosted: Boolean!
    startDate: DateTime!
    endDate: DateTime!
    boostExpiresAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type NoticeImage {
    id: ID!
    noticeId: ID!
    imageUrl: String!
    uploadedAt: DateTime!
  }

  type NoticeContact {
    id: ID!
    notice: Noticeboard!
    user: User
    createdAt: DateTime!
  }

  type BusinessVideo {
    id: ID!
    videoUrl: String!
    business: Business!
    sponsoredAd: Ad
    likes: Int
    downloads: Int
    views: Int
    shares: Int
    boosted: Boolean
    duration: Int
    isSponsored: Boolean
    locationBoundary: String
    analytics: HeatmapAnalytics
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type BusinessImage {
    id: ID!
    business: Business!
    imageUrl: String!
    isLogo: Boolean!
    uploadedAt: DateTime!
  }

  type Ad {
    id: ID!
    type: AdType!
    title: String
    targetUrl: String
    business: Business!
    imageUrl: String
    videoUrl: String
    impressions: Int
    clicks: Int
    autoApprove: Boolean!
    user: User!
    status: AdStatus!
    payment: Payment
    approvedBy: User
    analytics: HeatmapAnalytics
    createdAt: DateTime!
    updatedAt: DateTime!
    EndDate: DateTime!
  }

  type TopListingAd {
    id: ID!
    business: Business!
    toplist: TopListAd!
    startDate: DateTime!
    endDate: DateTime!
    createdAt: DateTime!
  }

  type Sponsorship {
    id: ID!
    user: User!
    amount: Float!
    benefits: String
    createdAt: DateTime!
    endDate: DateTime!
  }

  type BusinessVerification {
    id: ID!
    business: Business!
    natureOfBusiness: String!
    currentAddress: String!
    bankName: String!
    accountNumber: String!
    accountName: String!
    accountType: String!
    certificationType: String
    primaryContactName: String
    primaryContactPhone: String
    primaryContactEmail: String
    secondaryContactName: String
    secondaryContactPhone: String
    secondaryContactEmail: String
    cacCertificateUrl: String!
    memoOfAssociationUrl: String
    letterheadUrl: String
    chequeUrl: String
    paymentAmount: Int!
    paymentStatus: PaymentStatus!
    status: VerificationStatus!
    reviewerNotes: String
    submittedAt: DateTime!
    reviewedAt: DateTime!
    reviewedBy: String
    reviewer: User
  }

  type Review {
    id: ID!
    user: User!
    userId: ID!
    business: Business!
    rating: Int!
    createdAt: DateTime!
  }

  type ProductReport {
    id: ID!
    product: Product!
    user: User!
    createdAt: DateTime!
  }

  type Payment {
    id: ID!
    business: Business!
    user: User
    amount: Float!
    purpose: PaymentPurpose!
    status: PaymentStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
    paidat: DateTime
  }

  type Notification {
    id: ID!
    user: User!
    title: String!
    content: String!
    isRead: Boolean
    clicks: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ContactUrl {
    id: ID!
    business: Business
    url: String!
    type: ContactType
    isPrimary: Boolean
  }

  type ContactSubmission {
    id: ID!
    notice: Noticeboard!
    name: String!
    email: String!
    phone: String
    additionalData: JSON
    submittedAt: DateTime!
  }

  type SlugHistory {
    id: ID!
    business: Business
    slug: String!
    changedAt: DateTime!
  }

  type ProductImage {
    id: ID!
    product: Product!
    imageUrl: String!
    isPrimary: Boolean!
    createdAt: DateTime!
  }

  type ProductReport {
    id: ID!
    product: Product!
    user: User!
    createdAt: DateTime!
  }

  type AIIntentResult {
    keywords: String
    category: BusinessCategory
    town: Town
    city: City
    lg: Lg
  }

  union SearchResult = Business | Product | Noticeboard | BusinessVideo

  extend type Query {
    businesses: [Business!]
    business(id: ID!): Business
    businessBySlug(slug: String!): Business
    businessesPaginated(
      pagination: PaginationInput
      userLocation: LocationInput
      search: String
      category: BusinessCategory
    ): [Business!]!
    search(query: String!, filter: BusinessFilterInput): [Business!]!
    analyzeSearchQuery(prompt: String!): AIIntentResult! @auth
    products(
      category: ProductCategory
      isMadeInOyo: Boolean
      search: String
      price: Float
      minPrice: Float
      maxPrice: Float
      location: String
      report: ProductReportInput
      pagination: PaginationInput
      userLocation: LocationInput
    ): [Product!]
    product(id: ID!): Product
    businessProducts(businessId: ID!): [Product!]
    noticeboards(
      pagination: PaginationInput
      userLocation: LocationInput
      search: String
    ): [Noticeboard!]
    reviews(businessId: ID!): [Review!]
    notifications: [Notification!]
    businessImages: [BusinessImage!]
    addresses: [BusinessAddress!]
    contactUrls: [ContactUrl!]
    heatmapAnalytics: [HeatmapAnalytics!]! @auth
    sponsorships: [Sponsorship!]
    BusinessVerification(businessId: ID!): BusinessVerification @auth
    payments: [Payment!]
    contactSubmissions(noticeId: ID!): [ContactSubmission!]
    slugHistories(slug: String!, businessID: ID): [SlugHistory!]
    reports: [ProductReport!]!
    publicAds(type: AdType, limit: Int): [Ad!]!
  }

  extend type Mutation {
    registerBusinessWithDetails(input: RegisterBusinessInput!): Business!
    updateBusiness(id: ID!, input: UpdateBusinessInput!): Business! @auth

    createNotice(input: CreateNoticeInput!): Noticeboard! @auth
    updateNotice(id: ID!, input: UpdateNoticeInput!): Noticeboard! @auth
    deleteNotice(id: ID!): Boolean! @auth
    boostNotice(noticeId: ID!, days: Int!): Noticeboard! @auth
    submitNoticeLead(
      noticeId: ID!
      name: String!
      email: String!
      phone: String
      additionalData: JSON
    ): ContactSubmission!

    createProduct(input: CreateProductInput!): Product! @auth
    updateProduct(id: ID!, input: UpdateProductInput!): Product! @auth
    deleteProduct(id: ID!): Boolean! @auth
    boostProduct(productId: ID!, days: Int!): Product! @auth
    reportProduct(productId: ID!): ProductReport!

    createReview(businessId: ID!, rating: Int!): Review! @auth
    deleteReview(id: ID!): Boolean! @auth

    markNotificationRead(id: ID!): Notification! @auth
    deleteNotification(id: ID!): Boolean! @auth
    broadcastNotification(
      title: String!
      content: String!
      type: String
    ): Boolean! @auth(roles: ["ADMIN"])

    setBusinessOfTheWeek(businessId: ID!, isFeatured: Boolean!): Business!
      @auth(roles: ["ADMIN"])
  }

  input CreateNoticeInput {
    businessId: ID!
    title: String!
    content: String!
    callToAction: String
    link: String
    images: [String]
    leadFields: JSON
    boostDays: Int
  }

  input UpdateNoticeInput {
    title: String
    content: String
    callToAction: String
    link: String
    images: [String]
    leadFields: JSON
  }

  input RegisterBusinessInput {
    name: String!
    category: BusinessCategory!
    description: String
    phone: String
    isMadeInOyo: Boolean!
    addresses: [AddressInput!]!
    contactUrls: [ContactUrlInput!]!
    imageUrl: String
    galleryImages: [String]
  }

  input UpdateBusinessInput {
    name: String
    slug: String
    category: BusinessCategory
    description: String
    phone: String
    isMadeInOyo: Boolean
    addresses: [AddressInput!]
    contactUrls: [ContactUrlInput!]
    imageUrl: String
    galleryImages: [String]
  }

  input AddressInput {
    address1: String!
    address2: String
    town: Town
    city: City
    lg: Lg
  }

  input ContactUrlInput {
    url: String!
    type: ContactType!
    isPrimary: Boolean
  }

  input CreateProductInput {
    businessId: ID!
    title: String!
    description: String!
    price: Float!
    location: String!
    isMadeInOyo: Boolean
    stock: Int
    discount: Float
    deliveryOption: DeliveryOption!
    category: ProductCategory!
    contactPreference: ContactType!
    images: [String]
  }

  input UpdateProductInput {
    title: String
    description: String
    price: Float
    location: String
    isMadeInOyo: Boolean
    stock: Int
    discount: Float
    deliveryOption: DeliveryOption
    category: ProductCategory
    contactPreference: ContactType
    isActive: Boolean
    images: [String]
  }
`;

export default businessTypeDefs;
