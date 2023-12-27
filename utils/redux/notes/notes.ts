import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";

type Note = {
  id: number;
  content: string;
  secure: boolean;
  createdAt: string;
  updatedAt: string;
};

export const notesSlice = createSlice({
  name: "notes",
  initialState: {
    isAuthenticated: false,
    notes: [] as Note[],
  },
  reducers: {
    createNote(state, { payload }) {
      state.notes.push({
        id: Date.now(),
        content: payload.content,
        secure: payload.secure,
        createdAt: new Date().toLocaleDateString(),
        updatedAt: new Date().toLocaleDateString(),
      });

      SecureStore.setItemAsync("notes", JSON.stringify(state.notes));
    },

    removeNote(state, { payload }) {
      state.notes = state.notes.filter((n) => n.id !== payload);

      SecureStore.setItemAsync("notes", JSON.stringify(state.notes));
    },

    editNote(
      state,
      {
        payload,
      }: PayloadAction<{ noteId: number; content: string; secure: boolean }>
    ) {
      let note = state.notes.findIndex((note) => note.id === payload.noteId);

      if (note > 0) {
        state.notes[note] = {
          ...state.notes[note],
          id: payload.noteId,
          content: payload.content,
          secure: payload.secure,
        };

        SecureStore.setItemAsync("notes", JSON.stringify(state.notes));
      }
    },
  },

  extraReducers(builder) {
    builder.addCase(loadNotes.fulfilled, (state, { payload }) => {
      state.notes = payload;
    });
  },
});

export const loadNotes = createAsyncThunk("loadnote/notes", async () => {
  const notesJSON = await SecureStore.getItemAsync("notes");

  const notesPARSED = await JSON.parse(notesJSON || "[]");

  return notesPARSED;
});

export const notesReducer = notesSlice.reducer;
export const notesActions = notesSlice.actions;
