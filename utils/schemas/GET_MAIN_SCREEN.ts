import { gql } from "@apollo/client";

export const GET_MAIN_SCREEN = gql`
  query GetRootView {
    timelineByCurrentDate {
      id
      title
      description
      date
      beginTime
      endTime
      isCompleted
    }
    wallet {
      balance
      expenses {
        category
        id
        amount
        description
      }
    }
  }
`;
