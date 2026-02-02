import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    activeSessions: [],
    sessionHistory: [],
    loading: false,
    error: null,
};

const sessionsSlice = createSlice({
    name: 'sessions',
    initialState,
    reducers: {
        setActiveSessions: (state, action) => {
            state.activeSessions = action.payload;
        },
        setSessionHistory: (state, action) => {
            state.sessionHistory = action.payload;
        },
        addSession: (state, action) => {
            state.activeSessions.push(action.payload);
        },
        updateSession: (state, action) => {
            const index = state.activeSessions.findIndex(s => s.id === action.payload.id);
            if (index !== -1) {
                state.activeSessions[index] = { ...state.activeSessions[index], ...action.payload };
            }
        },
        removeSession: (state, action) => {
            state.activeSessions = state.activeSessions.filter(s => s.id !== action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const {
    setActiveSessions,
    setSessionHistory,
    addSession,
    updateSession,
    removeSession,
    setLoading,
    setError
} = sessionsSlice.actions;

export default sessionsSlice.reducer;
