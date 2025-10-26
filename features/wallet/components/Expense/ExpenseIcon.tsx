import Colors from "@/constants/Colors"
import lowOpacity from "@/utils/functions/lowOpacity"
import { AntDesign, Entypo, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import React from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"

export const Icons = {
    // Original categories - preserved for backward compatibility
    housing: {
        icon: <AntDesign name="home" size={20} color={"#05ad21"} />,
        backgroundColor: "#05ad21",
    },
    transportation: {
        icon: <AntDesign name="car" size={20} color={"#ab0505"} />,
        backgroundColor: "#ab0505",
    },
    food: {
        icon: <Ionicons name="fast-food-outline" color={"#5733FF"} size={20} />,
        backgroundColor: "#5733FF",
    },
    drinks: {
        icon: <Ionicons name="beer-outline" color={"#ff774f"} size={20} />,
        backgroundColor: "#ff774f",
    },
    shopping: {
        icon: <MaterialCommunityIcons name="shopping" size={20} color={"#ff5733"} />,
        backgroundColor: "#ff5733",
    },
    addictions: {
        icon: <MaterialCommunityIcons name="smoking" size={20} color={"#ff5733"} />,
        backgroundColor: "#ff5733",
    },
    work: {
        icon: <MaterialCommunityIcons name="briefcase" size={20} color={"#5733ff"} />,
        backgroundColor: "#5733FF",
    },
    clothes: {
        icon: <MaterialCommunityIcons name="tshirt-crew" size={20} color={"#ff5733"} />,
        backgroundColor: "#ff5733",
    },
    health: {
        icon: <MaterialCommunityIcons name="pill" size={20} color={"#07bab4"} />,
        backgroundColor: "#07bab4",
    },
    entertainment: {
        icon: <MaterialCommunityIcons name="movie-open" size={20} color={"#990583"} />,
        backgroundColor: "#990583",
    },
    utilities: {
        icon: <MaterialCommunityIcons name="power-plug-outline" size={20} color={"#5733ff"} />,
        backgroundColor: "#5733FF",
    },
    debt: {
        icon: <AntDesign name="creditcard" size={20} color={"#ff5733"} />,
        backgroundColor: "#FF5733",
    },
    education: {
        icon: <AntDesign name="book" size={20} color={"#cc9a1b"} />,
        backgroundColor: "#cc9a1b",
    },
    savings: {
        icon: <Ionicons name="cash-outline" size={20} color="#cf0a80" />,
        backgroundColor: "#cf0a80",
    },
    travel: {
        icon: <Ionicons name="airplane-outline" size={20} color="#33FF57" />,
        backgroundColor: "#33FF57",
    },
    edit: {
        icon: <Ionicons name="create" color={Colors.foreground} size={20} />,
        backgroundColor: "gray",
    },
    income: {
        icon: <FontAwesome5 name="dollar-sign" size={20} color={Colors.secondary_light_1} />,
        backgroundColor: Colors.secondary_light_1,
    },
    animals: {
        icon: <FontAwesome5 name="dog" size={20} color="#ff5733" />,
        backgroundColor: "#ff5733",
    },
    refunded: {
        icon: <Entypo name="back-in-time" color={Colors.secondary_light_2} size={20} />,
        backgroundColor: Colors.secondary_light_1,
    },
    gifts: {
        icon: <MaterialCommunityIcons name="gift" size={20} color="#33FF57" />,
        backgroundColor: "#33FF57",
    },
    "gifts:birthday": {
        icon: <MaterialCommunityIcons name="cake-variant" size={20} color="#33ffd4" />,
        backgroundColor: "#33ffd4",
    },
    "gifts:holiday": {
        icon: <MaterialCommunityIcons name="pine-tree" size={20} color="#33ffd4" />,
        backgroundColor: "#33ffd4",
    },
    "gifts:charitable": {
        icon: <MaterialCommunityIcons name="heart-circle" size={20} color="#33ffd4" />,
        backgroundColor: "#33ffd4",
    },

    sports: {
        icon: <MaterialCommunityIcons name="weight-lifter" size={20} color="#4CAF50" />,
        backgroundColor: "#4CAF50",
    },
    "sports:equipment": {
        icon: <MaterialCommunityIcons name="tennis" size={20} color="#4CAF50" />,
        backgroundColor: "#4CAF50",
    },
    "sports:memberships": {
        icon: <MaterialCommunityIcons name="card-account-details" size={20} color="#4CAF50" />,
        backgroundColor: "#4CAF50",
    },
    "sports:events": {
        icon: <MaterialCommunityIcons name="ticket" size={20} color="#4CAF50" />,
        backgroundColor: "#4CAF50",
    },

    tech: {
        icon: <MaterialCommunityIcons name="devices" size={20} color="#0288D1" />,
        backgroundColor: "#0288D1",
    },
    "tech:software": {
        icon: <MaterialCommunityIcons name="application" size={20} color="#0288D1" />,
        backgroundColor: "#0288D1",
    },
    "tech:accessories": {
        icon: <MaterialCommunityIcons name="headphones" size={20} color="#0288D1" />,
        backgroundColor: "#0288D1",
    },
    "tech:repairs": {
        icon: <MaterialCommunityIcons name="wrench" size={20} color="#0288D1" />,
        backgroundColor: "#0288D1",
    },

    goingout: {
        icon: <MaterialCommunityIcons name="party-popper" size={20} color="#9C27B0" />,
        backgroundColor: "#9C27B0",
    },
    "goingout:dining": {
        icon: <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#9C27B0" />,
        backgroundColor: "#9C27B0",
    },
    "goingout:nightlife": {
        icon: <MaterialCommunityIcons name="glass-cocktail" size={20} color="#9C27B0" />,
        backgroundColor: "#9C27B0",
    },
    "goingout:events": {
        icon: <MaterialCommunityIcons name="ticket-confirmation" size={20} color="#9C27B0" />,
        backgroundColor: "#9C27B0",
    },

    trips: {
        icon: <MaterialCommunityIcons name="bag-suitcase" size={20} color="#FF9800" />,
        backgroundColor: "#FF9800",
    },
    "trips:lodging": {
        icon: <MaterialCommunityIcons name="home-city" size={20} color="#FF9800" />,
        backgroundColor: "#FF9800",
    },
    "trips:activities": {
        icon: <MaterialCommunityIcons name="hiking" size={20} color="#FF9800" />,
        backgroundColor: "#FF9800",
    },
    "trips:transportation": {
        icon: <MaterialCommunityIcons name="train-car" size={20} color="#FF9800" />,
        backgroundColor: "#FF9800",
    },

    subscriptions: {
        icon: <MaterialCommunityIcons name="refresh" size={20} color="#8033ff" />,
        backgroundColor: "#8033ff",
    },
    investments: {
        icon: <MaterialCommunityIcons name="chart-line" size={20} color="#33ff89" />,
        backgroundColor: "#33ff89",
    },
    maintenance: {
        icon: <MaterialCommunityIcons name="tools" size={20} color="#ff8c33" />,
        backgroundColor: "#ff8c33",
    },
    insurance: {
        icon: <MaterialCommunityIcons name="shield-check" size={20} color="#3357ff" />,
        backgroundColor: "#3357ff",
    },
    taxes: {
        icon: <MaterialCommunityIcons name="file-document" size={20} color="#ff3333" />,
        backgroundColor: "#ff3333",
    },
    children: {
        icon: <MaterialCommunityIcons name="baby-face" size={20} color="#ff33d1" />,
        backgroundColor: "#ff33d1",
    },
    donations: {
        icon: <MaterialCommunityIcons name="hand-heart" size={20} color="#33ffd4" />,
        backgroundColor: "#33ffd4",
    },
    beauty: {
        icon: <MaterialCommunityIcons name="face-woman" size={20} color="#ff33a1" />,
        backgroundColor: "#ff33a1",
    },
    pets: {
        icon: <MaterialCommunityIcons name="cat" size={20} color="#827717" />,
        backgroundColor: "#827717",
    },

    // Also keep standalone categories for backward compatibility
    weed: {
        icon: <MaterialCommunityIcons name="cannabis" size={20} color="#01796F" />,
        backgroundColor: "#01796F",
    },
    alcohol: {
        icon: <MaterialCommunityIcons name="glass-wine" size={20} color="#8B0000" />,
        backgroundColor: "#8B0000",
    },
    vape: {
        icon: <MaterialCommunityIcons name="smoking-pipe" size={20} color="#4A0404" />,
        backgroundColor: "#4A0404",
    },
    tattoos: {
        icon: <MaterialCommunityIcons name="needle" size={20} color="#111111" />,
        backgroundColor: "#111111",
    },
    dating: {
        icon: <MaterialCommunityIcons name="heart" size={20} color="#E91E63" />,
        backgroundColor: "#E91E63",
    },
    gambling: {
        icon: <MaterialCommunityIcons name="dice-multiple" size={20} color="#4B0082" />,
        backgroundColor: "#4B0082",
    },
    fastFood: {
        icon: <MaterialCommunityIcons name="hamburger" size={20} color="#D84315" />,
        backgroundColor: "#D84315",
    },
    videoGames: {
        icon: <MaterialCommunityIcons name="gamepad-variant" size={20} color="#311B92" />,
        backgroundColor: "#311B92",
    },
    streaming: {
        icon: <MaterialCommunityIcons name="youtube-subscription" size={20} color="#FF0000" />,
        backgroundColor: "#FF0000",
    },
    concerts: {
        icon: <MaterialCommunityIcons name="music" size={20} color="#6200EA" />,
        backgroundColor: "#6200EA",
    },
    haircuts: {
        icon: <MaterialCommunityIcons name="content-cut" size={20} color="#880E4F" />,
        backgroundColor: "#880E4F",
    },
    "health:therapy": {
        icon: <MaterialCommunityIcons name="head-heart" size={20} color="#006064" />,
        backgroundColor: "#006064",
    },
    "health:gym": {
        icon: <MaterialCommunityIcons name="dumbbell" size={20} color="#FF6F00" />,
        backgroundColor: "#FF6F00",
    },
    "health:skincare": {
        icon: <MaterialCommunityIcons name="lotion" size={20} color="#F48FB1" />,
        backgroundColor: "#F48FB1",
    },
    "health:dentist": {
        icon: <MaterialCommunityIcons name="tooth" size={20} color="#0D47A1" />,
        backgroundColor: "#0D47A1",
    },
    emergencies: {
        icon: <MaterialCommunityIcons name="alert-circle" size={20} color="#D50000" />,
        backgroundColor: "#D50000",
    },
    carRepair: {
        icon: <MaterialCommunityIcons name="car-wrench" size={20} color="#3E2723" />,
        backgroundColor: "#3E2723",
    },
    "transporation:parking": {
        icon: <MaterialCommunityIcons name="parking" size={20} color="#01579B" />,
        backgroundColor: "#01579B",
    },

    // Hierarchical subcategories
    "housing:rent": {
        icon: <MaterialCommunityIcons name="home-city" size={20} color={"#05ad21"} />,
        backgroundColor: "#05ad21",
    },
    "housing:mortgage": {
        icon: <MaterialCommunityIcons name="bank" size={20} color={"#05ad21"} />,
        backgroundColor: "#05ad21",
    },
    "housing:utilities": {
        icon: <MaterialCommunityIcons name="power-plug-outline" size={20} color={"#05ad21"} />,
        backgroundColor: "#05ad21",
    },
    "housing:furniture": {
        icon: <MaterialCommunityIcons name="sofa" size={20} color={"#05ad21"} />,
        backgroundColor: "#05ad21",
    },

    "transportation:gas": {
        icon: <MaterialCommunityIcons name="gas-station" size={20} color={"#ab0505"} />,
        backgroundColor: "#ab0505",
    },
    "transportation:repair": {
        icon: <MaterialCommunityIcons name="car-wrench" size={20} color={"#ab0505"} />,
        backgroundColor: "#ab0505",
    },
    "transportation:parking": {
        icon: <MaterialCommunityIcons name="parking" size={20} color={"#ab0505"} />,
        backgroundColor: "#ab0505",
    },
    "transportation:public": {
        icon: <MaterialCommunityIcons name="bus" size={20} color={"#ab0505"} />,
        backgroundColor: "#ab0505",
    },
    "transportation:taxi": {
        icon: <MaterialCommunityIcons name="taxi" size={20} color={"#ab0505"} />,
        backgroundColor: "#ab0505",
    },

    "food:groceries": {
        icon: <MaterialCommunityIcons name="cart" size={20} color={"#5733FF"} />,
        backgroundColor: "#5733FF",
    },
    "food:restaurant": {
        icon: <MaterialCommunityIcons name="silverware-fork-knife" size={20} color={"#5733FF"} />,
        backgroundColor: "#5733FF",
    },
    "food:fastfood": {
        icon: <MaterialCommunityIcons name="hamburger" size={20} color={"#5733FF"} />,
        backgroundColor: "#5733FF",
    },
    "food:delivery": {
        icon: <MaterialCommunityIcons name="moped" size={20} color={"#5733FF"} />,
        backgroundColor: "#5733FF",
    },

    "drinks:coffee": {
        icon: <MaterialCommunityIcons name="coffee" size={20} color={"#5733FF"} />,
        backgroundColor: "#5733FF",
    },
    "drinks:alcohol": {
        icon: <MaterialCommunityIcons name="glass-wine" size={20} color={"#5733FF"} />,
        backgroundColor: "#5733FF",
    },
    "drinks:beer": {
        icon: <MaterialCommunityIcons name="beer" size={20} color={"#5733FF"} />,
        backgroundColor: "#5733FF",
    },
    "drinks:softdrinks": {
        icon: <MaterialCommunityIcons name="bottle-soda" size={20} color={"#5733FF"} />,
        backgroundColor: "#5733FF",
    },

    "drinks:energy drinks": {
        icon: <MaterialCommunityIcons name="bottle-tonic" size={20} color={"#5733FF"} />,
        backgroundColor: "#5733FF",
    },

    "shopping:clothes": {
        icon: <MaterialCommunityIcons name="tshirt-crew" size={20} color={"#ff5733"} />,
        backgroundColor: "#ff5733",
    },
    "shopping:electronics": {
        icon: <MaterialCommunityIcons name="television" size={20} color={"#ff5733"} />,
        backgroundColor: "#ff5733",
    },
    "shopping:gifts": {
        icon: <MaterialCommunityIcons name="gift" size={20} color={"#ff5733"} />,
        backgroundColor: "#ff5733",
    },
    "shopping:online": {
        icon: <MaterialCommunityIcons name="cart-outline" size={20} color={"#ff5733"} />,
        backgroundColor: "#ff5733",
    },

    "addictions:tobacco": {
        icon: <MaterialCommunityIcons name="cigar" size={20} color={"#ff5733"} />,
        backgroundColor: "#ff5733",
    },
    "addictions:vape": {
        icon: <MaterialCommunityIcons name="smoking-pipe" size={20} color={"#ff5733"} />,
        backgroundColor: "#ff5733",
    },
    "addictions:weed": {
        icon: <MaterialCommunityIcons name="cannabis" size={20} color={"#ff5733"} />,
        backgroundColor: "#ff5733",
    },
    "addictions:gambling": {
        icon: <MaterialCommunityIcons name="poker-chip" size={20} color={"#ff5733"} />,
        backgroundColor: "#ff5733",
    },

    "entertainment:movies": {
        icon: <MaterialCommunityIcons name="filmstrip" size={20} color={"#990583"} />,
        backgroundColor: "#990583",
    },
    "entertainment:concerts": {
        icon: <MaterialCommunityIcons name="music" size={20} color={"#990583"} />,
        backgroundColor: "#990583",
    },
    "entertainment:sports": {
        icon: <MaterialCommunityIcons name="basketball" size={20} color={"#990583"} />,
        backgroundColor: "#990583",
    },
    "entertainment:games": {
        icon: <MaterialCommunityIcons name="gamepad-variant" size={20} color={"#990583"} />,
        backgroundColor: "#990583",
    },
    "entertainment:streaming": {
        icon: <MaterialCommunityIcons name="youtube-subscription" size={20} color={"#990583"} />,
        backgroundColor: "#990583",
    },
    "entertainment:dating": {
        icon: <MaterialCommunityIcons name="heart" size={20} color={"#990583"} />,
        backgroundColor: "#990583",
    },

    "health:doctor": {
        icon: <MaterialCommunityIcons name="stethoscope" size={20} color={"#07bab4"} />,
        backgroundColor: "#07bab4",
    },
    "health:medicine": {
        icon: <MaterialCommunityIcons name="pill" size={20} color={"#07bab4"} />,
        backgroundColor: "#07bab4",
    },
    "beauty:haircuts": {
        icon: <MaterialCommunityIcons name="content-cut" size={20} color="#ff33a1" />,
        backgroundColor: "#ff33a1",
    },
    "beauty:skincare": {
        icon: <MaterialCommunityIcons name="lotion" size={20} color="#ff33a1" />,
        backgroundColor: "#ff33a1",
    },
    "beauty:makeup": {
        icon: <MaterialCommunityIcons name="lipstick" size={20} color="#ff33a1" />,
        backgroundColor: "#ff33a1",
    },
    "beauty:spa": {
        icon: <MaterialCommunityIcons name="spa" size={20} color="#ff33a1" />,
        backgroundColor: "#ff33a1",
    },
    "beauty:tattoos": {
        icon: <MaterialCommunityIcons name="needle" size={20} color="#ff33a1" />,
        backgroundColor: "#ff33a1",
    },

    "work:supplies": {
        icon: <MaterialCommunityIcons name="office-building" size={20} color={"#5733ff"} />,
        backgroundColor: "#5733ff",
    },
    "work:equipment": {
        icon: <MaterialCommunityIcons name="laptop" size={20} color={"#5733ff"} />,
        backgroundColor: "#5733ff",
    },
    "work:commute": {
        icon: <MaterialCommunityIcons name="train-car" size={20} color={"#5733ff"} />,
        backgroundColor: "#5733ff",
    },

    "education:tuition": {
        icon: <MaterialCommunityIcons name="school" size={20} color={"#cc9a1b"} />,
        backgroundColor: "#cc9a1b",
    },
    "education:books": {
        icon: <MaterialCommunityIcons name="book-open-variant" size={20} color={"#cc9a1b"} />,
        backgroundColor: "#cc9a1b",
    },
    "education:courses": {
        icon: <MaterialCommunityIcons name="certificate" size={20} color={"#cc9a1b"} />,
        backgroundColor: "#cc9a1b",
    },

    "travel:flights": {
        icon: <MaterialCommunityIcons name="airplane" size={20} color="#33FF57" />,
        backgroundColor: "#33FF57",
    },
    "travel:hotels": {
        icon: <MaterialCommunityIcons name="bed" size={20} color="#33FF57" />,
        backgroundColor: "#33FF57",
    },
    "travel:rental": {
        icon: <MaterialCommunityIcons name="car-estate" size={20} color="#33FF57" />,
        backgroundColor: "#33FF57",
    },
    "travel:activities": {
        icon: <MaterialCommunityIcons name="map-marker" size={20} color="#33FF57" />,
        backgroundColor: "#33FF57",
    },

    "pets:food": {
        icon: <MaterialCommunityIcons name="food-variant" size={20} color="#827717" />,
        backgroundColor: "#827717",
    },
    "pets:vet": {
        icon: <MaterialCommunityIcons name="medical-bag" size={20} color="#827717" />,
        backgroundColor: "#827717",
    },
    "pets:supplies": {
        icon: <MaterialCommunityIcons name="paw" size={20} color="#827717" />,
        backgroundColor: "#827717",
    },

    "subscriptions:software": {
        icon: <MaterialCommunityIcons name="microsoft" size={20} color="#8033ff" />,
        backgroundColor: "#8033ff",
    },
    "subscriptions:media": {
        icon: <MaterialCommunityIcons name="netflix" size={20} color="#8033ff" />,
        backgroundColor: "#8033ff",
    },
    "subscriptions:news": {
        icon: <MaterialCommunityIcons name="newspaper" size={20} color="#8033ff" />,
        backgroundColor: "#8033ff",
    },
    "subscriptions:membership": {
        icon: <MaterialCommunityIcons name="card-account-details" size={20} color="#8033ff" />,
        backgroundColor: "#8033ff",
    },

    "taxes:income": {
        icon: <MaterialCommunityIcons name="cash-lock" size={20} color="#ff3333" />,
        backgroundColor: "#ff3333",
    },
    "taxes:property": {
        icon: <MaterialCommunityIcons name="home-city" size={20} color="#ff3333" />,
        backgroundColor: "#ff3333",
    },

    "debt:credit": {
        icon: <MaterialCommunityIcons name="credit-card" size={20} color={"#ff5733"} />,
        backgroundColor: "#ff5733",
    },
    "debt:loan": {
        icon: <MaterialCommunityIcons name="bank" size={20} color={"#ff5733"} />,
        backgroundColor: "#ff5733",
    },
    "debt:student": {
        icon: <MaterialCommunityIcons name="school" size={20} color={"#ff5733"} />,
        backgroundColor: "#ff5733",
    },

    "savings:emergency": {
        icon: <MaterialCommunityIcons name="piggy-bank" size={20} color="#cf0a80" />,
        backgroundColor: "#cf0a80",
    },
    "savings:retirement": {
        icon: <MaterialCommunityIcons name="home-heart" size={20} color="#cf0a80" />,
        backgroundColor: "#cf0a80",
    },

    "investments:stocks": {
        icon: <MaterialCommunityIcons name="chart-timeline-variant" size={20} color="#33ff89" />,
        backgroundColor: "#33ff89",
    },
    "investments:crypto": {
        icon: <MaterialCommunityIcons name="bitcoin" size={20} color="#33ff89" />,
        backgroundColor: "#33ff89",
    },
    "investments:property": {
        icon: <MaterialCommunityIcons name="domain" size={20} color="#33ff89" />,
        backgroundColor: "#33ff89",
    },

    "children:toys": {
        icon: <MaterialCommunityIcons name="teddy-bear" size={20} color="#ff33d1" />,
        backgroundColor: "#ff33d1",
    },
    "children:education": {
        icon: <MaterialCommunityIcons name="school" size={20} color="#ff33d1" />,
        backgroundColor: "#ff33d1",
    },
    "children:activities": {
        icon: <MaterialCommunityIcons name="human-male-child" size={20} color="#ff33d1" />,
        backgroundColor: "#ff33d1",
    },

    "donations:charity": {
        icon: <MaterialCommunityIcons name="charity" size={20} color="#33ffd4" />,
        backgroundColor: "#33ffd4",
    },
    "donations:religious": {
        icon: <MaterialCommunityIcons name="church" size={20} color="#33ffd4" />,
        backgroundColor: "#33ffd4",
    },

    "income:salary": {
        icon: <MaterialCommunityIcons name="cash-multiple" size={20} color={Colors.secondary_light_1} />,
        backgroundColor: Colors.secondary_light_1,
    },
    "income:bonus": {
        icon: <MaterialCommunityIcons name="gift" size={20} color={Colors.secondary_light_1} />,
        backgroundColor: Colors.secondary_light_1,
    },
    "income:freelance": {
        icon: <MaterialCommunityIcons name="briefcase-outline" size={20} color={Colors.secondary_light_1} />,
        backgroundColor: Colors.secondary_light_1,
    },
    "income:dividends": {
        icon: <MaterialCommunityIcons name="chart-areaspline" size={20} color={Colors.secondary_light_1} />,
        backgroundColor: Colors.secondary_light_1,
    },
    bell: {
        icon: <MaterialCommunityIcons name="bell" size={20} color={Colors.secondary_light_1} />,
        backgroundColor: Colors.secondary_light_1,
    },

    none: {
        icon: <Ionicons name="add" color={Colors.secondary} size={20} />,
        backgroundColor: Colors.primary,
    },
}

const getCategoryName = (category: string) => {
    return category.split(":").pop()?.replace(/_/g, " ") || ""
}

const getCategoryIcon = (category: string) => {
    const icon = Icons[category as keyof typeof Icons]

    if (icon) {
        return icon.icon
    } else {
        return Icons.none.icon
    }
}

const getCategoryParent = (category: string) => {
    return category?.split?.(":")?.shift?.()?.replace(/_/g, " ") || ""
}

export const CategoryUtils = {
    getCategoryName,
    getCategoryIcon,
    getCategoryParent,
}

function getCategory(props: { category: string; type: "income" | "expense" | "refunded" }) {
    let category = props.category || "none"

    if (props.category === "edit") {
        category = "edit"
    } else if (props.type === "income") {
        category = "income"
    } else if (props.type === "refunded") {
        category = "refunded"
    }
    return category as keyof typeof Icons
}

export const CategoryIcon = (props: {
    category: keyof typeof Icons
    type: "income" | "expense" | "refunded"
    clear?: boolean
    size?: number
    style?: StyleProp<ViewStyle>
}) => {
    const category = getCategory(props)

    const backgroundColor = Icons[category]?.backgroundColor

    return (
        <View style={[styles.icon_container, props.style]}>
            <View
                style={[
                    styles.iconContainer,
                    {
                        backgroundColor: !props.clear ? lowOpacity(backgroundColor, 15) : undefined,
                        borderWidth: !props.clear ? 1 : 0,
                        borderColor: !props.clear ? lowOpacity(backgroundColor, 20) : undefined,
                    },
                ]}
            >
                {Icons[category]?.icon &&
                    React.cloneElement(Icons[category]?.icon, {
                        size: props.size || 20,
                        style: [styles.clonedIcon, { shadowColor: backgroundColor ?? "#000" }],
                    })}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    iconContainer: {
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 100,
        height: 40,
        width: 40,
    },

    icon_container: {
        padding: 7.5,
        justifyContent: "center",
        position: "relative",
    },

    clonedIcon: {
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.7,
        shadowRadius: 16.0,

        elevation: 24,
    },
})
