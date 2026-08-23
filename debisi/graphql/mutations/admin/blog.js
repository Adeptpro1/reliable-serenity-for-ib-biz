import { gql } from "@apollo/client";

export const UPDATE_BLOG = gql`
  mutation UpdateBlog($id: ID!, $title: String, $content: String, $mediaUrls: String!) {
    updateBlogPost(id: $id, title: $title, content: $content, mediaUrls: $mediaUrls) {
      id
      title
      content
      mediaUrls
    }
  }
`;

export const DELETE_BLOG = gql`
  mutation DeleteBlog($id: ID!) {
    deleteBlogPost(id: $id)
  }
`;
