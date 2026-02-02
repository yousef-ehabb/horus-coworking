import { configureStore } from '@reduxjs/toolkit';
import customersReducer from './slices/customersSlice';
import sessionsReducer from './slices/sessionsSlice';
import packagesReducer from './slices/packagesSlice';
import beveragesReducer from './slices/beveragesSlice';
import transactionsReducer from './slices/transactionsSlice';

const store = configureStore({
    reducer: {
        customers: customersReducer,
        sessions: sessionsReducer,
        packages: packagesReducer,
        beverages: beveragesReducer,
        transactions: transactionsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
