import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartLineItem {
  productId: string;
  quantity: number;
}

export type ShippingMethod = "pickup" | "delivery";

export interface CartContact {
  name: string;
  email: string;
  phone?: string;
}

export interface CartState {
  items: CartLineItem[];
  couponCode?: string;
  shipping?: {
    method: ShippingMethod;
    address?: string;
    date?: string;
  };
  contact?: CartContact;
}

const initialState: CartState = {
  items: [],
};

function upsertLine(items: CartLineItem[], payload: CartLineItem) {
  const existing = items.find((item) => item.productId === payload.productId);
  if (existing) {
    existing.quantity = Math.max(1, payload.quantity);
  } else {
    items.push({ ...payload, quantity: Math.max(1, payload.quantity) });
  }
}

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<{ productId: string; quantity?: number }>) {
      upsertLine(state.items, {
        productId: action.payload.productId,
        quantity: action.payload.quantity ?? 1,
      });
    },
    updateQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      upsertLine(state.items, action.payload);
    },
    removeItem(state, action: PayloadAction<{ productId: string }>) {
      state.items = state.items.filter((item) => item.productId !== action.payload.productId);
    },
    clearCart(state) {
      state.items = [];
      state.couponCode = undefined;
      state.contact = undefined;
      state.shipping = undefined;
    },
    applyCoupon(state, action: PayloadAction<string | undefined>) {
      state.couponCode = action.payload?.trim().toUpperCase() || undefined;
    },
    setContact(state, action: PayloadAction<CartContact | undefined>) {
      state.contact = action.payload;
    },
    setShipping(state, action: PayloadAction<CartState["shipping"] | undefined>) {
      state.shipping = action.payload;
    },
  },
});

export const { addItem, updateQuantity, removeItem, clearCart, applyCoupon, setContact, setShipping } = cartSlice.actions;

export default cartSlice.reducer;
