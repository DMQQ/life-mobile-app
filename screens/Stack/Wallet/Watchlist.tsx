import { Image, Text, View } from "react-native";
import ScreenContainer from "../../../components/ui/ScreenContainer";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";

const Product = () => (
  <View style={{ width: Layout.screen.width / 2 - 15, marginTop: 15 }}>
    <Image
      resizeMode="cover"
      source={{
        uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkrz961kAHKFwj4m48zFWWMbJQSUzvc_pZzA&usqp=CAU",
      }}
      style={{ width: "100%", height: 200, borderRadius: 5 }}
    ></Image>
    <Text
      style={{
        color: Colors.secondary,
        fontSize: 18,
        marginTop: 5,
        fontWeight: "bold",
      }}
    >
      Product name
    </Text>
    <Text style={{ color: Colors.secondary, fontSize: 16, marginTop: 5 }}>
      $ 1000
    </Text>
  </View>
);

export default function Watchlist() {
  return (
    <ScreenContainer scroll>
      <Text
        style={{ color: Colors.secondary, fontSize: 20, fontWeight: "bold" }}
      >
        Wanted products
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Product />
        <Product />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Product />
        <Product />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Product />
        <Product />
      </View>
    </ScreenContainer>
  );
}
