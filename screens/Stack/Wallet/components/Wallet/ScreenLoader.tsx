import Skeleton from "@/components/SkeletonLoader/Skeleton";
import Colors from "@/constants/Colors";
import Color from "color";
import { View } from "react-native";

export default function ScreenLoader() {
  return (
    <Skeleton
      backgroundColor={Color(Colors.primary_lighter).lighten(0.5).string()}
      highlightColor={Colors.secondary}
      size={(props) => ({
        width: props.width - 20,
        height: props.height,
      })}
    >
      <View>
        <Skeleton.Item width={(w) => w / 3} height={25} />
        <Skeleton.Item width={(w) => w - 30} height={55} />
        <Skeleton.Item width={(w) => w - 30} height={55} />
        <Skeleton.Item width={(w) => w - 30} height={55} />
        <Skeleton.Item width={(w) => w / 3} height={25} marginTop={30} />
        <Skeleton.Item width={(w) => w - 30} height={55} />
        <Skeleton.Item width={(w) => w - 30} height={55} />
        <Skeleton.Item width={(w) => w / 3} height={25} marginTop={30} />
        <Skeleton.Item width={(w) => w - 30} height={55} />
        <Skeleton.Item width={(w) => w - 30} height={55} />
      </View>
    </Skeleton>
  );
}
