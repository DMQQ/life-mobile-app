import { createContext, ReactNode, useContext, useState, useEffect, useCallback } from "react";

type RefreshItem = (...args: any[]) => Promise<any>;

const RefreshContext = createContext({
  registerRefresh: (id: symbol, item: RefreshItem) => {},
  unregisterRefresh: (id: symbol) => {},
  refresh: () => {},
  refreshing: false,
});

export function useRefreshContext() {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error("useRefreshContext must be used within a RefreshContextProvider");
  }
  return context;
}

export function useRefresh(refreshFns: RefreshItem[] | RefreshItem, deps?: unknown[]) {
  const { registerRefresh, unregisterRefresh, ...context } = useRefreshContext();

  useEffect(() => {
    let ids: symbol[] = [];
    if (Array.isArray(refreshFns)) {
      refreshFns.forEach((fn) => {
        const id = Symbol();
        registerRefresh(id, fn);
        ids.push(id);
      });
    } else {
      const id = Symbol();
      registerRefresh(id, refreshFns);
      ids.push(id);
    }
    return () => ids.forEach((id) => unregisterRefresh(id));
  }, deps);

  return context;
}

export default function RefreshContextProvider({ children }: { children: ReactNode }) {
  const [refreshMap, setRefreshMap] = useState<Map<symbol, RefreshItem>>(new Map());
  const [refreshing, setRefreshing] = useState(false);

  const registerRefresh = useCallback((id: symbol, item: RefreshItem) => {
    setRefreshMap((prev) => new Map(prev).set(id, item));
  }, []);

  const unregisterRefresh = useCallback((id: symbol) => {
    setRefreshMap((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    console.log("Refreshing items:", Array.from(refreshMap.keys()));
    await Promise.allSettled(Array.from(refreshMap.values()).map((item) => item()));
    setRefreshing(false);
  };

  return (
    <RefreshContext.Provider
      value={{
        registerRefresh,
        unregisterRefresh,
        refresh,
        refreshing,
      }}
    >
      {children}
    </RefreshContext.Provider>
  );
}
