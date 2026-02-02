import { createSlice } from '@reduxjs/toolkit';

const packagesSlice = createSlice({
    name: 'packages',
    initialState: {
        availablePackages: [],
        customerPackages: [],
    },
    reducers: {
        setAvailablePackages: (state, action) => {
            state.availablePackages = action.payload;
        },
        setCustomerPackages: (state, action) => {
            state.customerPackages = action.payload;
        },
        addPackage: (state, action) => {
            state.availablePackages.push(action.payload);
        },
        updatePackage: (state, action) => {
            const index = state.availablePackages.findIndex(p => p.id === action.payload.id);
            if (index !== -1) {
                state.availablePackages[index] = action.payload;
            }
        },
    },
});

export const { setAvailablePackages, setCustomerPackages, addPackage, updatePackage } = packagesSlice.actions;
export default packagesSlice.reducer;
