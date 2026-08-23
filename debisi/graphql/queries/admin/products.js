import { gql } from "@apollo/client";

export const GET_ADMIN_PRODUCTS = gql`
  query GetAdminProducts($pagination: PaginationInput, $isActive: Boolean, $isFlagged: Boolean) {
    adminAllProducts(pagination: $pagination, isActive: $isActive, isFlagged: $isFlagged) {
      id
      title
      description
      price
      stock
      category
      isActive
      isBoosted
      createdAt
      images {
        id
        imageUrl
      }
      business {
        id
        name
      }
      reports {
        id
        createdAt
        user {
          id
          firstName
          lastName
          email
        }
      }
    }
  }
`;

export const ADMIN_TOGGLE_PRODUCT_STATUS = gql`
  mutation AdminToggleProductStatus($id: ID!, $isActive: Boolean!) {
    adminToggleProductStatus(id: $id, isActive: $isActive) {
      id
      isActive
    }
  }
`;

export const ADMIN_DELETE_PRODUCT = gql`
  mutation AdminDeleteProduct($id: ID!) {
    adminDeleteProduct(id: $id)
  }
`;
