import Header from "@/components/ui/Header/Header"
import Colors from "@/constants/Colors"
import Url from "@/constants/Url"
import { Expense as ExpenseType } from "@/types"
import { parseDate } from "@/utils/functions/parseDate"
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client"
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons"
import axios from "axios"
import moment from "moment"
import { ReactNode, useEffect, useState } from "react"
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, View } from "react-native"
import Ripple from "react-native-material-ripple"
import WalletItem, { CategoryIcon } from "../components/Wallet/WalletItem"
import useDeleteActivity from "../hooks/useDeleteActivity"
import useRefund from "../hooks/useRefundExpense"
import useSubscription from "../hooks/useSubscription"

import { CategoryUtils, Icons } from "../components/Expense/ExpenseIcon"

const similarCategories = {
    food: ["drinks"],
    drinks: ["food"],
    transport: ["travel"],
    travel: ["transportation"],
    entertainment: ["subscriptions", "gifts"],
    electronics: ["subscriptions", "gifts", "entertainment"],
} as const

const useGetSimilarExpenses = ({ description: name, date, category, type, amount }: ExpenseType) => {
    return useLazyQuery(
        gql`
            query GetSimilarExpenses($filters: GetWalletFilters, $skip: Int, $take: Int) {
                wallet {
                    id
                    balance
                    expenses(filters: $filters, take: $take, skip: $skip) {
                        id
                        amount
                        date
                        description
                        type
                        category
                        balanceBeforeInteraction
                        note
                        subscription {
                            id
                            isActive
                            nextBillingDate
                            dateStart
                        }
                    }
                }
            }
        `,
        {
            variables: {
                filters: {
                    title: name,
                    amount: {
                        from: amount - amount * 0.5,
                        to: amount + amount * 0.5,
                    },
                    date: {
                        // from: moment(date).subtract(30, "days").format("YYYY-MM-DD"),
                        // to: moment(date).add(30, "days").format("YYYY-MM-DD"),
                    },
                    category: [
                        category,
                        ...(similarCategories[category as keyof typeof similarCategories] || []),
                    ].filter(Boolean),
                    type,
                },
                skip: 0,
                take: 6,
            },
        },
    )
}

const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1)

const Txt = (props: { children: ReactNode; size: number; color?: any }) => (
    <Text
        style={{
            color: props.color ?? Colors.secondary,
            fontSize: props.size,
            fontWeight: "bold",
            lineHeight: props.size + 7.5,
        }}
    >
        {props.children}
    </Text>
)

export default function Expense({ route: { params }, navigation }: any) {
    const { data, error } = useQuery(
        gql`
            query Expense($id: ID!) {
                expense(expenseId: $id) {
                    id
                    amount
                    date
                    description
                    type
                    category
                    balanceBeforeInteraction
                    note

                    subscription {
                        id
                        isActive
                        nextBillingDate
                        dateStart
                    }

                    location {
                        id
                        kind
                        name
                        latitude
                        longitude
                    }

                    files {
                        id
                        url
                    }

                    subexpenses {
                        id
                        description
                        amount
                        category
                    }
                }
            }
        `,
        { variables: { id: params?.expense?.id } },
    )

    const [selected, setSelected] = useState(params?.expense)

    useEffect(() => {
        if (data?.expense) {
            setSelected(data.expense)
        }
    }, [data?.expense])

    const amount = selected?.type === "expense" ? (selected.amount * -1).toFixed(2) : selected?.amount.toFixed(2)

    const [refund, { loading: refundLoading }] = useRefund((data) => {
        if (data.refundExpense.type !== "refunded") return

        setSelected({
            ...selected,
            type: "refunded",
        })
    })

    const [getLazyExpenses, { data: similar, called }] = useGetSimilarExpenses(selected)
    const [calls, setCalls] = useState(0)
    useEffect(() => {
        if (selected != null) {
            getLazyExpenses()
        }
    }, [selected])

    useEffect(() => {
        if (!called || calls > 1) return

        if (similar?.wallet?.expenses?.length === 1) {
            getLazyExpenses({
                variables: {
                    filters: {
                        title: "",
                        amount: {
                            from: 0,
                            to: 1000000,
                        },
                        date: {
                            // from: moment(selected.date).subtract(30, "days").format("YYYY-MM-DD"),
                            // to: moment(selected.date).add(30, "days").format("YYYY-MM-DD"),
                        },
                        category: [
                            selected?.category,
                            ...(similarCategories[selected.category as keyof typeof similarCategories] || []),
                        ].filter(Boolean),
                        type: selected.type,
                    },
                    skip: 0,
                    take: 6,
                },
            })
            setCalls(calls + 1)
        }
    }, [similar?.wallet?.expenses, calls])

    const handleRefund = () => {
        Alert.alert("Refund Expense", "Are you sure you want to refund this expense?", [
            {
                onPress: async () => {
                    try {
                        await refund({ variables: { expenseId: selected.id } })
                    } catch (error) {
                        Alert.alert("Error", "Failed to refund the expense. Please try again.")
                    }
                },
                text: "Yes",
            },
            {
                onPress: () => {},
                text: "Cancel",
            },
        ])
    }

    const subscription = useSubscription()
    const isSubscriptionLoading =
        subscription.createSubscriptionState.loading || subscription.cancelSubscriptionState.loading

    const hasSubscription = !!selected?.subscription?.id

    const isSubscriptionActive = hasSubscription && selected?.subscription?.isActive

    const handleSubscriptionAction = () => {
        const actionTitle = hasSubscription
            ? isSubscriptionActive
                ? "Disable Subscription"
                : "Enable Subscription"
            : "Create Monthly Subscription"

        Alert.alert(actionTitle, `Are you sure you want to ${actionTitle.toLowerCase()}?`, [
            {
                onPress: async () => {
                    try {
                        if (isSubscriptionActive && selected?.subscription?.id) {
                            const result = await subscription.cancelSubscription({
                                variables: { subscriptionId: selected.subscription.id },
                            })

                            if (result.data?.cancelSubscription) {
                                setSelected(result.data.cancelSubscription)
                            }
                        } else {
                            const result = await subscription.createSubscription({
                                variables: { expenseId: selected.id },
                            })

                            if (result.data?.createSubscription) {
                                setSelected(result.data.createSubscription)
                            }
                        }
                    } catch (error) {
                        Alert.alert("Error", "Failed to update subscription. Please try again.")
                    }
                },
                text: "Yes",
            },
            {
                onPress: () => {},
                text: "Cancel",
            },
        ])
    }

    const { deleteActivity } = useDeleteActivity()

    const handleDelete = async () => {
        const onRemove = async () => {
            if (typeof selected?.id !== "undefined")
                await deleteActivity({
                    variables: {
                        id: selected?.id,
                    },

                    onCompleted() {
                        navigation.goBack()
                    },
                })
        }

        Alert.alert("Delete Expense", "Are you sure you want to delete this expense?", [
            {
                onPress: onRemove,
                text: "Yes",
            },
            {
                onPress: () => {},
                text: "Cancel",
            },
        ])
    }

    const handleEdit = () => {
        navigation.navigate("CreateExpense", {
            ...selected,
            isEditing: true,
        })
    }

    const [deleteSubExpense] = useMutation(gql`
        mutation ($id: ID!) {
            deleteSubExpense(id: $id)
        }
    `)

    const handleDeleteSubExpense = async (id: string) => {
        try {
            Alert.alert("Delete Sub-Expense", "Are you sure you want to delete this sub-expense?", [
                {
                    onPress: async () => {
                        try {
                            await deleteSubExpense({ variables: { id } })
                            setSelected((prev: any) => ({
                                ...prev,
                                subexpenses: prev.subexpenses.filter((item: any) => item.id !== id),
                            }))
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete sub-expense. Please try again.")
                        }
                    },
                    text: "Yes",
                },
                {
                    onPress: () => {},
                    text: "Cancel",
                },
            ])
        } catch (error) {
            Alert.alert("Error", "Failed to delete sub-expense. Please try again.")
        }
    }

    const scrollY = useSharedValue(0)
    const insets = useSafeAreaInsets()

    const onScroll = useAnimatedScrollHandler({
        onScroll: (ev) => {
            scrollY.value = ev.contentOffset.y
        },
    })

    return (
        <View style={{ flex: 1 }}>
            <Header
                animated
                animatedTitle={capitalize(selected?.description)}
                isScreenModal
                initialHeight={60}
                renderAnimatedItem={({ scrollY }) => (
                    <AnimatedExpenseHeaderItem expense={selected} scrollY={scrollY!} />
                )}
                titleAnimatedStyle={{ flexWrap: "nowrap" }}
                scrollY={scrollY}
                buttons={[
                    {
                        icon: <Feather name="trash" size={20} color={Colors.foreground} />,
                        onPress: handleDelete,
                    },
                    {
                        icon: <Feather name="edit-2" size={20} color={Colors.foreground} />,
                        onPress: handleEdit,
                        style: { marginLeft: 5 },
                    },
                ]}
                initialTitleFontSize={selected?.description?.length > 25 ? 40 : 60}
            />
            <Animated.ScrollView
                onScroll={onScroll}
                keyboardDismissMode={"on-drag"}
                style={{ flex: 1, paddingTop: 250 }}
            >
                <View style={{ marginBottom: 30, paddingHorizontal: 15 }}>
                    <View
                        style={[
                            styles.row,
                            {
                                marginTop: 0,
                                padding: 0,
                                flexWrap: "wrap",
                                backgroundColor: "transparent",
                                marginVertical: 20,
                                alignItems: "center",
                            },
                        ]}
                    >
                        <View style={{ marginTop: 2.5 }}>
                            <Txt
                                size={20}
                                color={
                                    selected.type === "refunded"
                                        ? Colors.secondary_light_2
                                        : selected.type === "expense"
                                          ? "#F07070"
                                          : "#66E875"
                                }
                            >
                                {amount}
                                <Text style={{ fontSize: 16 }}>zł</Text>
                            </Txt>
                        </View>
                    </View>

                    {selected.subexpenses?.length > 0 && (
                        <View style={{ marginTop: 15 }}>
                            <SubexpenseStack selected={selected} handleDeleteSubExpense={handleDeleteSubExpense} />

                            <View style={{ marginBottom: 15, marginTop: 10 }}>
                                <Txt size={20} color={Colors.foreground}>
                                    Expense details
                                </Txt>
                            </View>
                        </View>
                    )}

                    {selected?.category && (
                        <View style={[styles.row, { padding: 0, paddingRight: 10, paddingLeft: 7.5 }]}>
                            <CategoryIcon
                                type={selected?.type as "expense" | "income"}
                                category={(selected?.category || "none") as any}
                                clear
                            />

                            <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>
                                {capitalize(CategoryUtils.getCategoryName(selected?.category || ""))}
                            </Text>
                        </View>
                    )}

                    <View style={styles.row}>
                        <AntDesign
                            name="calendar"
                            size={24}
                            color={Colors.ternary}
                            style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                        />

                        <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>
                            {parseDate(selected?.date || "")}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <MaterialIcons
                            name="money"
                            size={24}
                            color={Colors.ternary}
                            style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                        />

                        <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>
                            {capitalize(selected?.type)}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <MaterialIcons
                            name="money"
                            size={24}
                            color={Colors.ternary}
                            style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                        />

                        <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>
                            Balance before: {selected?.balanceBeforeInteraction} zł
                        </Text>
                    </View>

                    {/* Refund section */}
                    <View style={[styles.row]}>
                        <Ripple
                            disabled={refundLoading || selected?.type === "refunded"}
                            onPress={handleRefund}
                            style={[styles.row, { marginTop: 0, padding: 0, width: "100%" }]}
                        >
                            <MaterialIcons
                                name={selected?.type === "refunded" ? "check-box" : "check-box-outline-blank"}
                                size={24}
                                color={Colors.ternary}
                                style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                            />
                            <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }} numberOfLines={1}>
                                {selected?.type === "refunded"
                                    ? (selected?.note ?? `Refunded at ${moment().format("YYYY MM DD HH:SS")}`)
                                    : "Refund"}
                            </Text>
                            {refundLoading && (
                                <ActivityIndicator size="small" color={Colors.ternary} style={{ marginLeft: 10 }} />
                            )}
                        </Ripple>
                    </View>

                    {/* Subscription section */}
                    <View style={styles.row}>
                        <MaterialIcons
                            name={isSubscriptionActive ? "refresh" : "refresh"}
                            size={24}
                            color={Colors.ternary}
                            style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                        />

                        <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>
                            {hasSubscription
                                ? isSubscriptionActive
                                    ? "Subscription active"
                                    : "Subscription inactive"
                                : "Set up subscription"}
                        </Text>

                        {isSubscriptionLoading && (
                            <ActivityIndicator size="small" color={Colors.ternary} style={{ marginLeft: 10 }} />
                        )}
                    </View>

                    {hasSubscription && (
                        <>
                            <View style={styles.row}>
                                <MaterialIcons
                                    name="date-range"
                                    size={24}
                                    color={Colors.ternary}
                                    style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                                />
                                <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>
                                    {isSubscriptionActive ? "Next payment: " : "Last payment: "}
                                    {selected.subscription?.nextBillingDate &&
                                        moment(+selected?.subscription?.nextBillingDate).format("YYYY-MM-DD")}
                                </Text>
                            </View>
                            <View style={styles.row}>
                                <MaterialIcons
                                    name="history"
                                    size={24}
                                    color={Colors.ternary}
                                    style={{ paddingHorizontal: 7.5, padding: 2.5 }}
                                />
                                <Text style={{ color: Colors.secondary_light_2, fontSize: 18 }}>
                                    {isSubscriptionActive ? "Active since: " : "Created on: "}
                                    {moment(+selected?.subscription?.dateStart).format("YYYY-MM-DD")}
                                </Text>
                            </View>
                        </>
                    )}

                    {/* Subscription action button */}
                    <Ripple
                        onPress={handleSubscriptionAction}
                        disabled={isSubscriptionLoading}
                        style={[
                            styles.row,
                            {
                                marginTop: 10,
                                justifyContent: "center",
                                backgroundColor: isSubscriptionActive ? "rgba(255,59,48,0.2)" : "rgba(52,199,89,0.2)",
                            },
                        ]}
                    >
                        <Text
                            style={{
                                color: isSubscriptionActive ? "rgba(255,59,48,0.9)" : "rgba(52,199,89,0.9)",
                                fontSize: 16,
                                fontWeight: "bold",
                            }}
                        >
                            {hasSubscription
                                ? isSubscriptionActive
                                    ? "Disable Subscription"
                                    : "Enable Subscription"
                                : "Create Monthly Subscription"}
                        </Text>
                    </Ripple>
                </View>

                <FileUpload id={selected.id} images={selected?.files} />

                <MapPicker location={selected.location} id={selected.id} />

                {similar?.wallet?.expenses?.length > 1 && (
                    <View style={{ paddingHorizontal: 15, marginBottom: 25 }}>
                        <Txt size={20} color={Colors.foreground}>
                            Recent similar expenses
                        </Txt>

                        <View style={{ marginTop: 25 }}>
                            {similar?.wallet?.expenses
                                ?.filter((items: any) => items.id !== selected?.id)
                                .map((item: any) => (
                                    <WalletItem
                                        key={item.id}
                                        {...item}
                                        handlePress={() => {
                                            navigation.push("Expense", {
                                                expense: item,
                                            })
                                        }}
                                    />
                                ))}
                        </View>
                    </View>
                )}
                <View style={{ height: 80 }} />
            </Animated.ScrollView>
        </View>
    )
}

const AnimatedExpenseHeaderItem = ({
    scrollY,
    expense,
}: {
    scrollY: Animated.SharedValue<number>
    expense: ExpenseType
}) => {
    return (
        <Animated.View
            style={[
                useAnimatedStyle(() => {
                    const scrollValue = scrollY?.value ?? 0

                    return {
                        opacity: interpolate(scrollValue, [0, 130, 150, 160], [0, 0, 0.75, 1], Extrapolation.CLAMP),
                        transform: [
                            {
                                translateY: interpolate(scrollValue, [0, 160], [-25, 0], Extrapolation.CLAMP),
                            },
                            { scale: interpolate(scrollValue, [0, 160], [0.5, 1], Extrapolation.CLAMP) },
                        ],
                    }
                }, [scrollY]),
                { paddingHorizontal: 15 },
            ]}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 10,
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <CategoryIcon
                        type={expense?.type as "expense" | "income"}
                        category={(expense?.category || "none") as any}
                    />

                    <Text style={{ color: Icons[expense?.category]?.backgroundColor, fontSize: 18, fontWeight: 600 }}>
                        {expense?.category.split(":").map(capitalize).join(" / ")}
                    </Text>
                </View>
                <Text
                    style={{
                        color:
                            expense.type === "refunded"
                                ? Colors.secondary_light_2
                                : expense.type === "expense"
                                  ? "#F07070"
                                  : "#66E875",
                        fontSize: 18,
                        fontWeight: 600,
                    }}
                >
                    {expense?.type === "refunded"
                        ? (expense?.amount * -1).toFixed(2)
                        : expense?.type === "expense"
                          ? (expense?.amount * -1).toFixed(2)
                          : expense?.amount.toFixed(2)}
                    <Text style={{ fontSize: 16 }}>zł</Text>
                </Text>
            </View>
        </Animated.View>
    )
}

import Layout from "@/constants/Layout"
import * as ImagePicker from "expo-image-picker"
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import ImageViewerModal from "../components/Expense/ImageViewer"
import MapPicker from "../components/Expense/Map"
import SubexpenseStack from "../components/Expense/SubexpenseStack"

const FileUpload = (props: { id: string; images: any[] }) => {
    const [files, setFiles] = useState<{ id: string; url: string }[]>(props.images ?? [])

    async function uploadPhotoAsync(photos: ImagePicker.ImagePickerResult) {
        if (photos.assets?.length === 0 || photos.canceled) return

        const photo = photos.assets[0]

        const formData = new FormData()

        const fileObject = {
            uri: photo.uri,
            name: photo.fileName || "photo.jpg",
            type: photo.type || "image/jpeg",
        }

        formData.append("file", fileObject as any)

        try {
            const { data } = await axios.post(Url.API + "/upload/expense-file", formData, {
                params: {
                    expenseId: props.id,
                    compress: "true",
                },
                headers: {
                    "Content-Type": "multipart/form-data",
                    Accept: "application/json",
                },
            })

            const newFiles = Array.isArray(data) ? data : [data]
            setFiles((prev) => [...prev, ...newFiles])
            return data
        } catch (error) {
            throw error
        }
    }

    const handleTakePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync()

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            allowsMultipleSelection: false,
            mediaTypes: "images",
            cameraType: ImagePicker.CameraType.back,
            quality: 1,
            aspect: [4, 3],
        })

        if (!result.canceled) {
            await uploadPhotoAsync(result)
        }
    }

    const handleImagesSelect = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                allowsMultipleSelection: false,
            })

            if (!result.canceled) {
                await uploadPhotoAsync(result)
            }
        } catch (error) {
            console.error("Error selecting image:", error)
        }
    }

    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    return (
        <View style={{ paddingHorizontal: 15, marginBottom: 40 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Txt size={20} color={Colors.foreground}>
                    Attachments
                </Txt>

                <View style={{ flexDirection: "row", gap: 20 }}>
                    <Ripple onPress={handleTakePhoto}>
                        <AntDesign name="camerao" size={24} color={Colors.foreground} />
                    </Ripple>
                    <Ripple onPress={handleImagesSelect}>
                        <AntDesign name="plus" size={24} color={Colors.foreground} onPress={handleImagesSelect} />
                    </Ripple>
                </View>
            </View>
            {files?.length > 0 ? (
                <FlatList
                    style={{ marginTop: 25 }}
                    horizontal
                    data={files}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Ripple
                            onPress={() => {
                                setSelectedImage((p) => (p === item.url ? null : item.url))
                            }}
                        >
                            <Image
                                source={{
                                    uri: Url.API + "/upload/images/" + item?.url,
                                }}
                                style={{
                                    width: Layout.screen.width - 45,
                                    height: 250,
                                    borderRadius: 10,
                                    marginRight: 10,
                                }}
                                resizeMode="cover"
                            />
                        </Ripple>
                    )}
                />
            ) : (
                <Ripple
                    onPress={handleImagesSelect}
                    style={{
                        width: Layout.screen.width - 30,
                        marginTop: 25,
                        height: 200,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 10,
                        backgroundColor: Colors.primary_light,
                    }}
                >
                    <Text style={{ color: "gray" }}>Add file</Text>
                </Ripple>
            )}

            <ImageViewerModal
                selectedImage={selectedImage}
                onClose={() => {
                    setSelectedImage(null)
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        fontSize: 15,
        marginTop: 10,
        color: Colors.foreground,
        backgroundColor: Colors.secondary_dark_1,
        padding: 5,
        paddingHorizontal: 15,
        borderRadius: 100,
        marginRight: 5,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 15,
        borderRadius: 15,
        backgroundColor: Colors.primary_light,
        marginTop: 10,
    },
})
