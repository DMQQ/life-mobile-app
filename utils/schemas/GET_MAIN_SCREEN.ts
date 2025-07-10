import { gql } from "@apollo/client";
import moment from "moment";

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

export const getMainScreenBaseVariables = () => {
  return {
    range: [moment().startOf("month").format("YYYY-MM-DD"), moment().endOf("month").format("YYYY-MM-DD")],
    lastRange: [
      moment().subtract(1, "month").startOf("month").format("YYYY-MM-DD"),
      moment().subtract(1, "month").endOf("month").format("YYYY-MM-DD"),
    ],
  };
};
