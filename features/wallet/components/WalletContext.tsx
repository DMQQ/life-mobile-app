import { Wallet } from "@/types";
import BottomSheet from "@gorhom/bottom-sheet";
import { createContext, useContext, useMemo, useReducer, useRef, useState } from "react";

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
  | { type: "SET_SKIP"; payload?: number }
  | { type: "RESET" }
  | { type: "SET_IS_EXACT_CATEGORY"; payload: boolean };

const reducer = (state: typeof init, action: Action) => {
  if (action.type === "SET_QUERY") {
    console.log("SET_QUERY", action.payload);
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

  if (action.type === "RESET") {
    return init;
  }

  if (action.type === "SET_IS_EXACT_CATEGORY") {
    return {
      ...state,
      isExactCategory: action.payload,
    };
  }

  return state;
};

const PAGINATION_TAKE = 20;

export const init = {
  query: "",
  amount: {
    min: 0,
    max: 999999999,
  },
  date: {
    from: "",
    to: "",
  },

  category: [] as string[],

  type: undefined as string | undefined,

  skip: 0,

  take: PAGINATION_TAKE,

  isExactCategory: false,
};

type WalletContextType = {
  wallet: Wallet;
  refs: {
    bottomSheetRef: React.MutableRefObject<BottomSheet | null>;
    filtersRef: React.MutableRefObject<BottomSheet | null>;
  };

  calendar: {
    date: Date;
    setCalendarDate: (date: Date) => void;
  };

  filters: Filters;

  dispatch: React.Dispatch<Action>;
};

const WalletContext = createContext<WalletContextType>({
  wallet: {} as Wallet,
  refs: {
    bottomSheetRef: { current: null },
    filtersRef: { current: null },
  },

  calendar: {
    date: new Date(),
    setCalendarDate: () => {},
  },

  filters: init,

  dispatch: () => {},
});

export const useWalletContext = () => useContext(WalletContext);

export default function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [wallet, setWallet] = useState<Wallet>({} as Wallet);

  const [filters, dispatch] = useReducer(reducer, init);

  // Sheets
  const bottomSheetRef = useRef<BottomSheet | null>(null);
  const filtersRef = useRef<BottomSheet | null>(null);

  const memoizedValue = {
    wallet,
    calendar: {
      date: selectedCalendarDate,
      setCalendarDate: setSelectedCalendarDate,
    },

    refs: { bottomSheetRef, filtersRef },

    filters,
    dispatch,
  } as WalletContextType;

  return <WalletContext.Provider value={memoizedValue}>{children}</WalletContext.Provider>;
}
