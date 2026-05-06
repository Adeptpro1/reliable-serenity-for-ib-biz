// import { gql } from '@apollo/client';

// export const CREATE_REVIEW = gql`
//   mutation CreateReview($input: CreateReviewInput!) {
//     createReview(input: $input) {
//       id
//       rating
//       comment
//       business {
//         id
//         name
//       }
//       user {
//         id
//         firstName
//         lastName
//       }
//     }
//   }
// `;

// export const GET_BUSINESS_REVIEWS = gql`
//   query GetBusinessReviews($businessId: ID!) {
//     businessReviews(businessId: $businessId) {
//       id
//       rating
//       comment
//       createdAt
//       user {
//         id
//         firstName
//         lastName
//       }
//     }
//   }
// `;
