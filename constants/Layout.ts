import { Dimensions } from "react-native"

const window = Dimensions.get("window")

const screen = Dimensions.get("screen")

export const Padding = {
    xxs: 2.5,
    xs: 5,
    s: 7.5,
    m: 10,
    l: 15,
    xl: 20,
    xxl: 25,
}

export const Rounded = {
    ...Padding,
    full: 100,
    half: 50,
}

export default {
    window,
    screen,

    padding: 10,

    isSmallDevice: screen.width < 375,

    spacing: {
        mini: 2.5,
        small: 5,
        medium: 10,
        large: 15,
        extralarge: 20,
    },
}
