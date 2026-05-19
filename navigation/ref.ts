import { NavigationContainerRef } from "@react-navigation/native"
import React from "react"
import { RootStackParamList } from "../types"

export const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>()
