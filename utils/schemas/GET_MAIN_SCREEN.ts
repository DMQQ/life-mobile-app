import { gql } from "@apollo/client";

export const GET_MAIN_SCREEN = gql`
  query GetRootView($range: [String!]!, $lastRange: [String!]!) {
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
      income
      monthlyPercentageTarget
    }

    monthlySpendings: getStatistics(range: $range) {
      ...Stats
    }

    lastMonthSpendings: getStatistics(range: $lastRange) {
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
