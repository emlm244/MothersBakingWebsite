import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { restProvider } from "../../../packages/data/rest-provider";

// Development bypass: Skip auth when no backend is configured
const DEV_BYPASS = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_API_URL === undefined;

interface AuthState {
  user: {
    id: string;
    email: string;
    name: string;
    role: "guest" | "customer" | "staff" | "support" | "admin";
    emailVerifiedAt: string | null;
  } | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  verification: {
    requesting: boolean;
    requested: boolean;
    error: string | null;
  };
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  verification: {
    requesting: false,
    requested: false,
    error: null,
  },
};

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Development mode: Return mock user without backend
      if (DEV_BYPASS) {
        return {
          user: {
            id: "dev-user",
            email: email,
            name: "Dev User",
            role: "admin" as const,
            emailVerifiedAt: new Date().toISOString(),
          },
          token: "dev-token",
        };
      }

      const result = await restProvider.login(email, password);
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      return rejectWithValue(message);
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async ({ name, email, password }: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      // Development mode: Return mock user without backend
      if (DEV_BYPASS) {
        return {
          user: {
            id: "dev-user",
            email: email,
            name: name,
            role: "admin" as const,
            emailVerifiedAt: new Date().toISOString(),
          },
          token: "dev-token",
        };
      }

      const result = await restProvider.register(name, email, password);
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Registration failed";
      return rejectWithValue(message);
    }
  }
);

export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      // Development mode: No persistent user to load
      if (DEV_BYPASS) {
        return rejectWithValue("No backend authentication in development mode");
      }

      const user = await restProvider.getCurrentUser();
      if (!user) {
        throw new Error("Not authenticated");
      }
      return { user };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to load user";
      return rejectWithValue(message);
    }
  }
);

export const requestEmailVerification = createAsyncThunk(
  "auth/requestEmailVerification",
  async (_, { getState, rejectWithValue }) => {
    try {
      // Development mode: Skip verification email
      if (DEV_BYPASS) {
        const state = getState() as { auth: AuthState };
        const email = state.auth.user?.email;
        return { email: email || "dev@local" };
      }

      const state = getState() as { auth: AuthState };
      const email = state.auth.user?.email;
      if (!email) {
        throw new Error("You need to sign in first");
      }
      await restProvider.requestEmailVerification(email);
      return { email };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to send verification email";
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      // Only call REST provider logout if not in development mode
      if (!DEV_BYPASS) {
        restProvider.logout();
      }
      state.user = null;
      state.token = null;
      state.error = null;
      state.verification = { requesting: false, requested: false, error: null };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetVerification: (state) => {
      state.verification = { requesting: false, requested: false, error: null };
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...action.payload.user,
          emailVerifiedAt: action.payload.user.emailVerifiedAt ?? null,
        };
        state.token = action.payload.token;
        state.error = null;
        state.verification = {
          requesting: false,
          requested: Boolean(action.payload.user.emailVerifiedAt),
          error: null,
        };
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === "string" ? action.payload : "Login failed";
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...action.payload.user,
          emailVerifiedAt: action.payload.user.emailVerifiedAt ?? null,
        };
        state.token = action.payload.token;
        state.error = null;
        state.verification.requested = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === "string" ? action.payload : "Registration failed";
      });

    // Load user
    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...action.payload.user,
          emailVerifiedAt: action.payload.user.emailVerifiedAt ?? null,
        };
        state.verification.requested = Boolean(action.payload.user.emailVerifiedAt);
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      });

    builder
      .addCase(requestEmailVerification.pending, (state) => {
        state.verification.requesting = true;
        state.verification.error = null;
      })
      .addCase(requestEmailVerification.fulfilled, (state) => {
        state.verification.requesting = false;
        state.verification.requested = true;
      })
      .addCase(requestEmailVerification.rejected, (state, action) => {
        state.verification.requesting = false;
        state.verification.error = typeof action.payload === "string" ? action.payload : "Unable to send verification email";
      });
  },
});

export const { logout, clearError, resetVerification } = authSlice.actions;
export default authSlice.reducer;
