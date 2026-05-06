import { gql } from "@apollo/client";

export const UPLOAD_IMAGE = gql`
  mutation UploadImage($file: Upload!) {
    uploadImage(file: $file)
  }
`;

export const REGISTER_BUSINESS_WITH_DETAILS = gql`
  mutation RegisterBusinessWithDetails($input: RegisterBusinessInput!) {
    registerBusinessWithDetails(input: $input) {
      id
      name
      description
      category
      phone
      isMadeInOyo
      slug
      addresses {
        id
        address1
        address2
        town
        city
        lg
      }
      contactUrls {
        id
        url
        type
        isPrimary
      }
      images {
        id
        imageUrl
        isLogo
        uploadedAt
      }
    }
  }
`;

// Create Notice
export const CREATE_NOTICE = gql`
  mutation CreateNotice(
    $businessId: ID!
    $title: String!
    $content: String!
    $startDate: String
    $endDate: String
    $callToAction: String
    $link: String
    $locationBoundary: String
  ) {
    createNotice(
      businessId: $businessId
      title: $title
      content: $content
      startDate: $startDate
      endDate: $endDate
      callToAction: $callToAction
      link: $link
      locationBoundary: $locationBoundary
    ) {
      id
      title
      content
      startDate
      endDate
      likes
      shares
      callToAction
      link
      boosted
      locationBoundary
      createdAt
      business {
        id
        name
      }
    }
  }
`;

export const GET_HEATMAP_ANALYTICS = gql`
  query GetHeatmapAnalytics($userId: ID!) {
    heatmapAnalytics(userId: $userId) {
      id
      pageViews
      likes
      urlClicks
      downloads
      createdAt
    }
  }
`;

export const GET_BUSINESS_ANALYTICS = gql`
  query GetBusinessAnalytics($businessId: ID!) {
    heatmapAnalytics(businessId: $businessId) {
      id
      pageViews
      likes
      urlClicks
      downloads
      createdAt
    }
  }
`;

export const GET_BUSINESSES_PAGINATED = gql`
  query GetBusinessesPaginated($pagination: PaginationInput, $userLocation: LocationInput, $search: String, $category: BusinessCategory) {
    businessesPaginated(pagination: $pagination, userLocation: $userLocation, search: $search, category: $category) {
      id
      name
      description
      category
      slug
      phone
      isVerified
      images {
        id
        imageUrl
        isLogo
      }
      addresses {
        id
        address1
        address2
        town
        city
        lg
      }
      contactUrls {
        id
        url
        type
        isPrimary
      }
      reviews {
        id
        rating
      }
      user {
        id
      }
    }
  }
`;

export const GET_BUSINESS_STATS = gql`
  query GetBusinessStats($businessId: ID) {
    businessAnalytics(businessId: $businessId) {
      totalViews
      totalClicks
      totalLeads
      totalShares
      viewsOverTime {
        date
        count
      }
      leadsOverTime {
        date
        count
      }
      sharesOverTime {
        date
        count
      }
    }
  }
`;

export const TRACK_ACTIVITY = gql`
  mutation TrackActivity($input: TrackActivityInput!) {
    trackActivity(input: $input)
  }
`;

export const GET_BUSINESS_BY_SLUG = gql`
  query GetBusinessBySlug($slug: String!) {
    businessBySlug(slug: $slug) {
      id
      name
      description
      category
      phone
      isMadeInOyo
      slug
      isVerified
      shares
      user {
        id
      }
      addresses {
        id
        address1
        address2
        town
        city
        lg
      }
      contactUrls {
        id
        url
        type
        isPrimary
      }
      images {
        id
        imageUrl
        isLogo
        uploadedAt
      }
      reviews {
        id
        rating
        userId
        user {
          id
          firstName
          lastName
        }
      }
      videos {
        id
        videoUrl
        views
        likes
      }
      notices {
        id
        title
        content
        likes
        shares
        views
        createdAt
      }
    }
  }
`;

export const GET_BUSINESS_SHARES = gql`
  query GetBusinessShares($slug: String!) {
    businessBySlug(slug: $slug) {
      id
      shares
    }
  }
`;

export const ANALYZE_SEARCH_QUERY = gql`
  query AnalyzeSearchQuery($prompt: String!) {
    analyzeSearchQuery(prompt: $prompt) {
      keywords
      category
      town
      city
      lg
    }
  }
`;
