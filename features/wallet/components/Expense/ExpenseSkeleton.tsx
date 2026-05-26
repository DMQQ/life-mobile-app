import Skeleton from "@/components/SkeletonLoader/Skeleton"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import { ScrollView, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const W = Layout.screen.width

export default function ExpenseSkeleton() {
    const insets = useSafeAreaInsets()

    return (
        <Skeleton>
            <View style={s.root}>
                <View style={[s.headerArea, { paddingTop: insets.top + 10 }]}>
                    <View style={s.headerButtons}>
                        <Skeleton.Item width={36} height={36} style={s.circle} />
                        <View style={s.headerRight}>
                            <Skeleton.Item width={36} height={36} style={s.circle} />
                            <Skeleton.Item width={36} height={36} style={s.circle} />
                            <Skeleton.Item width={36} height={36} style={s.circle} />
                        </View>
                    </View>
                    <Skeleton.Item width={W * 0.65} height={52} style={s.titleLine} />
                    <Skeleton.Item width={W * 0.28} height={26} style={s.subtitleLine} />
                </View>

                <ScrollView scrollEnabled={false} contentContainerStyle={s.content}>
                    <View style={s.sectionGap}>
                        <Skeleton.Item width={60} height={11} style={s.sectionLabel} />
                        <View style={s.card}>
                            {[0, 1, 2, 3].map((i) => (
                                <View key={i} style={[s.row, i < 3 && s.rowBorder]}>
                                    <Skeleton.Item width={36} height={36} style={s.rowIcon} />
                                    <Skeleton.Item width={W * (i % 2 === 0 ? 0.38 : 0.5)} height={16} style={s.pill} />
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={s.sectionGap}>
                        <Skeleton.Item width={65} height={11} style={s.sectionLabel} />
                        <View style={s.card}>
                            <Skeleton.Item width={W - 30} height={280} style={s.calendarBlock} />
                        </View>
                    </View>

                    <View style={s.sectionGap}>
                        <Skeleton.Item width={90} height={11} style={s.sectionLabel} />
                        <View style={s.card}>
                            <View style={s.breakdownRow}>
                                <View style={s.breakdownLeft}>
                                    <Skeleton.Item width={W * 0.35} height={18} style={s.pill} />
                                    <Skeleton.Item width={W * 0.5} height={8} style={[s.pill, { marginTop: 10 }]} />
                                    <Skeleton.Item width={W * 0.28} height={13} style={[s.pill, { marginTop: 8 }]} />
                                </View>
                                <Skeleton.Item width={72} height={72} style={s.circle} />
                            </View>

                            <View style={s.progressBarWrap}>
                                <Skeleton.Item width={W - 60} height={6} style={s.progressBar} />
                            </View>
                        </View>
                    </View>

                    <View style={s.sectionGap}>
                        <Skeleton.Item width={100} height={11} style={s.sectionLabel} />
                        <View style={s.card}>
                            {[0, 1, 2].map((i) => (
                                <View key={i} style={[s.row, i < 2 && s.rowBorder]}>
                                    <Skeleton.Item width={36} height={36} style={s.rowIcon} />
                                    <View style={s.rowContent}>
                                        <Skeleton.Item width={W * 0.4} height={15} style={s.pill} />
                                        <Skeleton.Item width={W * 0.25} height={11} style={[s.pill, { marginTop: 5 }]} />
                                    </View>
                                    <Skeleton.Item width={52} height={16} style={s.pill} />
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
        alignItems: "center",
        marginBottom: 8,
    },
    headerRight: { flexDirection: "row", gap: 10 },
    circle: { borderRadius: 100 },
    titleLine: { borderRadius: 12 },
    subtitleLine: { borderRadius: 8 },
    content: { paddingHorizontal: 15, paddingBottom: 100 },
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
    rowContent: { flex: 1 },
    pill: { borderRadius: 8 },
    calendarBlock: { borderRadius: 0 },
    breakdownRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        gap: 12,
    },
    breakdownLeft: { flex: 1, gap: 0 },
    progressBarWrap: { paddingHorizontal: 16, paddingBottom: 16 },
    progressBar: { borderRadius: 6 },
})
