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

      localStorage.setItem("specsmart_user", data.id);
      return data.id;
    } catch (err) {
      return rejectWithValue("error: " + err);
    }
  }
);

export const signUp = createAsyncThunk(
  "auth/signup",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await apiClient.signup({ email, password });
      // would need to make a new route to return this user

      // const mockUser = {
      //     id: "1",
      //     email,
      //     name: email.split("@")[0],
      //     avatar: "/placeholder.svg",
      //     preferences: {
      //       favoriteCategories: [],
      //       priceRange: { min: 0, max: 5000 },
      //       preferredBrands: [],
      //       notifications: true,
      //     },
      //     createdAt: new Date(),
      //     updatedAt: new Date(),
      //   };
      localStorage.setItem("specsmart_user", data.id);
      return data.id;
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
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.isLoading = false;
      })
      .addCase(signIn.pending, (state) => {
        state.status = "loading";
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(signUp.pending, (state) => {
        state.status = "loading";
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { updateProfile } = authSlice.actions;
export default authSlice.reducer;
