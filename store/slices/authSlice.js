import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const loadUser = () => {
  try {
    const raw =
      typeof window !== "undefined" &&
      window.localStorage.getItem("specsmart_user");
    if (!raw) return { user: null, token: null };
    const user = JSON.parse(raw);
    return { user, token: null };
  } catch {
    return { user: null, token: null };
  }
};

export const signIn = createAsyncThunk("auth/signIn", async (email) => {
  // simulate API call
  await new Promise((r) => setTimeout(r, 800));
  const mockUser = {
    id: "1",
    email,
    name: email.split("@")[0],
    avatar: "/placeholder.svg",
    preferences: {
      favoriteCategories: [],
      priceRange: { min: 0, max: 5000 },
      preferredBrands: [],
      notifications: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  try {
    window.localStorage.setItem("specsmart_user", JSON.stringify(mockUser));
  } catch {}
  return mockUser;
});

export const signUp = createAsyncThunk(
  "auth/signUp",
  async ({ name, email }) => {
    await new Promise((r) => setTimeout(r, 800));
    const mockUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      avatar: "/placeholder.svg",
      preferences: {
        favoriteCategories: [],
        priceRange: { min: 0, max: 5000 },
        preferredBrands: [],
        notifications: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    try {
      window.localStorage.setItem("specsmart_user", JSON.stringify(mockUser));
    } catch {}
    return mockUser;
  }
);

export const signOut = createAsyncThunk("auth/signOut", async () => {
  try {
    window.localStorage.removeItem("specsmart_user");
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
    builder.addCase(signIn.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(signIn.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
    });
    builder.addCase(signIn.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(signUp.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(signUp.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
    });
    builder.addCase(signUp.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(signOut.fulfilled, (state) => {
      state.user = null;
      state.isLoading = false;
    });
  },
});

export const { updateProfile } = authSlice.actions;
export default authSlice.reducer;
