import Header from "@/components/ui/Header/Header";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import FlipCard from "../components/FlashCards/FlashCard";
import { Alert, FlatList, Text, View } from "react-native";
import { useFlashCards } from "../hooks";
import Layout from "@/constants/Layout";
import Colors from "@/constants/Colors";
import Ripple from "react-native-material-ripple";
import SnapCarousel from "../components/FlashCards/CardSwiper";
import SuccessBar from "../components/SuccessBar";
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll";
import Animated from "react-native-reanimated";

export default function FlashCardScreen({ navigation, route }: any) {
  const groupId = route.params?.groupId;

  const { flashCards, groupStats, deleteFlashCard } = useFlashCards(groupId);

  const handleDelete = (id: string) => {
    Alert.alert("Delete Flashcard", "Are you sure you want to delete this flashcard?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteFlashCard(id);
        },
      },
    ]);
  };

  const [scrollY, onScroll] = useTrackScroll();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header
        scrollY={scrollY}
        title="Flashcards"
        buttons={[
          {
            icon: <AntDesign name="plus" size={20} color={"#fff"} />,
            onPress: () => navigation.navigate("CreateFlashCards", { groupId }),
          },
        ]}
        goBack
        initialHeight={60}
      />

      <Animated.FlatList
        style={{ paddingTop: 60 }}
        onScroll={onScroll}
        ListHeaderComponent={
          <View style={{ marginBottom: 15 }}>
            <SnapCarousel
              gap={20}
              itemWidth={Layout.screen.width - 80}
              items={flashCards.map((item) => ({
                id: item.id.toString(),
                content: (
                  <FlipCard
                    groupId={groupId}
                    container={{
                      width: Layout.screen.width - 80,
                      height: 200,
                    }}
                    backContent={item.answer}
                    frontContent={item.question}
                    explanation={item?.explanation || ""}
                  />
                ),
              }))}
            />
            <Text style={{ fontSize: 30, color: "#fff", fontWeight: "bold", paddingHorizontal: 20, marginTop: 30 }}>Flashcards</Text>
            <Text style={{ color: "#fff", paddingHorizontal: 20 }}>
              {groupStats?.totalCards} cards in total, {groupStats?.averageSuccessRate.toFixed(2)} average success rate,{" "}
              {groupStats?.masteredCards.toFixed(2)} mastered cards total success rate
            </Text>
          </View>
        }
        data={flashCards}
        renderItem={({ item }) => (
          <Ripple onLongPress={() => handleDelete(item.id)} style={{ paddingHorizontal: 15, marginBottom: 15 }}>
            <View style={{ backgroundColor: Colors.primary_lighter, borderRadius: 15, padding: 15 }}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>{item.question}</Text>
              <Text style={{ color: "#fff", marginTop: 10 }}>{item.answer}</Text>

              <Text style={{ color: "rgba(255,255,255,0.6)", marginTop: 10 }}>Why? {item?.explanation}</Text>

              <SuccessBar correctAnswers={item.correctAnswers} incorrectAnswers={item.incorrectAnswers} />
            </View>
          </Ripple>
        )}
      />
    </SafeAreaView>
  );
}
