import { createSlice } from '@reduxjs/toolkit';

const beveragesSlice = createSlice({
    name: 'beverages',
    initialState: {
        beverages: [],
    },
    reducers: {
        setBeverages: (state, action) => {
            state.beverages = action.payload;
        },
        addBeverage: (state, action) => {
            state.beverages.push(action.payload);
        },
        updateBeverage: (state, action) => {
            const index = state.beverages.findIndex(b => b.id === action.payload.id);
            if (index !== -1) {
                state.beverages[index] = action.payload;
            }
        },
    },
});

export const { setBeverages, addBeverage, updateBeverage } = beveragesSlice.actions;
export default beveragesSlice.reducer;
