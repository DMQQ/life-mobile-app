import Color from "color";
import Skeleton from "../../../../components/SkeletonLoader/Skeleton";
import Colors from "../../../../constants/Colors";
import { View } from "react-native";

export default function LoaderSkeleton() {
  return (
    <Skeleton
      backgroundColor={Color(Colors.primary_lighter).lighten(0.5).string()}
      highlightColor={Colors.secondary}
      size={({ width, height }) => ({
        width: width,
        height: height - 150,
      })}
    >
      <View>
        <Skeleton.Item height={45} width={(w) => w - 20} />

        <Skeleton.Item height={25} width={(w) => w - 20} marginTop={20} />
        <Skeleton.Item height={30} width={(w) => w - 20} />
        <Skeleton.Item height={30} width={(w) => w - 20} />
        <Skeleton.Item height={30} width={(w) => w - 20} />
        <Skeleton.Item height={30} width={(w) => w - 20} />

        <Skeleton.Item height={30} width={(w) => w / 3} marginTop={20} />

        <Skeleton.Item height={30} width={(w) => w - 20} />
        <Skeleton.Item height={30} width={(w) => w - 20} />
        <Skeleton.Item height={30} width={(w) => w - 20} />
        <Skeleton.Item height={30} width={(w) => w - 20} />

        <Skeleton.Item height={30} width={(w) => w / 2} marginTop={25} />

        <View style={{ flexDirection: "row", marginTop: 5 }}>
          <Skeleton.Item width={185} height={120} marginRight={10} />
          <Skeleton.Item width={185} height={120} marginRight={10} />
        </View>
      </View>
    </Skeleton>
  );
}

export const TimelineScreenLoader = (props: { loading: boolean }) =>
  props.loading ? (
    <View style={{ padding: 10 }}>
      <Skeleton
        backgroundColor={Color(Colors.primary_lighter).lighten(0.5).string()}
        highlightColor={Colors.secondary}
        size={({ width }) => ({
          width: width - 40,
          height: ((65 + 10) * 3 + 40) * 2 + 30,
        })}
      >
        <View>
          <Skeleton.Item width={(w) => w / 2} height={30} />
          <Skeleton.Item width={(w) => w - 40} height={65} />
          <Skeleton.Item width={(w) => w - 40} height={65} />
          <Skeleton.Item width={(w) => w - 40} height={65} />

          <Skeleton.Item marginTop={30} width={(w) => w / 2} height={30} />
          <Skeleton.Item width={(w) => w - 40} height={65} />
          <Skeleton.Item width={(w) => w - 40} height={65} />
          <Skeleton.Item width={(w) => w - 40} height={65} />
        </View>
      </Skeleton>
    </View>
  ) : null;
