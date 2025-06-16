import { BlurView } from "expo-blur";
import { StyleProp, View, ViewProps, ViewStyle } from "react-native";

interface BlurSurfaceProps extends ViewProps {
  children?: React.ReactNode;

  style?: StyleProp<ViewStyle>;
}

export default function BlurSurface({ children, style, ...rest }: BlurSurfaceProps) {
  return (
    <BlurView intensity={80} tint="dark">
      <View {...rest} style={[style]}>
        {children}
      </View>
    </BlurView>
  );
}
