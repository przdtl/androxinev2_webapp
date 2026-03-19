import type { Category, Exercise, Template, WorkoutSet } from './types';

export const mockCategories: Category[] = [
  { id: 1, title: 'Грудь' },
  { id: 2, title: 'Спина' },
  { id: 3, title: 'Ноги' },
  { id: 4, title: 'Плечи' },
  { id: 5, title: 'Руки' },
];

export const mockExercises: Exercise[] = [
  { id: 1, title: 'Жим лёжа', short: 'ЖЛ', category: 1, is_archived: false, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
  { id: 2, title: 'Жим гантелей', short: 'ЖГ', category: 1, is_archived: false, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
  { id: 3, title: 'Разводка', short: 'Р', category: 1, is_archived: false, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
  { id: 4, title: 'Подтягивания', short: 'ПТ', category: 2, is_archived: false, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
  { id: 5, title: 'Тяга верхнего блока', short: 'ТВБ', category: 2, is_archived: false, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
  { id: 6, title: 'Тяга штанги в наклоне', short: 'ТШН', category: 2, is_archived: false, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
  { id: 7, title: 'Приседания', short: 'ПР', category: 3, is_archived: false, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
  { id: 8, title: 'Жим ногами', short: 'ЖН', category: 3, is_archived: false, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
  { id: 9, title: 'Выпады', short: 'В', category: 3, is_archived: true, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
  { id: 10, title: 'Жим стоя', short: 'ЖС', category: 4, is_archived: false, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
  { id: 11, title: 'Махи гантелями', short: 'МГ', category: 4, is_archived: false, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
  { id: 12, title: 'Подъём на бицепс', short: 'ПБ', category: 5, is_archived: false, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
  { id: 13, title: 'Французский жим', short: 'ФЖ', category: 5, is_archived: false, created_at: '2024-01-15T10:00:00Z', updated_at: '2024-01-15T10:00:00Z' },
];

export const mockTemplates: Template[] = [
  {
    id: 1,
    title: 'День груди',
    day_of_week: 0,
    exercises: [{ exercise_id: 1 }, { exercise_id: 2 }, { exercise_id: 3 }],
  },
  {
    id: 2,
    title: 'День спины',
    day_of_week: 2,
    exercises: [{ exercise_id: 4 }, { exercise_id: 5 }, { exercise_id: 6 }],
  },
  {
    id: 3,
    title: 'День ног',
    day_of_week: 4,
    exercises: [{ exercise_id: 7 }, { exercise_id: 8 }],
  },
];

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);

export const mockSets: WorkoutSet[] = [
  // Today
  { id: 1, exercise_id: 1, reps: 10, weight: 80, created_at: new Date(today.getTime() + 10 * 60 * 60 * 1000).toISOString() },
  { id: 2, exercise_id: 1, reps: 8, weight: 85, created_at: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString() },
  { id: 3, exercise_id: 1, reps: 6, weight: 90, created_at: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString() },
  { id: 4, exercise_id: 2, reps: 12, weight: 30, created_at: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString() },
  { id: 5, exercise_id: 2, reps: 10, weight: 32, created_at: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString() },
  // Yesterday
  { id: 6, exercise_id: 4, reps: 12, weight: 0, created_at: new Date(yesterday.getTime() + 18 * 60 * 60 * 1000).toISOString() },
  { id: 7, exercise_id: 4, reps: 10, weight: 0, created_at: new Date(yesterday.getTime() + 18 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString() },
  { id: 8, exercise_id: 5, reps: 12, weight: 60, created_at: new Date(yesterday.getTime() + 18 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString() },
  { id: 9, exercise_id: 6, reps: 10, weight: 70, created_at: new Date(yesterday.getTime() + 18 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString() },
  // Two days ago
  { id: 10, exercise_id: 7, reps: 10, weight: 100, created_at: new Date(twoDaysAgo.getTime() + 9 * 60 * 60 * 1000).toISOString() },
  { id: 11, exercise_id: 7, reps: 8, weight: 110, created_at: new Date(twoDaysAgo.getTime() + 9 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString() },
  { id: 12, exercise_id: 8, reps: 15, weight: 150, created_at: new Date(twoDaysAgo.getTime() + 9 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString() },
];
