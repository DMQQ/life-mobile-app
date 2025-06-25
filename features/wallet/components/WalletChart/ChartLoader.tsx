import { Skeleton } from "@/components";
import Layout from "@/constants/Layout";
import { StyleSheet, View } from "react-native";
import Colors from "@/constants/Colors";
import { memo } from "react";

function ChartLoader() {
  return (
    <Skeleton>
      <View style={styles.container}>
        <View style={styles.header}>
          <Skeleton.Item width={25} height={25} style={styles.iconRadius} />
          <View style={styles.headerIcons}>
            <Skeleton.Item width={25} height={25} style={styles.iconRadius} />
            <Skeleton.Item width={25} height={25} style={styles.iconRadius} />
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Skeleton.Item width={Layout.screen.width * 0.72} height={Layout.screen.width * 0.72} style={styles.chartRadius} />
        </View>

        <View style={styles.legendContainer}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={styles.legendItem} />
          ))}
        </View>

        <View style={styles.infoSection}>
          <View>
            <View style={styles.titlePlaceholder} />
            <View style={styles.subtitlePlaceholder} />
          </View>
          <View style={styles.buttonPlaceholder} />
        </View>

        <View style={styles.cardsContainer}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={styles.cardItem} />
          ))}
        </View>
      </View>
    </Skeleton>
  );
}

export default memo(ChartLoader);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  iconRadius: {
    borderRadius: 5,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 15,
  },
  chartContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  chartRadius: {
    borderRadius: 1000,
  },
  legendContainer: {
    marginTop: 25,
    paddingHorizontal: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  legendItem: {
    width: 90,
    height: 35,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  infoSection: {
    padding: 15,
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titlePlaceholder: {
    width: 120,
    height: 20,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  subtitlePlaceholder: {
    width: 180,
    height: 12,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
    marginTop: 10,
  },
  buttonPlaceholder: {
    width: 110,
    height: 30,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  cardsContainer: {
    padding: 15,
    gap: 15,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cardItem: {
    width: (Layout.screen.width - 30 - 15) / 2,
    height: 125,
    backgroundColor: Colors.primary,
    borderRadius: 15,
  },
});
