import { gql, useQuery } from "@apollo/client";
import { useEffect, useReducer } from "react";

export const GET_WALLET = gql`
  query GetWallet($filters: GetWalletFilters) {
    wallet(filters: $filters) {
      id
      balance
      expenses {
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

const init = {
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
  | { type: "TOGGLE_CATEGORY"; payload: string };

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

  return state;
};

export default function useGetWallet() {
  const [filters, dispatch] = useReducer(reducer, init);

  const st = useQuery(GET_WALLET, {
    onError: (er) => console.log(JSON.stringify(er, null, 2)),
  });

  useEffect(() => {
    let timeout = setTimeout(async () => {
      await st.refetch({
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

    console.log("filters", filters);

    return () => clearTimeout(timeout);
  }, [filters]);

  return { ...st, filters, dispatch };
}
