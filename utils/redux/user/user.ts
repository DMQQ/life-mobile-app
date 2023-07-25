import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,

  user: null as null | { id: string; email: string },

  token: "",

  isLoading: true,
};

type S = typeof initialState;

export const userSlice = createSlice({
  initialState,
  name: "user",
  reducers: {
    loadUser(state: S, { payload }: { payload: any }) {
      state.user = payload.user;
      state.token = payload.token;
      state.isAuthenticated = true;

      state.isLoading = false;
    },
    removeUser(state: S) {
      state.isAuthenticated = false;
      state.user = null;
      state.isLoading = false;
      state.token = "";
    },

    notSigned(state) {
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
});

export const userActions = userSlice.actions;
