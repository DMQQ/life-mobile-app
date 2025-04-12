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
      expenses(skip: 0, take: 3) {
        category
        id
        amount
        description
        type

        subscription {
          id
          isActive
          nextBillingDate
          dateStart
        }

        files {
          id
          url
        }

        subexpenses {
          id
          description
          amount
          category
        }
      }
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
