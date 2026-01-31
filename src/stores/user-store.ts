import { create } from 'zustand';
import type { UserStats } from '@/types';

interface UserState {
  // Stats (sin gamificación)
  activeCourses: number;
  completedCourses: number;
  chaptersViewed: number;

  // Notifications
  unreadNotifications: number;

  // Actions
  setStats: (stats: UserStats) => void;
  setUnreadNotifications: (count: number) => void;
  incrementChaptersViewed: () => void;
  reset: () => void;
}

const initialState = {
  activeCourses: 0,
  completedCourses: 0,
  chaptersViewed: 0,
  unreadNotifications: 0,
};

export const useUserStore = create<UserState>((set) => ({
  ...initialState,

  setStats: (stats) => {
    set({
      activeCourses: stats.activeCourses,
      completedCourses: stats.completedCourses,
      chaptersViewed: stats.chaptersViewed,
    });
  },

  setUnreadNotifications: (count) => {
    set({ unreadNotifications: count });
  },

  incrementChaptersViewed: () => {
    set((state) => ({ chaptersViewed: state.chaptersViewed + 1 }));
  },

  reset: () => {
    set(initialState);
  },
}));
