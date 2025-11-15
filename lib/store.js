import { configureStore, createSlice } from "@reduxjs/toolkit"

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isLoading: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    logout: (state) => {
      state.user = null
    },
  },
})

// Quotes slice
const quotesSlice = createSlice({
  name: "quotes",
  initialState: {
    quotes: [],
    isLoading: false,
    currentPage: 1,
    totalPages: 1,
  },
  reducers: {
    setQuotes: (state, action) => {
      state.quotes = action.payload
    },
    addQuote: (state, action) => {
      state.quotes.unshift(action.payload)
    },
    updateQuote: (state, action) => {
      const index = state.quotes.findIndex((q) => q._id === action.payload._id)
      if (index !== -1) {
        state.quotes[index] = action.payload
      }
    },
    deleteQuote: (state, action) => {
      state.quotes = state.quotes.filter((q) => q._id !== action.payload)
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload
    },
    setTotalPages: (state, action) => {
      state.totalPages = action.payload
    },
  },
})

const languageSlice = createSlice({
  name: "language",
  initialState: {
    selected: "en", // default
  },
  reducers: {
    setLanguage: (state, action) => {
      state.selected = action.payload
    },
  },
})



export const { setUser, setLoading: setAuthLoading, logout } = authSlice.actions
export const {
  setQuotes,
  addQuote,
  updateQuote,
  deleteQuote,
  setLoading: setQuotesLoading,
  setCurrentPage,
  setTotalPages,
} = quotesSlice.actions

export const { setLanguage } = languageSlice.actions

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    quotes: quotesSlice.reducer,
    language: languageSlice.reducer,
  },
})
