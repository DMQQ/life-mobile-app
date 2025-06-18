import { gql } from "@apollo/client";

export const GET_MAIN_SCREEN = gql`
  query GetRootView($range: [String!]!) {
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
      id
      balance
    }

    weeklySpendings: getStatistics(range: $range) {
      ...Stats
    }
  }

  fragment Stats on WalletStatisticsRange {
    total
    average
    max
    min
    count
    theMostCommonCategory
    theLeastCommonCategory
    lastBalance
    income
    expense
  }
`;
