import { createSlice } from '@reduxjs/toolkit';

const transactionsSlice = createSlice({
    name: 'transactions',
    initialState: {
        transactions: [],
    },
    reducers: {
        setTransactions: (state, action) => {
            state.transactions = action.payload;
        },
        addTransaction: (state, action) => {
            state.transactions.unshift(action.payload);
        },
    },
});

export const { setTransactions, addTransaction } = transactionsSlice.actions;
export default transactionsSlice.reducer;
