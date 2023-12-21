import { Image, Text, View, VirtualizedList } from "react-native";
import ScreenContainer from "../../../../components/ui/ScreenContainer";
import Colors from "../../../../constants/Colors";
import Layout from "../../../../constants/Layout";
import Animated from "react-native-reanimated";

const Product = () => (
  <Animated.View
    style={{
      width: Layout.screen.width - 15,
      marginTop: 15,
      backgroundColor: Colors.primary_light,
      padding: 15,
      borderRadius: 20,
      flexDirection: "row",
    }}
  >
    <Image
      source={{
        uri: "https://www.pngitem.com/pimgs/m/568-5680053_prod-placeholder-vector-product-icon-png-transparent-png.png",
      }}
      style={{
        width: 125,
        height: 100,
        borderRadius: 15,
      }}
    />
    <View style={{ marginLeft: 15 }}>
      <Text
        style={{
          color: "#fff",
          fontSize: 20,
          fontWeight: "bold",
          flexWrap: "wrap",
        }}
        lineBreakMode="middle"
        textBreakStrategy="highQuality"
      >
        Xiaomi Mi9 6GB/64GB black
      </Text>

      <Text style={{ color: "#fff" }}>100zł to 390zł</Text>
    </View>
  </Animated.View>
);

export default function Watchlist() {
  return (
    <ScreenContainer>
      <Text
        style={{
          color: "#fff",
          fontSize: 25,
          fontWeight: "bold",
          padding: 15,
        }}
      >
        Wanted products
      </Text>

      <VirtualizedList
        removeClippedSubviews
        data={Array.from(Array(10).keys())}
        keyExtractor={(i) => i.toString()}
        getItem={(arr, index) => arr[index]}
        getItemCount={(arr) => arr.length}
        renderItem={({ item }) => <Product />}
      />
    </ScreenContainer>
  );
}
