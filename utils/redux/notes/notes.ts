import { createSlice } from "@reduxjs/toolkit";

const notesSlice = createSlice({
  name: "notes",
  initialState: {
    isAuthenticated: false,
    notes: [],
  },
  reducers: {},
});

export const notesReducer = notesSlice.reducer;
export const notesActions = notesSlice.actions;
