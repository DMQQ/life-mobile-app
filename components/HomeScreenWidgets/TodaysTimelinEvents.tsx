import { FlatList, Text, View } from "react-native";
import useUser from "../../utils/hooks/useUser";
import { gql, useQuery } from "@apollo/client";
import TimelineItem from "../../screens/Stack/Timeline/components/TimelineItem";
import Colors from "../../constants/Colors";
import Color from "color";
import Button from "../ui/Button/Button";
import { useNavigation } from "@react-navigation/native";
import Ripple from "react-native-material-ripple";

export default function TodaysTimelineEvents(props: { data: any[] }) {
  const { removeUser, token } = useUser();

  const navigation = useNavigation<any>();

  return (
    <View
      style={{
        padding: 15,
        marginTop: 15,
        backgroundColor: Color(Colors.primary).lighten(0.5).string(),
        borderRadius: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 15,
        }}
      >
        <Text
          style={{ color: Colors.secondary, fontSize: 25, fontWeight: "bold" }}
        >
          Today's events ({props?.data?.length})
        </Text>
        <Ripple
          onPress={() => navigation.navigate("TimelineScreens")}
          style={{
            backgroundColor: Colors.secondary,
            borderRadius: 100,
            padding: 5,
            paddingHorizontal: 10,
          }}
        >
          <Text
            style={{
              color: Colors.primary,
              fontSize: 15,
              fontWeight: "bold",
            }}
          >
            See more
          </Text>
        </Ripple>
      </View>

      {/* {props?.data?.map((item) => (
        <TimelineItem location="root" key={item.id} {...item} />
      ))} */}

      <FlatList
        style={{ height: 150 }}
        data={props?.data}
        renderItem={({ item }) => (
          <TimelineItem location="root" key={item.id} {...item} />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
