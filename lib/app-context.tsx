'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from './api';
import type {
  Category,
  EntityId,
  Exercise,
  Template,
  WorkoutSet,
  CategoryFormData,
  ExerciseFormData,
  TemplateFormData,
  SetFormData,
  SetFilters,
  GroupedSets,
} from './types';
import { getDateKey, formatDateRelative, parseServerDate } from './date-utils';
import { useTelegram } from '@/hooks/use-telegram';

interface AppState {
  // Data
  categories: Category[];
  exercises: Exercise[];
  templates: Template[];
  sets: WorkoutSet[];
  
  // Loading states
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Filters
  setFilters: SetFilters;
  
  // Selected items
  selectedCategoryId: EntityId | null;
}

interface AppContextType extends AppState {
  // Categories
  loadCategories: () => Promise<void>;
  createCategory: (data: CategoryFormData) => Promise<Category>;
  updateCategory: (id: EntityId, data: CategoryFormData) => Promise<Category>;
  deleteCategory: (id: EntityId) => Promise<void>;
  
  // Exercises
  loadExercises: (categoryId?: EntityId) => Promise<void>;
  createExercise: (data: ExerciseFormData) => Promise<Exercise>;
  updateExercise: (id: EntityId, data: ExerciseFormData) => Promise<Exercise>;
  deleteExercise: (id: EntityId) => Promise<void>;
  archiveExercise: (id: EntityId) => Promise<Exercise>;
  restoreExercise: (id: EntityId) => Promise<Exercise>;
  
  // Templates
  loadTemplates: () => Promise<void>;
  createTemplate: (data: TemplateFormData) => Promise<Template>;
  updateTemplate: (id: EntityId, data: TemplateFormData) => Promise<Template>;
  deleteTemplate: (id: EntityId) => Promise<void>;
  
  // Sets
  loadSets: (filters?: SetFilters) => Promise<void>;
  createSet: (data: SetFormData) => Promise<WorkoutSet>;
  updateSet: (id: EntityId, data: Partial<SetFormData>) => Promise<WorkoutSet>;
  deleteSet: (id: EntityId) => Promise<void>;
  setSetFilters: (filters: SetFilters) => void;
  groupedSets: GroupedSets[];
  
  // Selection
  setSelectedCategoryId: (id: EntityId | null) => void;
  
  // Helpers
  getExerciseById: (id: EntityId) => Exercise | undefined;
  getCategoryById: (id: EntityId) => Category | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { initData, isReady } = useTelegram();
  const TOKEN_REFRESH_INTERVAL_MS = 25 * 60 * 1000;
  
  const [state, setState] = useState<AppState>({
    categories: [],
    exercises: [],
    templates: [],
    sets: [],
    isLoading: true,
    isAuthenticated: false,
    setFilters: {},
    selectedCategoryId: null,
  });

  // Authentication
  useEffect(() => {
    async function authenticate() {
      if (!isReady) return;
      
      try {
        // In Telegram environment, require valid initData auth.
        if (initData) {
          const { access_token } = await api.authTelegram(initData);
          api.setToken(access_token);
          setState(prev => ({ ...prev, isAuthenticated: true, isLoading: false }));
          return;
        }

        // Outside Telegram allow local dev usage only.
        const isDev = process.env.NODE_ENV === 'development';
        setState(prev => ({ ...prev, isAuthenticated: isDev, isLoading: false }));
      } catch (error) {
        console.error('Auth error:', error);
        setState(prev => ({ ...prev, isAuthenticated: false, isLoading: false }));
      }
    }
    authenticate();
  }, [initData, isReady]);

  // Configure refresh strategy for expired JWT and periodic renewal.
  useEffect(() => {
    if (!isReady || !initData) {
      api.setRefreshTokenHandler(null);
      return;
    }

    const refresh = async (): Promise<string | null> => {
      try {
        const { access_token } = await api.authTelegram(initData);
        api.setToken(access_token);
        setState(prev => ({ ...prev, isAuthenticated: true }));
        return access_token;
      } catch (error) {
        console.error('Token refresh error:', error);
        return null;
      }
    };

    api.setRefreshTokenHandler(refresh);

    const intervalId = window.setInterval(() => {
      void refresh();
    }, TOKEN_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      api.setRefreshTokenHandler(null);
    };
  }, [initData, isReady, TOKEN_REFRESH_INTERVAL_MS]);

  // Categories
  const loadCategories = useCallback(async () => {
    if (!state.isAuthenticated) return;
    try {
      const categories = await api.getCategories();
      setState(prev => ({
        ...prev,
        categories: Array.isArray(categories) ? categories : [],
      }));
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, [state.isAuthenticated]);

  const createCategory = useCallback(async (data: CategoryFormData) => {
    const category = await api.createCategory(data);
    setState(prev => ({ ...prev, categories: [...prev.categories, category] }));
    return category;
  }, []);

  const updateCategory = useCallback(async (id: EntityId, data: CategoryFormData) => {
    const category = await api.updateCategory(id, data);
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? category : c),
    }));
    return category;
  }, []);

  const deleteCategory = useCallback(async (id: EntityId) => {
    await api.deleteCategory(id);
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
    }));
  }, []);

  // Exercises
  const loadExercises = useCallback(async (categoryId?: EntityId) => {
    if (!state.isAuthenticated) return;
    try {
      const exercises = await api.getExercises(categoryId);
      setState(prev => ({
        ...prev,
        exercises: Array.isArray(exercises) ? exercises : [],
      }));
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  }, [state.isAuthenticated]);

  const createExercise = useCallback(async (data: ExerciseFormData) => {
    const exercise = await api.createExercise(data);
    setState(prev => ({ ...prev, exercises: [...prev.exercises, exercise] }));
    return exercise;
  }, []);

  const updateExercise = useCallback(async (id: EntityId, data: ExerciseFormData) => {
    const exercise = await api.updateExercise(id, data);
    setState(prev => ({
      ...prev,
      exercises: prev.exercises.map(e => e.id === id ? exercise : e),
    }));
    return exercise;
  }, []);

  const deleteExercise = useCallback(async (id: EntityId) => {
    await api.deleteExercise(id);
    setState(prev => ({
      ...prev,
      exercises: prev.exercises.filter(e => e.id !== id),
    }));
  }, []);

  const archiveExercise = useCallback(async (id: EntityId) => {
    const exercise = await api.archiveExercise(id);
    setState(prev => ({
      ...prev,
      exercises: prev.exercises.map(e => e.id === id ? exercise : e),
    }));
    return exercise;
  }, []);

  const restoreExercise = useCallback(async (id: EntityId) => {
    const exercise = await api.restoreExercise(id);
    setState(prev => ({
      ...prev,
      exercises: prev.exercises.map(e => e.id === id ? exercise : e),
    }));
    return exercise;
  }, []);

  // Templates
  const loadTemplates = useCallback(async () => {
    if (!state.isAuthenticated) return;
    try {
      const templates = await api.getTemplates();
      setState(prev => ({
        ...prev,
        templates: Array.isArray(templates) ? templates : [],
      }));
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  }, [state.isAuthenticated]);

  const createTemplate = useCallback(async (data: TemplateFormData) => {
    const template = await api.createTemplate(data);
    setState(prev => ({ ...prev, templates: [...prev.templates, template] }));
    return template;
  }, []);

  const updateTemplate = useCallback(async (id: EntityId, data: TemplateFormData) => {
    const template = await api.updateTemplate(id, data);
    setState(prev => ({
      ...prev,
      templates: prev.templates.map(t => t.id === id ? template : t),
    }));
    return template;
  }, []);

  const deleteTemplate = useCallback(async (id: EntityId) => {
    await api.deleteTemplate(id);
    setState(prev => ({
      ...prev,
      templates: prev.templates.filter(t => t.id !== id),
    }));
  }, []);

  // Sets
  const loadSets = useCallback(async (filters?: SetFilters) => {
    if (!state.isAuthenticated) return;
    try {
      const sets = await api.getSets(filters || state.setFilters);
      setState(prev => ({
        ...prev,
        sets: Array.isArray(sets) ? sets : [],
      }));
    } catch (error) {
      console.error('Failed to load sets:', error);
    }
  }, [state.isAuthenticated, state.setFilters]);

  const createSet = useCallback(async (data: SetFormData) => {
    const set = await api.createSet(data);
    setState(prev => ({ ...prev, sets: [set, ...prev.sets] }));
    return set;
  }, []);

  const updateSet = useCallback(async (id: EntityId, data: Partial<SetFormData>) => {
    const set = await api.updateSet(id, data);
    setState(prev => ({
      ...prev,
      sets: prev.sets.map(s => s.id === id ? set : s),
    }));
    return set;
  }, []);

  const deleteSet = useCallback(async (id: EntityId) => {
    await api.deleteSet(id);
    setState(prev => ({
      ...prev,
      sets: prev.sets.filter(s => s.id !== id),
    }));
  }, []);

  const setSetFilters = useCallback((filters: SetFilters) => {
    setState(prev => ({ ...prev, setFilters: filters }));
  }, []);

  // Group sets by day
  const groupedSets: GroupedSets[] = React.useMemo(() => {
    const groups = new Map<string, WorkoutSet[]>();
    
    // Sort sets by date descending
    const sortedSets = [...state.sets].sort((a, b) => {
      const dateA = parseServerDate(a.created_at);
      const dateB = parseServerDate(b.created_at);
      return dateB.getTime() - dateA.getTime();
    });
    
    sortedSets.forEach(set => {
      const key = getDateKey(set.created_at);
      const existing = groups.get(key) || [];
      groups.set(key, [...existing, set]);
    });
    
    return Array.from(groups.entries()).map(([date, sets]) => ({
      date,
      dateLabel: formatDateRelative(parseServerDate(sets[0].created_at)),
      sets,
    }));
  }, [state.sets]);

  // Selection
  const setSelectedCategoryId = useCallback((id: EntityId | null) => {
    setState(prev => ({ ...prev, selectedCategoryId: id }));
  }, []);

  // Helpers
  const getExerciseById = useCallback((id: EntityId) => {
    return state.exercises.find(e => e.id === id);
  }, [state.exercises]);

  const getCategoryById = useCallback((id: EntityId) => {
    return state.categories.find(c => c.id === id);
  }, [state.categories]);

  const contextValue: AppContextType = {
    ...state,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    loadExercises,
    createExercise,
    updateExercise,
    deleteExercise,
    archiveExercise,
    restoreExercise,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    loadSets,
    createSet,
    updateSet,
    deleteSet,
    setSetFilters,
    groupedSets,
    setSelectedCategoryId,
    getExerciseById,
    getCategoryById,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
