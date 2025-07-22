import Skeleton from "@/components/SkeletonLoader/Skeleton"
import Colors from "@/constants/Colors"
import { StyleSheet, View } from "react-native"
import Animated, { FadeOut } from "react-native-reanimated"

export default function LoaderSkeleton() {
    return (
        <Skeleton
            size={({ width, height }) => ({
                width: width - 30,
                height: height - 150,
            })}
        >
            <View>
                <Skeleton.Item height={45} width={(w) => w - 30} />

                <Skeleton.Item height={25} width={(w) => w - 30} marginTop={20} />
                <Skeleton.Item height={30} width={(w) => w - 30} />
                <Skeleton.Item height={30} width={(w) => w - 30} />
                <Skeleton.Item height={30} width={(w) => w - 30} />
                <Skeleton.Item height={30} width={(w) => w - 30} />

                <Skeleton.Item height={30} width={(w) => w / 3} marginTop={20} />

                <Skeleton.Item height={30} width={(w) => w - 30} />
                <Skeleton.Item height={30} width={(w) => w - 30} />
                <Skeleton.Item height={30} width={(w) => w - 30} />
                <Skeleton.Item height={30} width={(w) => w - 30} />

                <Skeleton.Item height={30} width={(w) => w / 2} marginTop={25} />

                <View style={{ flexDirection: "row", marginTop: 5 }}>
                    <Skeleton.Item width={185} height={120} marginRight={10} />
                    <Skeleton.Item width={185} height={120} marginRight={10} />
                    <Skeleton.Item width={185} height={120} marginRight={10} />
                </View>
            </View>
        </Skeleton>
    )
}

export const TimelineScreenLoader = () => (
    <Animated.View
        exiting={FadeOut.duration(250)}
        style={[
            StyleSheet.absoluteFillObject,
            {
                backgroundColor: Colors.primary,
                zIndex: 1000,
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 125,
            },
        ]}
    >
        <Skeleton>
            <View style={{ flex: 1, paddingHorizontal: 15 }}>
                <View style={{ justifyContent: "flex-end", flexDirection: "row", gap: 15 }}>
                    <Skeleton.Item width={25} height={25} style={{ borderRadius: 10 }} />
                    <Skeleton.Item width={25} height={25} style={{ borderRadius: 10 }} />
                </View>

                <View style={{ paddingTop: 40, paddingBottom: 15 }}>
                    <Skeleton.Item width={(w) => w * 0.65} height={65} style={{ marginTop: 10 }} />
                    <Skeleton.Item width={(w) => w * 0.4} height={15} style={{ marginTop: 10 }} />
                </View>

                <View style={{ flexDirection: "row", gap: 15, marginTop: 10 }}>
                    <Skeleton.Item width={(w) => w / 4} height={45} style={{ marginTop: 10, borderRadius: 10 }} />
                    <Skeleton.Item width={(w) => w / 4} height={45} style={{ marginTop: 10, borderRadius: 10 }} />
                    <Skeleton.Item width={(w) => w / 4} height={45} style={{ marginTop: 10, borderRadius: 10 }} />
                    <Skeleton.Item width={(w) => w / 4} height={45} style={{ marginTop: 10, borderRadius: 10 }} />
                </View>
                <View style={{ marginTop: 5, gap: 13, flexDirection: "row" }}>
                    <Skeleton.Item width={75} height={100} style={{ borderRadius: 10 }} />
                    <Skeleton.Item width={75} height={100} style={{ borderRadius: 10 }} />
                    <Skeleton.Item width={75} height={100} style={{ borderRadius: 10 }} />
                    <Skeleton.Item width={75} height={100} style={{ borderRadius: 10 }} />
                    <Skeleton.Item width={75} height={100} style={{ borderRadius: 10 }} />
                </View>

                <View style={{ marginTop: 30 }}>
                    <Skeleton.Item width={(w) => w - 30} height={150} style={{ marginTop: 10, borderRadius: 15 }} />
                    <Skeleton.Item width={(w) => w - 30} height={150} style={{ marginTop: 10, borderRadius: 15 }} />
                    <Skeleton.Item width={(w) => w - 30} height={150} style={{ marginTop: 10, borderRadius: 15 }} />
                </View>
            </View>
        </Skeleton>
    </Animated.View>
)
