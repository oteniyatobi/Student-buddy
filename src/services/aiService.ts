import { api } from "@/lib/api";

export interface Summary {
  id: string;
  shortText: string;
  detailedText: string;
  keyPoints: string[];
  createdAt: string;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  a: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "ai" | "assistant";
  content?: string;
  text?: string;
}

export const aiService = {
  summarize: async (noteId: string): Promise<Summary> => {
    const { data } = await api.post<{ summary: Summary }>(`/ai/summarize/${noteId}`);
    return data.summary;
  },

  generateQuiz: async (options: { noteId?: string; topic?: string; count?: number }): Promise<Quiz> => {
    const noteId = options.noteId ?? "";
    const { data } = await api.post<{ quiz: Quiz }>(`/ai/quiz/${noteId}`, {
      topic: options.topic,
      count: options.count ?? 5,
    });
    return data.quiz;
  },

  chat: async (messages: { role: "user" | "assistant"; content: string }[]): Promise<string> => {
    const { data } = await api.post<{ reply: string }>("/ai/chat", { messages });
    return data.reply;
  },

  explain: async (concept: string): Promise<string> => {
    const { data } = await api.post<{ explanation: string }>("/ai/explain", { concept });
    return data.explanation;
  },

  getChatHistory: async (): Promise<{ role: string; content: string; id: string }[]> => {
    const { data } = await api.get<{ messages: { role: string; content: string; id: string }[] }>("/ai/chat/history");
    return data.messages;
  },

  clearChatHistory: async (): Promise<void> => {
    await api.delete("/ai/chat/history");
  },

};
