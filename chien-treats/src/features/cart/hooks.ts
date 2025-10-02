"use client";

import { useEffect, useMemo, useState } from "react";
import type { Coupon, Product } from "@data";
import { useDataProvider } from "@/lib/data-provider";
import { useAnalytics } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addItem,
  applyCoupon,
  removeItem,
  setContact as setContactAction,
  setShipping as setShippingAction,
  updateQuantity,
  clearCart as clearCartAction,
} from "./cartSlice";

export type ContactPayload = ReturnType<typeof setContactAction> extends { payload: infer P } ? P : never;
export type ShippingPayload = ReturnType<typeof setShippingAction> extends { payload: infer P } ? P : never;

export function useCart() {
  const cart = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const { track } = useAnalytics();

  return {
    cart,
    add(productId: string, quantity = 1) {
      dispatch(addItem({ productId, quantity }));
      track({ type: "add_to_cart", payload: { productId, qty: quantity } });
    },
    update(productId: string, quantity: number) {
      dispatch(updateQuantity({ productId, quantity }));
    },
    remove(productId: string) {
      dispatch(removeItem({ productId }));
    },
    setCoupon(code?: string) {
      dispatch(applyCoupon(code));
    },
    setContact(contact?: ContactPayload) {
      dispatch(setContactAction(contact));
    },
    setShipping(shipping?: ShippingPayload) {
      dispatch(setShippingAction(shipping));
    },
    clear() {
      dispatch(clearCartAction());
    },
  };
}

export interface CartLineSummary {
  product: Product;
  quantity: number;
  lineTotalCents: number;
}

export function useCartSummary() {
  const provider = useDataProvider();
  const { cart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!provider) return;

    async function load() {
      const [productList, couponList] = await Promise.all([
        provider.listProducts(),
        provider.listCoupons(),
      ]);
      if (cancelled) return;
      setProducts(productList);
      setCoupons(couponList);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [provider, cart.items.length]);

  const lines: CartLineSummary[] = useMemo(() => {
    return cart.items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        return {
          product,
          quantity: item.quantity,
          lineTotalCents: item.quantity * product.priceCents,
        };
      })
      .filter((line): line is CartLineSummary => Boolean(line));
  }, [cart.items, products]);

  const subtotalCents = lines.reduce((acc, line) => acc + line.lineTotalCents, 0);

  const appliedCoupon = useMemo(() => {
    if (!cart.couponCode) return undefined;
    return coupons.find((coupon) => coupon.code.toUpperCase() === cart.couponCode);
  }, [cart.couponCode, coupons]);

  const discountCents = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.amountOffCents) return appliedCoupon.amountOffCents;
    if (appliedCoupon.pctOff) {
      return Math.round(subtotalCents * (appliedCoupon.pctOff / 100));
    }
    return 0;
  }, [appliedCoupon, subtotalCents]);

  const taxCents = Math.round((subtotalCents - discountCents) * 0.08);
  const shippingCents = cart.shipping?.method === "delivery" ? 500 : 0;
  const totalCents = Math.max(0, subtotalCents - discountCents + taxCents + shippingCents);

  return {
    lines,
    subtotalCents,
    taxCents,
    shippingCents,
    discountCents,
    totalCents,
    formatted: {
      subtotal: formatCurrency(subtotalCents),
      tax: formatCurrency(taxCents),
      shipping: formatCurrency(shippingCents),
      discount: formatCurrency(discountCents),
      total: formatCurrency(totalCents),
    },
    appliedCoupon,
  };
}
