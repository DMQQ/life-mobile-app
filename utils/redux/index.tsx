import { configureStore } from "@reduxjs/toolkit"
import { TypedUseSelectorHook, useSelector } from "react-redux"
import { userSlice } from "./user/user"
import { workoutSlice } from "./workout/workout"

export const store = configureStore({
    reducer: {
        user: userSlice.reducer,
        workout: workoutSlice.reducer,
    },
})

type RootState = ReturnType<typeof store.getState>

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
