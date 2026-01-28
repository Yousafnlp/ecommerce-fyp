import { apiClient } from "@/lib/api-client";
import { isTokenValid } from "@/lib/jwtUtils";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const initAuth = createAsyncThunk(
  "auth/init",
  async (_, { dispatch, rejectWithValue }) => {
    let token = localStorage.getItem("token");
    // 1️⃣ valid access token
    if (isTokenValid(token)) {
      const user = await dispatch(fetchUser()).unwrap();
      return { user, token };
    }

    // 2️⃣ try refresh
    try {
      const data = await apiClient.refresh();
      localStorage.setItem("token", data.token);

      const user = await dispatch(fetchUser()).unwrap();
      return { user, token: data.token };
    } catch {
      localStorage.removeItem("token");

      return rejectWithValue("Unauthenticated");
    }
  }
);

export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      return await apiClient.getUser();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

let refreshPromise = null;

export const refreshAccessToken = createAsyncThunk(
  "auth/refresh",
  async (_) => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const data = await apiClient.refresh();
        localStorage.setItem("token", data.token);
        return data.token;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }
);

export const signIn = createAsyncThunk(
  "auth/signin",
  async (credentials, { rejectWithValue }) => {
    try {
      const { user, token } = await apiClient.signin(credentials);
      localStorage.setItem("token", token);

      return { user, token };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const signUp = createAsyncThunk(
  "auth/signup",
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      const { user, token } = await apiClient.signup({ email, password, name });
      localStorage.setItem("token", token);

      return { user, token };
    } catch (err) {
      return rejectWithValue("error: " + err);
    }
  }
);

export const signOut = createAsyncThunk("auth/signOut", async () => {
  try {
    await apiClient.signout();

    localStorage.removeItem("token");
  } catch {}
  return null;
});
const initialState = {
  user: null,
  token: null,
  isLoading: true, // important!
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isLoading = false;
    },
    updateUser(state, action) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearUser(state) {
      state.user = null;
      state.isLoading = false;
    },
    startAuthLoading(state) {
      state.isLoading = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isLoading = false;
      })
      .addCase(initAuth.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
      })

      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      })

      .addCase(signUp.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
      })
      .addCase(signOut.pending, (state) => {
        state.isLoading = true;
      });
  },
});

export const { updateProfile } = authSlice.actions;
export default authSlice.reducer;
