import { gql } from "@apollo/client";

export const UPLOAD_IMAGE = gql`
  mutation UploadImage($file: Upload!) {
    uploadImage(file: $file)
  }
`;

export const UPLOAD_VIDEO = gql`
  mutation UploadVideo($file: Upload!) {
    uploadVideo(file: $file)
  }
`;
export const DELETE_IMAGE = gql`
  mutation DeleteImage($url: String!) {
    deleteImage(url: $url)
  }
`;
