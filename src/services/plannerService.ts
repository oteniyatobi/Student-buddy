import { api } from "@/lib/api";

export interface PlannerTask {
  id: string;
  title: string;
  day: number;
  hour: number;
  duration: number;
  color: string;
  priority: string;
  due?: string;
}

export const plannerService = {
  list: async (): Promise<PlannerTask[]> => {
    const { data } = await api.get<{ tasks: PlannerTask[] }>("/planner");
    return data.tasks;
  },

  create: async (task: Omit<PlannerTask, "id">): Promise<PlannerTask> => {
    const { data } = await api.post<{ task: PlannerTask }>("/planner", task);
    return data.task;
  },

  update: async (id: string, updates: Partial<Omit<PlannerTask, "id">>): Promise<PlannerTask> => {
    const { data } = await api.put<{ task: PlannerTask }>(`/planner/${id}`, updates);
    return data.task;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/planner/${id}`);
  },
};
