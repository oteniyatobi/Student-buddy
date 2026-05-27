import { api } from "@/lib/api";

export interface DashboardStats {
  stats: {
    streakDays: number;
    hoursThisWeek: number;
    quizzesAced: number;
    xp: number;
    noteCount: number;
  };
  weekChart: { d: string; hours: number; focus: number }[];
  recentActivity: { title: string; time: string; icon: string }[];
  upcomingTasks: { id: string; title: string; due?: string; priority: string }[];
  userName: string;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>("/dashboard/stats");
    return data;
  },
};
