import { Card } from "@/components"
import DeleteFlashCardDialog from "@/components/ui/Dialog/Delete/DeleteFlashCardDialog"
import Header from "@/components/ui/Header/Header"
import Text from "@/components/ui/Text/Text"
import Colors from "@/constants/Colors"
import Layout from "@/constants/Layout"
import useTrackScroll from "@/utils/hooks/ui/useTrackScroll"
import { AntDesign } from "@expo/vector-icons"
import { useCallback, useMemo, useState } from "react"
import { View } from "react-native"
import Feedback from "react-native-haptic-feedback"
import Animated, { FadeIn } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"
import SnapCarousel from "../components/FlashCards/CardSwiper"
import FlipCard from "../components/FlashCards/FlashCard"
import SuccessBar from "../components/SuccessBar"
import { FlashCard, useFlashCards } from "../hooks"

export default function FlashCardScreen({ navigation, route }: any) {
    const groupId = route.params?.groupId

    const { flashCards, groupStats } = useFlashCards(groupId)

    const [scrollY, onScroll] = useTrackScroll()

    const [selectedGroupForDeletion, setSelectedGroupForDeletion] = useState<FlashCard | null>(null)

    const snapItems = useMemo(
        () =>
            flashCards.map((item) => ({
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
            })),
        [flashCards, groupId],
    )

    const renderItem = useCallback(
        ({ item, index }: { item: FlashCard; index: number }) => (
            <Card
                ripple
                animated
                entering={FadeIn.delay(50 * (index + 1))}
                onLongPress={() => {
                    Feedback.trigger("impactMedium")
                    setSelectedGroupForDeletion(item)
                }}
                style={{ marginBottom: 15 }}
            >
                <Text style={{ color: Colors.foreground, fontSize: 18, fontWeight: "600" }}>{item.question}</Text>
                <Text style={{ color: Colors.foreground, marginTop: 10, fontSize: 16 }}>{item.answer}</Text>

                <Text style={{ color: "rgba(255,255,255,0.6)", marginTop: 10, fontSize: 16 }}>
                    Why? {item?.explanation}
                </Text>

                <SuccessBar correctAnswers={item.correctAnswers} incorrectAnswers={item.incorrectAnswers} />
            </Card>
        ),
        [],
    )

    const ListHeaderComponent = useMemo(
        () => (
            <View style={{ marginBottom: 40 }}>
                <SnapCarousel gap={20} itemWidth={Layout.screen.width - 80} items={snapItems} />
                <Text variant="title">Flashcards</Text>
                <Text variant="caption" style={{ color: Colors.foreground, marginTop: 10 }}>
                    {groupStats?.totalCards} cards in total, {groupStats?.averageSuccessRate.toFixed(2)} average success
                    rate, {groupStats?.masteredCards.toFixed(2)} mastered cards total success rate
                </Text>
            </View>
        ),
        [snapItems, groupStats],
    )

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
                ListHeaderComponent={ListHeaderComponent}
                data={flashCards}
                contentContainerStyle={{ paddingHorizontal: 15 }}
                renderItem={renderItem}
                ListFooterComponent={<View style={{ height: 60, width: "100%" }} />}
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
