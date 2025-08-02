import { Skeleton } from "@/components"
import Layout from "@/constants/Layout"
import { StyleSheet, View } from "react-native"

export default function WalletLoader() {
    return (
        <Skeleton>
            <View style={styles.container}>
                <View style={styles.headerIcons}>
                    <Skeleton.Item width={25} height={25} style={styles.iconRadius} />
                    <Skeleton.Item width={25} height={25} style={styles.iconRadius} />
                    <Skeleton.Item width={25} height={25} style={styles.iconRadius} />
                    <Skeleton.Item width={25} height={25} style={styles.iconRadius} />
                </View>

                <View style={styles.walletSection}>
                    <Skeleton.Item width={(w) => w * 0.8} height={70} style={styles.walletCard} />
                    <Skeleton.Item width={(w) => w / 2} height={15} style={{ marginTop: 10 }} />
                </View>

                <View style={styles.contentSection}>
                    <View style={styles.tabsContainer}>
                        <Skeleton.Item width={90} height={20} style={styles.iconRadius} />
                        <Skeleton.Item width={90} height={20} style={styles.iconRadius} />
                        <Skeleton.Item width={90} height={20} style={styles.iconRadius} />
                        <Skeleton.Item width={90} height={20} style={styles.iconRadius} />
                    </View>

                    <View style={styles.cardsRow}>
                        <Skeleton.Item width={(w) => (w - 30 - 45) / 4} height={95} style={styles.cardRadius} />
                        <Skeleton.Item width={(w) => (w - 30 - 45) / 4} height={95} style={styles.cardRadius} />
                        <Skeleton.Item width={(w) => (w - 30 - 45) / 4} height={95} style={styles.cardRadius} />
                        <Skeleton.Item width={(w) => (w - 30 - 45) / 4} height={95} style={styles.cardRadius} />
                    </View>

                    <View style={styles.centerTextContainer}>
                        <Skeleton.Item width={(w) => w / 2} height={20} style={styles.centerText} />
                    </View>

                    {new Array(2).fill(null).map((_, index) => (
                        <View style={styles.sectionContainer} key={index}>
                            <View style={styles.sectionHeader}>
                                <Skeleton.Item width={(w) => w / 2.5} height={35} style={styles.iconRadius} />
                                <Skeleton.Item width={(w) => w / 4} height={25} style={styles.iconRadius} />
                            </View>

                            <View style={styles.sectionSubHeader}>
                                <Skeleton.Item width={(w) => w / 4} height={20} style={styles.iconRadius} />
                                <Skeleton.Item width={40} height={20} style={styles.iconRadius} />
                            </View>

                            <Skeleton.Item width={(w) => w - 30} height={60} style={styles.transactionItem} />
                            {index > 0 && (
                                <>
                                    <Skeleton.Item width={(w) => w - 30} height={60} style={styles.transactionItem} />
                                    <Skeleton.Item width={(w) => w - 30} height={60} style={styles.transactionItem} />
                                </>
                            )}
                        </View>
                    ))}
                </View>
            </View>
        </Skeleton>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 15,
    },
    headerIcons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 15,
    },
    iconRadius: {
        borderRadius: 5,
    },
    walletSection: {
        marginVertical: 50,
    },
    walletCard: {
        marginTop: 20,
        borderRadius: 5,
    },
    contentSection: {
        marginTop: 15,
    },
    tabsContainer: {
        flexDirection: "row",
        gap: 15,
        width: Layout.screen.width - 30,
        overflow: "hidden",
    },
    cardsRow: {
        marginTop: 5,
        flexDirection: "row",
        gap: 15,
    },
    cardRadius: {
        borderRadius: 15,
    },
    centerTextContainer: {
        alignItems: "center",
    },
    centerText: {
        marginTop: 20,
        borderRadius: 5,
    },
    sectionContainer: {
        marginTop: 35,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    sectionSubHeader: {
        flexDirection: "row",
        gap: 15,
        marginTop: 20,
        justifyContent: "space-between",
    },
    transactionItem: {
        marginTop: 20,
        borderRadius: 10,
    },
})
