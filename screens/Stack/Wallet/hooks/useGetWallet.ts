import { Expense, Wallet } from "@/types";
import useOffline from "@/utils/hooks/useOffline";
import { gql, useQuery } from "@apollo/client";
import { useEffect, useMemo, useReducer, useState } from "react";

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
      }
    }
  }
`;

const PAGINATION_TAKE = 10;

export const init = {
  query: "",
  amount: {
    min: 0,
    max: 99999,
  },
  date: {
    from: "",
    to: "",
  },

  category: [] as string[],

  type: undefined as string | undefined,

  skip: 0,

  take: PAGINATION_TAKE,
};

export type Filters = typeof init;

export type Action =
  | { type: "SET_QUERY"; payload: string }
  | { type: "SET_AMOUNT_MIN"; payload: number }
  | { type: "SET_AMOUNT_MAX"; payload: number }
  | { type: "SET_DATE_MIN"; payload: string }
  | { type: "SET_DATE_MAX"; payload: string }
  | { type: "SET_CATEGORY"; payload: string[] }
  | { type: "SET_TYPE"; payload: string | undefined }
  | { type: "TOGGLE_CATEGORY"; payload: string }
  | { type: "SET_SKIP"; payload?: number };

const reducer = (state: typeof init, action: Action) => {
  if (action.type === "SET_QUERY") {
    return { ...state, query: action.payload };
  }
  if (action.type === "SET_AMOUNT_MIN") {
    return {
      ...state,
      amount: {
        ...state.amount,
        min: action.payload,
      },
    };
  }
  if (action.type === "SET_AMOUNT_MAX") {
    return {
      ...state,
      amount: {
        ...state.amount,
        max: action.payload,
      },
    };
  }

  if (action.type === "SET_DATE_MIN") {
    return {
      ...state,
      date: {
        ...state.date,
        from: action.payload,
      },
    };
  }
  if (action.type === "SET_DATE_MAX") {
    return {
      ...state,
      date: {
        ...state.date,
        to: action.payload,
      },
    };
  }
  if (action.type === "SET_CATEGORY") {
    return {
      ...state,
      category: action.payload,
    };
  }
  if (action.type === "TOGGLE_CATEGORY") {
    const index = state.category.indexOf(action.payload);
    if (index === -1) {
      return {
        ...state,
        category: [...state.category, action.payload],
      };
    } else if (index > -1) {
      return {
        ...state,
        category: state.category.filter((c) => c !== action.payload),
      };
    }
  }
  if (action.type === "SET_TYPE") {
    return {
      ...state,
      type: action.payload,
    };
  }

  if (action.type === "SET_SKIP") {
    return {
      ...state,
      skip: state.take + (action.payload || state.skip),
    };
  }

  return state;
};

export default function useGetWallet(options?: { fetchAll: boolean }) {
  const [filters, dispatch] = useReducer(reducer, init);

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

    onCompleted(data) {
      offline.save("WalletScreen", data);
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

        offline.save("WalletScreen", finalData.wallet);

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

  const filtersActive = useMemo(() => JSON.stringify(filters) !== JSON.stringify(init), [filters]);

  const data = (offline.isOffline ? offline.data || {} : st.data) as { wallet: Wallet };

  return { ...st, data: data, filters, dispatch, onEndReached, endReached, filtersActive };
}
