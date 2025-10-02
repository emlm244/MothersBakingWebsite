import cartReducer, { addItem, clearCart } from "./cartSlice";

describe("cartSlice", () => {
  it("adds items to the cart", () => {
    const state = cartReducer(undefined, addItem({ productId: "prod_1", quantity: 2 }));
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual({ productId: "prod_1", quantity: 2 });
  });

  it("clears the cart", () => {
    const state = cartReducer({ items: [{ productId: "prod_1", quantity: 1 }], couponCode: undefined }, clearCart());
    expect(state.items).toHaveLength(0);
  });
});
