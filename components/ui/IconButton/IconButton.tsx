import Ripple, { RippleProps } from "react-native-material-ripple";

export default function IconButton(
  props: Omit<RippleProps, "rippleContainerBorderRadius" | "style"> & {
    icon: React.ReactNode;
  }
) {
  return (
    <Ripple
      style={{
        borderRadius: 100,
        padding: 5,
      }}
      {...props}
    >
      {props.icon}
    </Ripple>
  );
}
