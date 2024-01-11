import { gql } from "@apollo/client";

export const REFETCH_BALANCE_QUERY = gql`
  query Balance {
    wallet {
      id
      balance
    }
  }
`;
