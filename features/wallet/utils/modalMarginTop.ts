import Layout from "@/constants/Layout"

export default function getModalMarginTop(str: string, baseFontSize = 50) {
    if (!str) return 200

    const length = str.length

    const fontSize = length > 25 ? 40 : baseFontSize

    const availableWidth = Layout.screen.width - 30

    const avgCharWidth = fontSize * 0.55

    const charactersPerLine = Math.floor(availableWidth / avgCharWidth)
    const numberOfLines = Math.max(1, Math.ceil(length / charactersPerLine))

    const lineHeight = fontSize + 7.5

    const titleHeight = numberOfLines * lineHeight

    const baseHeaderHeight = 200

    return baseHeaderHeight + titleHeight + 30
}
