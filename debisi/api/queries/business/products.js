import { gql } from "@apollo/client";

// Queries
export const GET_PRODUCTS = gql`
  query GetProducts(
    $category: ProductCategory
    $isMadeInOyo: Boolean
    $search: String
    $minPrice: Float
    $maxPrice: Float
    $location: String
  ) {
    products(
      category: $category
      isMadeInOyo: $isMadeInOyo
      search: $search
      minPrice: $minPrice
      maxPrice: $maxPrice
      location: $location
    ) {
      id
      title
      description
      price
      location
      isMadeInOyo
      stock
      discount
      deliveryOption
      category
      contactPreference
      isBoosted
      isActive
      createdAt
      updatedAt
      business {
        id
        name
        phone
        contactUrls {
          id
          url
          type
          isPrimary
        }
      }
      images {
        id
        imageUrl
        isPrimary
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      title
      description
      price
      location
      isMadeInOyo
      stock
      discount
      deliveryOption
      category
      contactPreference
      isBoosted
      isActive
      createdAt
      updatedAt
      business {
        id
        name
        description
        phone
        isMadeInOyo
        contactUrls {
          id
          url
          type
          isPrimary
        }
        addresses {
          id
          address1
          address2
          town
          city
          lg
        }
      }
      images {
        id
        imageUrl
        isPrimary
      }
    }
  }
`;

export const GET_BUSINESS_PRODUCTS = gql`
  query GetBusinessProducts($businessId: ID!) {
    businessProducts(businessId: $businessId) {
      id
      title
      description
      price
      location
      isMadeInOyo
      stock
      discount
      deliveryOption
      category
      contactPreference
      isBoosted
      isActive
      createdAt
      updatedAt
      images {
        id
        imageUrl
        isPrimary
      }
    }
  }
`;

// Mutations
export const CREATE_PRODUCT = gql`
  mutation CreateProduct($businessId: ID!, $input: ProductInput!) {
    createProduct(businessId: $businessId, input: $input) {
      id
      title
      description
      price
      location
      isMadeInOyo
      stock
      discount
      deliveryOption
      category
      contactPreference
      isBoosted
      isActive
      createdAt
      updatedAt
      business {
        id
        name
      }
      images {
        id
        imageUrl
        isPrimary
      }
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      title
      description
      price
      location
      isMadeInOyo
      stock
      discount
      deliveryOption
      category
      contactPreference
      isBoosted
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export const TOGGLE_PRODUCT_BOOST = gql`
  mutation ToggleProductBoost($id: ID!) {
    toggleProductBoost(id: $id) {
      id
      isBoosted
    }
  }
`;

export const UPLOAD_PRODUCT_IMAGE = gql`
  mutation UploadProductImage($productId: ID!, $file: Upload!) {
    uploadProductImage(productId: $productId, file: $file) {
      id
      imageUrl
      isPrimary
      product {
        id
        title
      }
    }
  }
`;

export const DELETE_PRODUCT_IMAGE = gql`
  mutation DeleteProductImage($id: ID!) {
    deleteProductImage(id: $id)
  }
`;