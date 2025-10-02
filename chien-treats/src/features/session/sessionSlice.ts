import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Role, User } from "@data";

export interface SessionState {
  role: Role;
  user?: User;
}

const initialState: SessionState = {
  role: "guest",
  user: undefined,
};

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    impersonateRole(state, action: PayloadAction<Role>) {
      state.role = action.payload;
    },
    setUser(state, action: PayloadAction<User | undefined>) {
      state.user = action.payload;
      state.role = action.payload?.role ?? "guest";
    },
  },
});

export const { impersonateRole, setUser } = sessionSlice.actions;

export default sessionSlice.reducer;
