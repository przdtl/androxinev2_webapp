// API Models

export interface Category {
  id: number;
  title: string;
}

export interface Exercise {
  id: number;
  title: string;
  short: string;
  category: number | Category;
  is_archived: boolean;
  created_at: string | number;
  updated_at: string | number;
}

export interface Template {
  id: number;
  title: string;
  day_of_week: number | null;
  exercises: number[] | Exercise[];
}

export interface WorkoutSet {
  id: number;
  exercise_id?: number;
  exercise?: number | Exercise;
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
  category: number;
}

export interface TemplateFormData {
  title: string;
  day_of_week: number | null;
  exercises: number[];
}

export interface SetFormData {
  exercise_id: number;
  reps: number;
  weight: number;
  created_at?: string;
}

// Filter Types
export interface SetFilters {
  exercise_id?: number;
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
