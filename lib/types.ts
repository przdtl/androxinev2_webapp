// API Models

export type EntityId = string | number;

export interface Category {
  id: EntityId;
  title: string;
}

export interface Exercise {
  id: EntityId;
  title: string;
  short: string;
  category: EntityId | Category;
  is_archived: boolean;
  created_at: string | number;
  updated_at: string | number;
}

export interface Template {
  id: EntityId;
  title: string;
  day_of_week: number | null;
  exercises: TemplateExercise[];
}

export interface TemplateExercise {
  id?: EntityId;
  exercise_id?: EntityId;
  exercise?: Exercise;
  default_weight?: number | null;
  default_reps?: number | null;
  order?: number;
}

export interface TemplateExerciseCreateInput {
  exercise_id: EntityId;
  default_weight?: number | null;
  default_reps?: number | null;
  order?: number;
}

export interface WorkoutSet {
  id: EntityId;
  exercise_id?: EntityId;
  exercise?: EntityId | Exercise;
  reps: number;
  weight: number;
  created_at: string | number;
}

// Form Data Types
export interface CategoryFormData {
  title: string;
}

export interface ExerciseFormData {
  title: string;
  short: string;
  category?: EntityId;
  category_id?: EntityId;
}

export interface TemplateFormData {
  title: string;
  day_of_week: number | null;
  exercises: EntityId[];
}

export interface SetFormData {
  exercise_id: EntityId;
  reps: number;
  weight: number;
  created_at?: string;
}

// Filter Types
export interface SetFilters {
  exercise_id?: EntityId;
  created_from?: string;
  created_to?: string;
}

// API Response Types
export interface AuthResponse {
  access_token: string;
}

// Grouped Sets by Day
export interface GroupedSets {
  date: string;
  dateLabel: string;
  sets: WorkoutSet[];
}

// Days of week for templates
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Понедельник' },
  { value: 1, label: 'Вторник' },
  { value: 2, label: 'Среда' },
  { value: 3, label: 'Четверг' },
  { value: 4, label: 'Пятница' },
  { value: 5, label: 'Суббота' },
  { value: 6, label: 'Воскресенье' },
] as const;

export function getDayLabel(day: number | null): string {
  if (day === null) return 'Без привязки к дню';
  return DAYS_OF_WEEK.find(d => d.value === day)?.label || 'Неизвестно';
}
