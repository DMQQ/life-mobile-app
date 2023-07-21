import { configureStore } from "@reduxjs/toolkit";
import { useSelector, TypedUseSelectorHook } from "react-redux";
import { userSlice } from "./user/user";
import { workoutSlice } from "./workout/workout";

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    workout: workoutSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
