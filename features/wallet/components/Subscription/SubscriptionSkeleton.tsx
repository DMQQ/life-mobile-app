import Skeleton from "@/components/SkeletonLoader/Skeleton"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { ScrollView, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const W = Layout.screen.width

export default function SubscriptionSkeleton() {
    const insets = useSafeAreaInsets()

    return (
        <Skeleton>
            <View style={s.root}>
                <View style={[s.headerArea, { paddingTop: insets.top + 10 }]}>
                    <View style={s.headerButtons}>
                        <Skeleton.Item width={36} height={36} style={s.circle} />
                        <Skeleton.Item width={36} height={36} style={s.circle} />
                    </View>
                    <Skeleton.Item width={W * 0.6} height={52} style={s.titleLine} />
                    <Skeleton.Item width={W * 0.32} height={26} style={s.subtitleLine} />
                </View>

                <ScrollView scrollEnabled={false} contentContainerStyle={s.content}>
                    <View style={s.sectionGap}>
                        <Skeleton.Item width={70} height={11} style={s.sectionLabel} />
                        <View style={s.card}>
                            {[0, 1, 2, 3, 4].map((i) => (
                                <View key={i} style={[s.row, i < 4 && s.rowBorder]}>
                                    <Skeleton.Item width={28} height={28} style={s.rowIcon} />
                                    <Skeleton.Item width={W * (i % 2 === 0 ? 0.42 : 0.55)} height={16} style={s.pill} />
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={s.sectionGap}>
                        <Skeleton.Item width={80} height={11} style={s.sectionLabel} />
                        <View style={[s.card, s.statsRow]}>
                            {[0, 1, 2].map((i) => (
                                <View key={i} style={s.statItem}>
                                    <Skeleton.Item width={70} height={28} style={s.statValue} />
                                    <Skeleton.Item width={58} height={11} style={s.statLabel} />
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={s.sectionGap}>
                        <Skeleton.Item width={120} height={11} style={s.sectionLabel} />
                        <View style={s.card}>
                            {[0, 1, 2, 3].map((i) => (
                                <View key={i} style={[s.row, i < 3 && s.rowBorder]}>
                                    <Skeleton.Item width={36} height={36} style={s.rowIcon} />
                                    <View style={s.rowContent}>
                                        <Skeleton.Item width={W * 0.38} height={15} style={s.pill} />
                                        <Skeleton.Item width={W * 0.22} height={11} style={[s.pill, { marginTop: 6 }]} />
                                    </View>
                                    <Skeleton.Item width={56} height={16} style={s.pill} />
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Skeleton>
    )
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.primary },
    headerArea: {
        paddingHorizontal: 15,
        paddingBottom: 20,
        gap: 12,
    },
    headerButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    circle: { borderRadius: 100 },
    titleLine: { borderRadius: 12 },
    subtitleLine: { borderRadius: 8 },
    content: { paddingHorizontal: 15, paddingBottom: 60 },
    sectionGap: { marginTop: 30 },
    sectionLabel: { borderRadius: 6, marginBottom: 7, marginLeft: 4 },
    card: {
        backgroundColor: Colors.primary_lighter,
        borderRadius: 20,
        overflow: "hidden",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 12,
    },
    rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.borderColor },
    rowIcon: { borderRadius: 8 },
    rowContent: { flex: 1, gap: 6 },
    pill: { borderRadius: 8 },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 20,
    },
    statItem: { alignItems: "center", gap: 8 },
    statValue: { borderRadius: 8 },
    statLabel: { borderRadius: 6 },
})
