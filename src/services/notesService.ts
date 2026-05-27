import { api } from "@/lib/api";

export interface Note {
  id: string;
  title: string;
  filename: string;
  fileUrl: string;
  fileType: "pdf" | "img" | "doc";
  size: string;
  createdAt: string;
}

export const notesService = {
  upload: async (file: File, title?: string): Promise<Note> => {
    const form = new FormData();
    form.append("file", file);
    if (title) form.append("title", title);
    const { data } = await api.post<{ note: Note }>("/notes/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.note;
  },

  list: async (): Promise<Note[]> => {
    const { data } = await api.get<{ notes: Note[] }>("/notes");
    return data.notes;
  },

  getById: async (id: string): Promise<Note> => {
    const { data } = await api.get<{ note: Note }>(`/notes/${id}`);
    return data.note;
  },

  createFromText: async (content: string, title?: string): Promise<Note> => {
    const { data } = await api.post<{ note: Note }>("/notes/text", { content, title });
    return data.note;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },
};
