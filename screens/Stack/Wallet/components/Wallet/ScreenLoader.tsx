import Skeleton from "@/components/SkeletonLoader/Skeleton";
import Colors from "@/constants/Colors";
import Color from "color";
import { View } from "react-native";

export default function ScreenLoader() {
  return (
    <Skeleton
      size={(props) => ({
        width: props.width - 10,
        height: props.height,
      })}
    >
      <View style={{ padding: 10 }}>
        <View style={{ flexDirection: "row", gap: 5, justifyContent: "flex-end" }}>
          <Skeleton.Item width={25} height={25} />
          <Skeleton.Item width={25} height={25} />
        </View>

        <View style={{ height: 200, justifyContent: "center", alignItems: "center" }}>
          <Skeleton.Item width={(w) => w / 1.5} height={50} />
        </View>

        <Skeleton.Item width={(w) => w / 3} height={25} />
        <Skeleton.Item width={(w) => w - 20} height={55} />
        <Skeleton.Item width={(w) => w - 20} height={55} />
        <Skeleton.Item width={(w) => w - 20} height={55} />
        <Skeleton.Item width={(w) => w / 3} height={25} marginTop={30} />
        <Skeleton.Item width={(w) => w - 20} height={55} />
        <Skeleton.Item width={(w) => w - 20} height={55} />
        <Skeleton.Item width={(w) => w / 3} height={25} marginTop={30} />
        <Skeleton.Item width={(w) => w - 20} height={55} />
        <Skeleton.Item width={(w) => w - 20} height={55} />
      </View>
    </Skeleton>
  );
}
