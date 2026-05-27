import { api } from "@/lib/api";
import type { Quiz } from "@/services/aiService";

export const quizService = {
  list: async (): Promise<Quiz[]> => {
    const { data } = await api.get<{ quizzes: Quiz[] }>("/quiz");
    return data.quizzes;
  },

  getById: async (id: string): Promise<Quiz> => {
    const { data } = await api.get<{ quiz: Quiz }>(`/quiz/${id}`);
    return data.quiz;
  },

  saveAttempt: async (quizId: string, score: number, total: number): Promise<{ xpEarned: number }> => {
    const { data } = await api.post<{ attempt: object; xpEarned: number }>(`/quiz/${quizId}/attempt`, {
      score,
      total,
    });
    return { xpEarned: data.xpEarned };
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/quiz/${id}`);
  },
};
