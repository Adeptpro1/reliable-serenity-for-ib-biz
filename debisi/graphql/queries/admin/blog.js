import { gql } from "@apollo/client";

export const GET_BLOGS = gql`
  query {
    blogPosts {
      id
      title
      content
      mediaUrls
      likes
      shares
      createdAt
    }
  }
`;

export const CREATE_BLOG = gql`
  mutation CreateBlog($title: String!, $content: String!, $mediaUrls: String!) {
    createBlogPost(title: $title, content: $content, mediaUrls: $mediaUrls) {
      id
      title
      content
      mediaUrls
    }
  }
`;

