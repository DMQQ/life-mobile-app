import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SearchState {
    isActive: boolean
    value: string
}

const initialState: SearchState = {
    isActive: false,
    value: '',
}

// Store the current handler outside of Redux state to avoid serialization issues
let currentSearchHandler: ((value: string) => void) | null = null

export const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setSearchActive: (state, action: PayloadAction<boolean>) => {
            state.isActive = action.payload
            if (!action.payload) {
                state.value = ''
                if (currentSearchHandler) {
                    currentSearchHandler('')
                }
            }
        },
        setSearchValue: (state, action: PayloadAction<string>) => {
            state.value = action.payload
            if (currentSearchHandler) {
                currentSearchHandler(action.payload)
            }
        },
        clearSearch: (state) => {
            state.isActive = false
            state.value = ''
            if (currentSearchHandler) {
                currentSearchHandler('')
            }
        },
    },
})

// Action creator for setting the search handler (not stored in Redux)
export const setSearchHandler = (handler: (value: string) => void) => {
    currentSearchHandler = handler
    return { type: 'search/setSearchHandler' } // Dummy action for consistency
}

export const { setSearchActive, setSearchValue, clearSearch } = searchSlice.actions

export default searchSlice.reducer