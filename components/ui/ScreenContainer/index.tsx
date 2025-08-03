import { ScrollView, StyleProp, View, ViewStyle } from "react-native";
import Colors from "../../../constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;

  scroll?: boolean;

  centered?: boolean;
}

export default function ScreenContainer({ children, style, scroll = false, centered = false }: ScreenContainerProps) {
  const Component = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Component
        keyboardDismissMode="on-drag"
        contentContainerStyle={[
          centered &&
            scroll && {
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            },
        ]}
        scrollEnabled={scroll}
        style={[
          {
            flex: 1,
            padding: 15,
            backgroundColor: Colors.primary,
          },

          centered &&
            !scroll && {
              justifyContent: "center",
              alignItems: "center",
            },

          style,
        ]}
      >
        {children}
      </Component>
    </SafeAreaView>
  );
}
