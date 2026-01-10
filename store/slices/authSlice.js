import { apiClient } from "@/lib/api-client";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const loadUser = () => {
  try {
    const raw =
      typeof window !== "undefined" && localStorage.getItem("specsmart_user");
    if (!raw) return { user: null, token: null };
    const user = JSON.parse(raw);
    return { user, token: null };
  } catch {
    return { user: null, token: null };
  }
};

export const signIn = createAsyncThunk(
  "auth/signin",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await apiClient.signin({ email, password });
      localStorage.setItem("specsmart_user", JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      return rejectWithValue("error: " + err);
    }
  }
);

export const signUp = createAsyncThunk(
  "auth/signup",
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      const data = await apiClient.signup({ email, password, name });
      localStorage.setItem("specsmart_user", JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      return rejectWithValue("error: " + err);
    }
  }
);

export const signOut = createAsyncThunk("auth/signOut", async () => {
  try {
    localStorage.removeItem("specsmart_user");
  } catch {}
  return null;
});

const initialState = {
  ...loadUser(),
  isAuthenticated: !!loadUser().user,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateProfile(state, action) {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload, updatedAt: new Date() };
      try {
        window.localStorage.setItem(
          "specsmart_user",
          JSON.stringify(state.user)
        );
      } catch {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(signIn.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(signUp.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });
  },
});

export const { updateProfile } = authSlice.actions;
export default authSlice.reducer;
