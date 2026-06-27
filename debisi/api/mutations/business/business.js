import { gql } from "@apollo/client";

export const UPDATE_BUSINESS = gql`
  mutation UpdateBusiness($id: ID!, $input: UpdateBusinessInput!) {
    updateBusiness(id: $id, input: $input) {
      id
      name
      description
      phone
      isMadeInOyo
      category
      slug
      followLeadFields
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

export const DELETE_BUSINESS = gql`
  mutation DeleteBusiness($id: ID!) {
    deleteBusiness(id: $id)
  }
`;

// Update Notice
export const UPDATE_NOTICE = gql`
  mutation UpdateNotice(
    $id: ID!
    $title: String
    $content: String
    $startDate: String
    $endDate: String
    $callToAction: String
    $link: String
    $boosted: Boolean
    $locationBoundary: String
  ) {
    updateNotice(
      id: $id
      title: $title
      content: $content
      startDate: $startDate
      endDate: $endDate
      callToAction: $callToAction
      link: $link
      boosted: $boosted
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

// Delete Notice
export const DELETE_NOTICE = gql`
  mutation DeleteNotice($id: ID!) {
    deleteNotice(id: $id) {
      id
      title
      business {
        id
        name
      }
    }
  }
`;

export const SUBMIT_BUSINESS_VERIFICATION = gql`
  mutation SubmitBusinessVerification($input: SubmitVerificationInput!) {
    submitBusinessVerification(input: $input) {
      id
      businessId
      status
      submittedAt
      natureOfBusiness
      currentAddress
      bankName
      accountNumber
      accountName
      accountType
      cacCertificateUrl
      memoOfAssociationUrl
      letterheadUrl
      chequeUrl
      paymentAmount
      registrationNumber
      tinNumber
    }
  }
`;

export const UPLOAD_VERIFICATION_DOCUMENT = gql`
  mutation UploadVerificationDocument($file: Upload!, $type: String!) {
    uploadVerificationDocument(file: $file, type: $type) {
      url
      filename
    }
  }
`;

export const GET_BUSINESS_VERIFICATION_STATUS = gql`
  query GetBusinessVerificationStatus($businessId: Int!) {
    getBusinessVerificationStatus(businessId: $businessId) {
      id
      businessId
      status
      submittedAt
      reviewedAt
      reviewerNotes
      natureOfBusiness
      currentAddress
      bankName
      accountNumber
      accountName
      accountType
      cacCertificateUrl
      memoOfAssociationUrl
      letterheadUrl
      chequeUrl
      paymentAmount
      paymentStatus
    }
  }
`;
