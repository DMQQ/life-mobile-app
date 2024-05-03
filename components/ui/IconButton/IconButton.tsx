import Ripple, { RippleProps } from "react-native-material-ripple";

export default function IconButton(
  props: RippleProps & {
    icon: React.ReactNode;
  }
) {
  return (
    <Ripple
      {...props}
      style={[
        {
          borderRadius: 100,
          padding: 5,
          justifyContent: "center",
          alignItems: "center",
        },
        props.style,
      ]}
    >
      {props.icon}
    </Ripple>
  );
}
