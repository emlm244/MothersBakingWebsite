import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "@/features/cart/cartSlice";
import sessionReducer from "@/features/session/sessionSlice";
import ticketingReducer from "@/features/ticketing/ticketingSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    session: sessionReducer,
    ticketing: ticketingReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
