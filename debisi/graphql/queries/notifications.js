import { gql } from "@apollo/client";

export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications {
    notifications {
      id
      title
      content
      isRead
      clicks
      createdAt
    }
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      isRead
    }
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;
