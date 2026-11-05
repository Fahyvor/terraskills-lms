import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, EnrollmentSummary } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  enrollments: EnrollmentSummary[];
  isAuthModalOpen: boolean;
}

const savedToken = typeof window !== 'undefined' ? localStorage.getItem('ts_token') : null;

const initialState: AuthState = {
  user: null,
  token: savedToken,
  isAuthenticated: !!savedToken,
  isLoading: false,
  error: null,
  enrollments: [],
  isAuthModalOpen: false,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.error || 'Failed to sign in');
      }
      localStorage.setItem('ts_token', data.token);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    payload: {
      name: string;
      email: string;
      password: string;
      role?: string;
      whatsapp?: string;
      address?: string;
      courseId?: string;
      courseTitle?: string;
      courseCategory?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.error || 'Failed to create account');
      }
      localStorage.setItem('ts_token', data.token);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error');
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { getState, rejectWithValue }) => {
    const state: any = getState();
    const token = state.auth.token || localStorage.getItem('ts_token');
    if (!token) return rejectWithValue('No token');

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        localStorage.removeItem('ts_token');
        return rejectWithValue(data.error || 'Session expired');
      }
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.enrollments = [];
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ts_token');
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    openAuthModal: (state) => {
      state.isAuthModalOpen = true;
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.isAuthModalOpen = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Authentication failed';
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.isAuthModalOpen = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Registration failed';
      });

    // Fetch Me
    builder
      .addCase(fetchMe.fulfilled, (state, action: PayloadAction<any>) => {
        state.user = action.payload.user;
        state.enrollments = action.payload.enrollments || [];
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearAuthError, openAuthModal, closeAuthModal } = authSlice.actions;
export default authSlice.reducer;

