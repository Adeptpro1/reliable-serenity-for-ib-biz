import { gql } from "@apollo/client";

export const GET_ADMIN_AUDIT_LOGS = gql`
  query GetAdminAuditLogs {
    adminAuditLogs {
      id
      action
      performedBy
      targetId
      targetName
      details
      createdAt
    }
  }
`;
