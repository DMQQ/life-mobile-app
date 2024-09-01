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
      id
      balance
      expenses(skip: 0, take: 3) {
        category
        id
        amount
        description
      }
    }

    weeklySpendings: getStatistics(type: "week") {
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
