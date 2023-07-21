import { createContext, useState, useContext } from "react";
import Colors from "../../constants/Colors";

const ThemeContext = createContext({
  theme: {} as Theme,
});

export interface Theme {
  name: "light" | "dark";
  colors: typeof Colors;
}

const themes: Theme[] = [
  { name: "light", colors: Colors },
  { name: "dark", colors: Colors },
];

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>(themes[1]);
  return (
    <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
  );
}
