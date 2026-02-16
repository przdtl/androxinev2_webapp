import { api } from "./client";

export type Category = { id: number; name: string };
export type Exercise = { id: number; name: string; archived?: boolean; categoryId?: number };
export type SetItem = { id: number; exerciseId: number; reps?: number; weight?: number; createdAt?: string };
export type Template = { id: number; name: string };
export type TemplateExercise = { id: number; templateId: number; exerciseId: number };

export const CategoriesApi = {
  list: () => api.get<Category[]>("/api/categories")
};

export const ExercisesApi = {
  list: () => api.get<Exercise[]>("/api/exercises"),
  create: (payload: Partial<Exercise>) => api.post<Exercise>("/api/exercises", payload),
  get: (id: number) => api.get<Exercise>(`/api/exercises/${id}`),
  update: (id: number, payload: Partial<Exercise>) =>
    api.patch<Exercise>(`/api/exercises/${id}`, payload),
  archive: (id: number) => api.post(`/api/exercises/${id}/archive`),
  restore: (id: number) => api.post(`/api/exercises/${id}/restore`)
};

export const SetsApi = {
  list: () => api.get<SetItem[]>("/api/sets"),
  create: (payload: Partial<SetItem>) => api.post<SetItem>("/api/sets", payload),
  remove: (id: number) => api.delete(`/api/sets/${id}`)
};

export const TemplatesApi = {
  list: () => api.get<Template[]>("/api/templates"),
  today: () => api.get<Template>("/api/templates/today"),
  create: (payload: Partial<Template>) => api.post<Template>("/api/templates", payload),
  update: (id: number, payload: Partial<Template>) =>
    api.patch<Template>(`/api/templates/${id}`, payload),
  remove: (id: number) => api.delete(`/api/templates/${id}`)
};

export const TemplateExercisesApi = {
  list: (templateId: number) =>
    api.get<TemplateExercise[]>(`/api/templates/${templateId}/exercises`),
  create: (templateId: number, payload: Partial<TemplateExercise>) =>
    api.post<TemplateExercise>(`/api/templates/${templateId}/exercises`, payload),
  update: (id: number, payload: Partial<TemplateExercise>) =>
    api.patch<TemplateExercise>(`/api/template-exercises/${id}`, payload),
  remove: (id: number) => api.delete(`/api/template-exercises/${id}`)
};
