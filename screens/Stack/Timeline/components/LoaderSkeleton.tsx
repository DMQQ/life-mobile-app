import Skeleton from "../../../../components/SkeletonLoader/Skeleton";
import Colors from "../../../../constants/Colors";
import { View } from "react-native";

export default function LoaderSkeleton() {
  return (
    <Skeleton
      backgroundColor={Colors.primary_light}
      highlightColor={Colors.primary_lighter}
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
