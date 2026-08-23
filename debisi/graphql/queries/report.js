import { gql } from "@apollo/client";

export const EXPORT_LEADS_CSV = gql`
  query ExportLeadsCSV($noticeId: ID!) {
    exportLeadsCSV(noticeId: $noticeId)
  }
`;
