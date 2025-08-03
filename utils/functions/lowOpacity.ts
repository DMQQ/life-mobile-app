import Color from "color"

export default function lowOpacity(color: string, opacity: number = 0.15) {
    if (opacity === 0) return color

    opacity > 1 && (opacity = opacity / 100)

    const rgb = Color(color).rgb().array()

    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`
}
