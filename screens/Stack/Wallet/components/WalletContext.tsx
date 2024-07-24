import { Wallet } from "@/types";
import BottomSheet from "@gorhom/bottom-sheet";
import { createContext, useContext, useMemo, useRef, useState } from "react";

type WalletContextType = {
  wallet: Wallet;
  refs: {
    bottomSheetRef: React.MutableRefObject<BottomSheet | null>;
    filtersRef: React.MutableRefObject<BottomSheet | null>;
    editBalanceRef: React.MutableRefObject<BottomSheet | null>;
  };

  calendar: {
    date: Date;
    setCalendarDate: (date: Date) => void;
  };
};

const WalletContext = createContext<WalletContextType>({
  wallet: {} as Wallet,
  refs: {
    bottomSheetRef: { current: null },
    filtersRef: { current: null },
    editBalanceRef: { current: null },
  },

  calendar: {
    date: new Date(),
    setCalendarDate: () => {},
  },
});

export const useWalletContext = () => useContext(WalletContext);

export default function WalletContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [wallet, setWallet] = useState<Wallet>({} as Wallet);

  // Sheets
  const bottomSheetRef = useRef<BottomSheet | null>(null);
  const filtersRef = useRef<BottomSheet | null>(null);
  const editBalanceRef = useRef<BottomSheet | null>(null);

  const memoizedValue = useMemo(
    () =>
      ({
        wallet,
        calendar: {
          date: selectedCalendarDate,
          setCalendarDate: setSelectedCalendarDate,
        },

        refs: { bottomSheetRef, filtersRef, editBalanceRef },
      } as WalletContextType),
    [selectedCalendarDate, wallet]
  );

  return (
    <WalletContext.Provider value={memoizedValue}>
      {children}
    </WalletContext.Provider>
  );
}
