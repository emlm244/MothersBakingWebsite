"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { impersonateRole } from "./sessionSlice";
import type { Role } from "@data";

export function useSession() {
  const session = useAppSelector((state) => state.session);
  const dispatch = useAppDispatch();

  return {
    session,
    impersonate(role: Role) {
      dispatch(impersonateRole(role));
    },
  };
}
