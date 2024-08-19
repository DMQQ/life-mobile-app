import { ActivityIndicator, FlatList, Text, View } from "react-native";
import Colors from "@/constants/Colors";
import Ripple from "react-native-material-ripple";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import lowOpacity from "@/utils/functions/lowOpacity";
import useCreateTimeline from "@/screens/Stack/Timeline/hooks/mutation/useCreateTimeline";
import moment from "moment";
import { useTransition } from "react";

const events = [
  {
    title: "Shopping",
    icon: <MaterialCommunityIcons name="cart" color={"#fff"} size={25} />,
  },
  {
    title: "Meeting",
    icon: <AntDesign name="calendar" color={"#fff"} size={25} />,
  },
  {
    title: "Work",
    icon: <MaterialCommunityIcons name="briefcase" color={"#fff"} size={25} />,
  },
];

export default function QuickEvent() {
  return (
    <View
      style={{
        backgroundColor: Colors.primary_lighter,
        marginTop: 15,
        borderRadius: 20,
        padding: 20,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
        Quickly create important events!
      </Text>

      <View style={{ flexDirection: "row", marginTop: 20, gap: 10 }}>
        <FlatList
          contentContainerStyle={{
            gap: 10,
          }}
          horizontal
          data={events}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => <Tile {...item} />}
        />

        <Ripple
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 5,
            backgroundColor: lowOpacity(Colors.secondary_dark_2, 0.4),
            borderRadius: 10,
            width: 50,
            borderWidth: 1,
            borderColor: Colors.secondary,
          }}
        >
          <AntDesign name="plus" color={Colors.secondary_light_1} size={25} />
        </Ripple>
      </View>
    </View>
  );
}

const Tile = (item: (typeof events)[number]) => {
  const [isPending, startTransition] = useTransition();

  const {
    handleSubmit,
    state: { loading, data },
  } = useCreateTimeline({
    selectedDate: moment().format("YYYY-MM-DD"),
  });

  const onSubmit = async (title: string) => {
    startTransition(() => {
      handleSubmit({
        title,
        desc: "",
        date: moment().format("YYYY-MM-DD"),
        begin: moment().format("HH:mm:ss"),
        end: moment().add(1, "hours").format("HH:mm:ss"),
        tags: "UNTAGGED",

        repeatCount: "0",
        repeatUntil: "unspecified",
        repeatOn: "",
        repeatEveryNth: "",
      });
    });
  };

  return (
    <Ripple
      disabled={isPending}
      onPress={() => onSubmit(item.title)}
      style={{
        padding: 15,
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 5,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        gap: 10,
        width: 100,
      }}
    >
      {!loading && data?.createTimeline?.title ? (
        <AntDesign name="check" color={Colors.secondary} size={25} />
      ) : loading ? (
        <ActivityIndicator color={Colors.secondary} size="small" />
      ) : (
        item.icon
      )}
      <Text
        style={{ color: "#fff", fontSize: 16 }}
        textBreakStrategy="balanced"
      >
        {item.title}
      </Text>
    </Ripple>
  );
};
