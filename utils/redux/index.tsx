import { configureStore } from "@reduxjs/toolkit"
import { TypedUseSelectorHook, useSelector, useDispatch } from "react-redux"
import { userSlice } from "./user/user"
import { workoutSlice } from "./workout/workout"
import { searchSlice } from "./search/search"

export const store = configureStore({
    reducer: {
        user: userSlice.reducer,
        workout: workoutSlice.reducer,
        search: searchSlice.reducer,
    },
})

type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>()
