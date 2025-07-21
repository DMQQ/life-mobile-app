import DeleteFlashCardDialog from "@/components/ui/Dialog/Delete/DeleteFlashCardDialog"
import Header from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import { AntDesign } from "@expo/vector-icons"
import { useState } from "react"
import { Text, View } from "react-native"
import Ripple from "react-native-material-ripple"
import Animated from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"
import Feedback from "react-native-haptic-feedback"
import SnapCarousel from "../components/FlashCards/CardSwiper"
import FlipCard from "../components/FlashCards/FlashCard"
import SuccessBar from "../components/SuccessBar"
import { FlashCard, useFlashCards } from "../hooks"

export default function FlashCardScreen({ navigation, route }: any) {
    const groupId = route.params?.groupId

    const { flashCards, groupStats } = useFlashCards(groupId)

    const [scrollY, onScroll] = useTrackScroll()

    const [selectedGroupForDeletion, setSelectedGroupForDeletion] = useState<FlashCard | null>(null)

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Header
                scrollY={scrollY}
                title="Flashcards"
                buttons={[
                    {
                        icon: <AntDesign name="plus" size={20} color={Colors.foreground} />,
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
                        <Text
                            style={{
                                fontSize: 30,
                                color: Colors.foreground,
                                fontWeight: "bold",
                                paddingHorizontal: 20,
                                marginTop: 30,
                            }}
                        >
                            Flashcards
                        </Text>
                        <Text style={{ color: Colors.foreground, paddingHorizontal: 20 }}>
                            {groupStats?.totalCards} cards in total, {groupStats?.averageSuccessRate.toFixed(2)} average
                            success rate, {groupStats?.masteredCards.toFixed(2)} mastered cards total success rate
                        </Text>
                    </View>
                }
                data={flashCards}
                renderItem={({ item }) => (
                    <Ripple
                        onLongPress={() => {
                            Feedback.trigger("impactMedium")
                            setSelectedGroupForDeletion(item)
                        }}
                        style={{ paddingHorizontal: 15, marginBottom: 15 }}
                    >
                        <View style={{ backgroundColor: Colors.primary_lighter, borderRadius: 15, padding: 15 }}>
                            <Text style={{ color: Colors.foreground, fontSize: 18, fontWeight: "600" }}>{item.question}</Text>
                            <Text style={{ color: Colors.foreground, marginTop: 10 }}>{item.answer}</Text>

                            <Text style={{ color: "rgba(255,255,255,0.6)", marginTop: 10 }}>
                                Why? {item?.explanation}
                            </Text>

                            <SuccessBar correctAnswers={item.correctAnswers} incorrectAnswers={item.incorrectAnswers} />
                        </View>
                    </Ripple>
                )}
            />

            <DeleteFlashCardDialog
                groupId={groupId}
                isVisible={!!selectedGroupForDeletion}
                item={
                    selectedGroupForDeletion
                        ? {
                              id: selectedGroupForDeletion?.id,
                              name: selectedGroupForDeletion?.question,
                          }
                        : undefined
                }
                onDismiss={() => setSelectedGroupForDeletion(null)}
            />
        </SafeAreaView>
    )
}
