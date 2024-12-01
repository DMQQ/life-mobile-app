import { Expense, Wallet } from "@/types";
import useOffline from "@/utils/hooks/useOffline";
import { gql, useQuery } from "@apollo/client";
import { useContext, useEffect, useMemo, useReducer, useState } from "react";
import { init, useWalletContext } from "../components/WalletContext";

export const GET_WALLET = gql`
  query GetWallet($filters: GetWalletFilters, $skip: Int, $take: Int) {
    wallet {
      id
      balance
      expenses(filters: $filters, take: $take, skip: $skip) {
        id
        amount
        date
        description
        type
        category
        balanceBeforeInteraction
        note
      }
    }
  }
`;

const PAGINATION_TAKE = 10;

export default function useGetWallet(options?: { fetchAll: boolean }) {
  const { filters, dispatch } = useWalletContext();

  const [skip, setSkip] = useState(PAGINATION_TAKE);
  const [endReached, setEndReached] = useState(false);

  const offline = useOffline<Wallet>("WalletScreen");

  const st = useQuery(GET_WALLET, {
    variables: {
      filters: {
        title: filters.query,
        amount: {
          from: filters.amount.min,
          to: filters.amount.max,
        },
        date: {
          from: filters.date.from,
          to: filters.date.to,
        },
        category: filters.category,
        ...(filters.type && { type: filters.type }),
      },
      take: options?.fetchAll ? 99999 : PAGINATION_TAKE,
    },
    onError: (err) => {
      console.log(JSON.stringify(err, null, 2));
    },
  });

  const onEndReached = async () => {
    if (st.loading || endReached) return;

    setSkip((p) => p + PAGINATION_TAKE);

    await st.fetchMore({
      variables: {
        ...(options?.fetchAll ? { take: 99999, skip: 0 } : { skip: skip + PAGINATION_TAKE, take: PAGINATION_TAKE }),
        filters: {
          title: filters.query,
          amount: {
            from: filters.amount.min,
            to: filters.amount.max,
          },
          date: {
            from: filters.date.from,
            to: filters.date.to,
          },
          category: filters.category,
          ...(filters.type && { type: filters.type }),
        },
      },
      updateQuery(previousQueryResult, { fetchMoreResult }) {
        if (!fetchMoreResult) {
          setEndReached(true);
          return previousQueryResult;
        }

        const mergeExpenses = (previousExpenses: Expense[], newExpenses: Expense[]): Expense[] =>
          Array.from(new Map([...previousExpenses, ...newExpenses].map((exp) => [exp.id, exp])).values());

        const finalData = {
          wallet: {
            ...previousQueryResult.wallet,
            expenses: mergeExpenses(previousQueryResult.wallet.expenses, fetchMoreResult.wallet.expenses),
          },
        };

        return finalData;
      },
    });
  };

  useEffect(() => {
    let timeout = setTimeout(async () => {
      !options?.fetchAll && setSkip(0);
      await st.refetch({
        ...(options?.fetchAll ? { take: 99999, skip: 0 } : { skip: 0, take: PAGINATION_TAKE }),
        filters: {
          title: filters.query,
          amount: {
            from: filters.amount.min,
            to: filters.amount.max,
          },
          date: {
            from: filters.date.from,
            to: filters.date.to,
          },
          category: filters.category,
          ...(filters.type && { type: filters.type }),
        },
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [filters]);

  useEffect(() => {
    if (!offline.isOffline) offline.save("WalletScreen", st.data);
  }, []);

  const filtersActive = useMemo(() => JSON.stringify(filters) !== JSON.stringify(init), [filters]);

  const data = (offline.isOffline ? offline.data || {} : st.data) as { wallet: Wallet };

  return { ...st, data: data, filters, dispatch, onEndReached, endReached, filtersActive };
}
