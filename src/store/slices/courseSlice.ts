import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Course, Lesson } from '../../types';

interface CourseState {
  courses: Course[];
  activeCourse: Course | null;
  currentLesson: Lesson | null;
  isEnrolled: boolean;
  enrollmentStatus: 'none' | 'pending' | 'approved' | 'rejected';
  selectedCategory: string;
  selectedLevel: string;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  activeCourse: null,
  currentLesson: null,
  isEnrolled: false,
  enrollmentStatus: 'none',
  selectedCategory: 'All',
  selectedLevel: 'All',
  searchQuery: '',
  isLoading: false,
  error: null,
};

export const fetchCourses = createAsyncThunk(
  'course/fetchCourses',
  async (
    filters: { category?: string; level?: string; search?: string } | undefined = {},
    { getState, rejectWithValue }
  ) => {
    try {
      const activeFilters = filters || {};
      const params = new URLSearchParams();
      if (activeFilters.category && activeFilters.category !== 'All') params.append('category', activeFilters.category);
      if (activeFilters.level && activeFilters.level !== 'All') params.append('level', activeFilters.level);
      if (activeFilters.search) params.append('search', activeFilters.search);

      const state: any = getState();
      const token = state.auth.token;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/courses?${params.toString()}`, { headers });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || 'Failed to fetch courses');
      return data.courses;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCourseBySlug = createAsyncThunk(
  'course/fetchCourseBySlug',
  async (slug: string, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/courses/${slug}`, { headers });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || 'Failed to fetch course details');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const enrollInCourse = createAsyncThunk(
  'course/enrollInCourse',
  async (courseId: string, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token;
      if (!token) return rejectWithValue('Please sign in to enroll');

      const res = await fetch(`/api/courses/enroll/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || 'Failed to enroll');
      return { courseId, enrollment: data.enrollment };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const createNewCourse = createAsyncThunk(
  'course/createNewCourse',
  async (courseData: any, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token;
      if (!token) return rejectWithValue('Authentication required');

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || 'Failed to create course');
      return data.course;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateExistingCourse = createAsyncThunk(
  'course/updateExistingCourse',
  async ({ courseId, courseData }: { courseId: string; courseData: any }, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token;
      if (!token) return rejectWithValue('Authentication required');

      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.error || 'Failed to update course');
      return data.course;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    setCurrentLesson: (state, action: PayloadAction<Lesson | null>) => {
      state.currentLesson = action.payload;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setLevel: (state, action: PayloadAction<string>) => {
      state.selectedLevel = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearActiveCourse: (state) => {
      state.activeCourse = null;
      state.currentLesson = null;
      state.isEnrolled = false;
      state.enrollmentStatus = 'none';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
        state.isLoading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // By Slug
      .addCase(fetchCourseBySlug.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCourseBySlug.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.activeCourse = action.payload.course;
        state.isEnrolled = action.payload.isEnrolled || false;
        state.enrollmentStatus = action.payload.enrollmentStatus || (action.payload.isEnrolled ? 'approved' : 'none');

        // Auto-select first lesson if none selected
        if (!state.currentLesson && action.payload.course.modules?.length > 0) {
          const firstMod = action.payload.course.modules[0];
          if (firstMod.lessons?.length > 0) {
            state.currentLesson = firstMod.lessons[0];
          }
        }
      })
      .addCase(fetchCourseBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Enroll
      .addCase(enrollInCourse.fulfilled, (state, action: PayloadAction<any>) => {
        const status = action.payload?.enrollment?.status || 'pending';
        state.enrollmentStatus = status;
        state.isEnrolled = status === 'approved';
      })
      // Create
      .addCase(createNewCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        state.courses.unshift(action.payload);
      })
      // Update
      .addCase(updateExistingCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        const index = state.courses.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        if (state.activeCourse?.id === action.payload.id) {
          state.activeCourse = action.payload;
        }
      });
  },
});

export const {
  setCurrentLesson,
  setCategory,
  setLevel,
  setSearchQuery,
  clearActiveCourse,
} = courseSlice.actions;

export default courseSlice.reducer;
