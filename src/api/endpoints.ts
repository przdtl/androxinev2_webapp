import { api } from "./client";

// Common types
export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

export type PaginationParams = {
  page?: number;
  size?: number;
};

// Auth types
export type TelegramAuthRequest = {
  init_data: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
};

// Category types
export type CategorySchema = {
  id: string;
  title: string;
};

export type Category = {
  id: string;
  title: string;
};

export type CreateCategoryRequest = {
  title: string;
};

export type UpdateCategoryRequest = {
  title: string;
};

// Exercise types
export type Exercise = {
  id: string;
  title: string;
  short: string;
  category: CategorySchema;
  is_archived: boolean;
  created_at?: string;
  updated_at?: string;
};

export type CreateExerciseRequest = {
  category_id: string;
  title: string;
  short: string;
};

export type UpdateExerciseRequest = {
  title?: string;
  short?: string;
};

// Set types
export type SetItem = {
  id: string;
  user_id?: number;
  exercise_id?: string;
  exercise?: Exercise;
  reps: number;
  weight: number;
  created_at?: string;
};

export type CreateSetRequest = {
  exercise_id: string;
  reps: number;
  weight: number;
};

export type UpdateSetRequest = {
  reps?: number;
  weight?: number;
};

// Template Exercise types
export type TemplateExercise = {
  id: string;
  default_weight?: number | null;
  default_reps?: number | null;
  order?: number | null;
  exercise: Exercise;
};

export type CreateTemplateExerciseRequest = {
  exercise_id: string;
  default_weight?: number | null;
  default_reps?: number | null;
  order?: number | null;
};

export type UpdateTemplateExerciseRequest = {
  default_weight?: number | null;
  default_reps?: number | null;
  order?: number | null;
};

export type TemplateExerciseCreateInput = {
  exercise_id: string;
  default_weight?: number | null;
  default_reps?: number | null;
  order?: number | null;
};

// Template types
export type Template = {
  id: string;
  title: string;
  day_of_week?: number | null;
  created_at: string;
  updated_at: string;
  exercises?: TemplateExercise[];
};

export type CreateTemplateRequest = {
  title: string;
  day_of_week?: number | null;
  exercises?: TemplateExerciseCreateInput[];
};

export type UpdateTemplateRequest = {
  title?: string;
  day_of_week?: number | null;
};

// Auth API
export const AuthApi = {
  telegramAuth: (initData: string) =>
    api.post<AuthResponse>("/auth/telegram/", { init_data: initData })
};

// Categories API
export const CategoriesApi = {
  list: (params?: PaginationParams) =>
    api.get<Page<Category>>("/categories/", { params }),
  create: (data: CreateCategoryRequest) =>
    api.post<Category>("/categories/", data),
  get: (id: string) => api.get<Category>(`/categories/${id}/`),
  update: (id: string, data: UpdateCategoryRequest) =>
    api.patch<Category>(`/categories/${id}/`, data),
  remove: (id: string) => api.delete(`/categories/${id}/`)
};

// Exercises API
export const ExercisesApi = {
  list: (params?: PaginationParams) =>
    api.get<Page<Exercise>>("/exercises/", { params }),
  create: (data: CreateExerciseRequest) =>
    api.post<Exercise>("/exercises/", data),
  get: (id: string) => api.get<Exercise>(`/exercises/${id}/`),
  update: (id: string, data: UpdateExerciseRequest) =>
    api.patch<Exercise>(`/exercises/${id}/`, data),
  remove: (id: string) => api.delete(`/exercises/${id}/`),
  archive: (id: string) => api.post(`/exercises/${id}/archive/`),
  restore: (id: string) => api.post(`/exercises/${id}/restore/`)
};

// Sets API
export const SetsApi = {
  list: (params?: PaginationParams) =>
    api.get<Page<SetItem>>("/sets/", { params }),
  create: (data: CreateSetRequest) =>
    api.post<SetItem>("/sets/", data),
  get: (id: string) => api.get<SetItem>(`/sets/${id}/`),
  update: (id: string, data: UpdateSetRequest) =>
    api.patch<SetItem>(`/sets/${id}/`, data),
  remove: (id: string) => api.delete(`/sets/${id}/`)
};

// Templates API
export const TemplatesApi = {
  list: (params?: PaginationParams) =>
    api.get<Page<Template>>("/templates/", { params }),
  today: (params?: PaginationParams) =>
    api.get<Page<Template>>("/templates/today/", { params }),
  create: (data: CreateTemplateRequest) =>
    api.post<Template>("/templates/", data),
  update: (id: string, data: UpdateTemplateRequest) =>
    api.patch<Template>(`/templates/${id}/`, data),
  remove: (id: string) => api.delete(`/templates/${id}/`)
};

// Template Exercises API
export const TemplateExercisesApi = {
  list: (params?: PaginationParams) =>
    api.get<Page<TemplateExercise>>("/template_exercises/", { params }),
  create: (data: CreateTemplateExerciseRequest) =>
    api.post<TemplateExercise>("/template_exercises/", data),
  update: (id: string, data: UpdateTemplateExerciseRequest) =>
    api.patch<TemplateExercise>(`/template_exercises/${id}/`, data),
  remove: (id: string) => api.delete(`/template_exercises/${id}/`)
};


