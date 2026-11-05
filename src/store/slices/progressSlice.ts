import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import confetti from 'canvas-confetti';
import { fetchMe } from './authSlice';

interface ProgressState {
  completedLessonIds: string[];
  progressPercent: number;
  isCourseCompleted: boolean;
  certificateId: string | null;
  isLoading: boolean;
}

const initialState: ProgressState = {
  completedLessonIds: [],
  progressPercent: 0,
  isCourseCompleted: false,
  certificateId: null,
  isLoading: false,
};

// Trigger joyful celebratory confetti on 100% course completion
export const triggerCompletionConfetti = () => {
  try {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#004bbb', '#e5192d', '#3b82f6', '#f59e0b', '#10b981'],
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  } catch (e) {
    console.error('Confetti failed', e);
  }
};

export const toggleLessonProgress = createAsyncThunk(
  'progress/toggleLessonProgress',
  async (
    payload: { lessonId: string; courseId: string },
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      const state: any = getState();
      const token = state.auth.token;
      if (!token) return rejectWithValue('Sign in required');

      const res = await fetch('/api/progress/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || 'Failed to update progress');

      if (data.isCourseCompleted) {
        triggerCompletionConfetti();
        dispatch(fetchMe());
      }

      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setProgressData: (
      state,
      action: PayloadAction<{
        completedLessonIds: string[];
        progressPercent: number;
        certificateId?: string | null;
      }>
    ) => {
      state.completedLessonIds = action.payload.completedLessonIds;
      state.progressPercent = action.payload.progressPercent;
      state.isCourseCompleted = action.payload.progressPercent === 100;
      if (action.payload.certificateId) {
        state.certificateId = action.payload.certificateId;
      }
    },
    resetProgress: (state) => {
      state.completedLessonIds = [];
      state.progressPercent = 0;
      state.isCourseCompleted = false;
      state.certificateId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleLessonProgress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(toggleLessonProgress.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.completedLessonIds = action.payload.completedLessonIds;
        state.progressPercent = action.payload.progressPercent;
        state.isCourseCompleted = action.payload.isCourseCompleted;
        if (action.payload.certificateId) {
          state.certificateId = action.payload.certificateId;
        }
      })
      .addCase(toggleLessonProgress.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setProgressData, resetProgress } = progressSlice.actions;
export default progressSlice.reducer;
