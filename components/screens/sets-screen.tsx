'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { MoreVertical, Pencil, Trash2, Filter, X, ClipboardList, Repeat } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { useTelegram } from '@/hooks/use-telegram';
import type { WorkoutSet, SetFormData, Exercise, EntityId } from '@/lib/types';
import { formatTime, formatForInput, parseFromInput, formatForApi, parseServerDate } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { Empty } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { ExercisePicker } from '@/components/exercise-picker';

interface SetsScreenProps {
  scrollToTopSignal?: number;
  onOpenExercise?: (exerciseId: EntityId) => void;
}

export function SetsScreen({ scrollToTopSignal = 0, onOpenExercise }: SetsScreenProps) {
  const { 
    sets,
    exercises,
    groupedSets,
    loadSets, 
    loadExercises,
    createSet, 
    updateSet, 
    deleteSet,
    setFilters,
    setSetFilters,
    getExerciseById,
  } = useApp();
  const { haptic } = useTelegram();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<WorkoutSet | null>(null);
  const [deletingSet, setDeletingSet] = useState<WorkoutSet | null>(null);
  const [quickFormData, setQuickFormData] = useState<SetFormData>({
    exercise_id: '',
    reps: 10,
    weight: 0,
  });
  const [formData, setFormData] = useState<SetFormData>({ 
    exercise_id: '',
    reps: 0,
    weight: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Local filter state
  const [localFilters, setLocalFilters] = useState({
    exercise_id: setFilters.exercise_id ? String(setFilters.exercise_id) : 'all',
    created_from: setFilters.created_from || '',
    created_to: setFilters.created_to || '',
  });

  useEffect(() => {
    Promise.all([loadSets(), loadExercises()])
      .finally(() => setIsLoading(false));
  }, [loadSets, loadExercises]);

  // Active exercises only
  const activeExercises = useMemo(() => {
    return exercises.filter(e => !e.is_archived);
  }, [exercises]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (setFilters.exercise_id) count++;
    if (setFilters.created_from) count++;
    if (setFilters.created_to) count++;
    return count;
  }, [setFilters]);

  const canCreateSet = activeExercises.length > 0;

  const idsEqual = (a: EntityId, b: EntityId): boolean => String(a) === String(b);

  const resolveSetExerciseId = (set: WorkoutSet): EntityId | null => {
    if (set.exercise_id) return set.exercise_id;
    if (typeof set.exercise === 'object' && set.exercise?.id) return set.exercise.id;
    if (typeof set.exercise === 'string' || typeof set.exercise === 'number') return set.exercise;
    return null;
  };

  useEffect(() => {
    if (!activeExercises.length) return;
    setQuickFormData(prev => {
      if (prev.exercise_id) return prev;
      return { ...prev, exercise_id: activeExercises[0].id };
    });
  }, [activeExercises]);

  const getExerciseName = (set: WorkoutSet): string => {
    const exerciseId = resolveSetExerciseId(set);
    if (!exerciseId) return 'Неизвестно';
    const exercise = getExerciseById(exerciseId);
    return exercise?.title || exercise?.short || `Упражнение #${exerciseId}`;
  };

  const handlePrefillQuickFormFromSet = (set: WorkoutSet) => {
    const exerciseId = resolveSetExerciseId(set);

    setQuickFormData((prev) => {
      const hasExerciseInQuickList =
        exerciseId !== null && activeExercises.some((exercise) => idsEqual(exercise.id, exerciseId));

      return {
        exercise_id: hasExerciseInQuickList && exerciseId !== null ? exerciseId : prev.exercise_id,
        reps: set.reps,
        weight: set.weight,
      };
    });

    haptic?.selectionChanged();
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [scrollToTopSignal]);

  const handleOpenEdit = (set: WorkoutSet) => {
    setEditingSet(set);
    const exerciseId = set.exercise_id || (set.exercise as Exercise)?.id || '';
    setFormData({ 
      exercise_id: exerciseId,
      reps: set.reps,
      weight: set.weight,
    });
    setIsDialogOpen(true);
    haptic?.impactOccurred('light');
  };

  const handleOpenDelete = (set: WorkoutSet) => {
    setDeletingSet(set);
    setIsDeleteDialogOpen(true);
    haptic?.impactOccurred('medium');
  };

  const handleApplyFilters = () => {
    const normalizedExerciseId: EntityId | undefined =
      localFilters.exercise_id && localFilters.exercise_id !== 'all'
        ? localFilters.exercise_id
        : undefined;

    setSetFilters({
      exercise_id: normalizedExerciseId,
      created_from: localFilters.created_from || undefined,
      created_to: localFilters.created_to || undefined,
    });
    loadSets({
      exercise_id: normalizedExerciseId,
      created_from: localFilters.created_from || undefined,
      created_to: localFilters.created_to || undefined,
    });
    setIsFilterDialogOpen(false);
    haptic?.notificationOccurred('success');
  };

  const handleClearFilters = () => {
    setLocalFilters({ exercise_id: 'all', created_from: '', created_to: '' });
    setSetFilters({});
    loadSets({});
    setIsFilterDialogOpen(false);
    haptic?.impactOccurred('light');
  };

  const handleQuickCreate = async () => {
    if (!quickFormData.exercise_id || quickFormData.reps <= 0) return;

    setIsQuickSubmitting(true);
    try {
      await createSet({
        exercise_id: quickFormData.exercise_id,
        reps: quickFormData.reps,
        weight: quickFormData.weight,
      });
      setQuickFormData(prev => ({ ...prev, reps: 10, weight: 0 }));
      haptic?.notificationOccurred('success');
    } catch (error) {
      console.error('Failed to create set:', error);
      haptic?.notificationOccurred('error');
    } finally {
      setIsQuickSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!editingSet || !formData.exercise_id || formData.reps <= 0) return;
    
    setIsSubmitting(true);
    try {
      await updateSet(editingSet.id, {
        exercise_id: formData.exercise_id,
        reps: formData.reps,
        weight: formData.weight,
      });
      haptic?.notificationOccurred('success');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save set:', error);
      haptic?.notificationOccurred('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSet) return;
    
    try {
      await deleteSet(deletingSet.id);
      haptic?.notificationOccurred('success');
      setIsDeleteDialogOpen(false);
      setDeletingSet(null);
    } catch (error) {
      console.error('Failed to delete set:', error);
      haptic?.notificationOccurred('error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain touch-pan-y"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <h1 className="text-xl font-semibold text-foreground">Подходы</h1>
        <Button
          size="sm"
          variant={activeFiltersCount > 0 ? 'secondary' : 'ghost'}
          className="gap-1.5"
          onClick={() => setIsFilterDialogOpen(true)}
        >
          <Filter className="size-4" />
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="h-5 px-1.5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Quick Add */}
      <div className="border-b border-border bg-card px-4 py-3">
        {canCreateSet ? (
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_112px_112px_auto] gap-2 items-end">
            <Field>
              <FieldLabel>Упражнение</FieldLabel>
              <ExercisePicker
                exercises={activeExercises}
                selectedIds={quickFormData.exercise_id ? [quickFormData.exercise_id] : []}
                onChange={(ids) => setQuickFormData(prev => ({ ...prev, exercise_id: ids[0] ?? '' }))}
                placeholder="Выберите упражнение"
                searchPlaceholder="Поиск упражнения..."
                recentStorageKey="sets-quick-add-recent"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="quick-set-reps">Повт.</FieldLabel>
              <Input
                id="quick-set-reps"
                type="number"
                inputMode="numeric"
                min={1}
                value={quickFormData.reps || ''}
                onChange={(e) => setQuickFormData(prev => ({ ...prev, reps: parseInt(e.target.value) || 0 }))}
                placeholder="10"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="quick-set-weight">Вес</FieldLabel>
              <Input
                id="quick-set-weight"
                type="number"
                inputMode="decimal"
                min={0}
                step={0.5}
                value={quickFormData.weight || ''}
                onChange={(e) => setQuickFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                placeholder="50"
              />
            </Field>
            <Button
              onClick={handleQuickCreate}
              disabled={isQuickSubmitting || !quickFormData.exercise_id || quickFormData.reps <= 0}
              className="sm:self-end"
            >
              {isQuickSubmitting ? <Spinner className="size-4 mr-2" /> : null}
              Добавить
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Сначала добавьте хотя бы одно упражнение в разделе категорий.</p>
        )}
      </div>

      {/* Sets List */}
      <div className="min-h-0">
        {groupedSets.length === 0 ? (
          <Empty className="mt-16">
            <Empty.Icon>
              <ClipboardList className="size-10" />
            </Empty.Icon>
            <Empty.Title>Нет подходов</Empty.Title>
            <Empty.Description>
              {activeFiltersCount > 0 
                ? 'Попробуйте изменить фильтры'
                : canCreateSet
                  ? 'Заполните форму сверху, чтобы быстро добавить первый подход'
                  : 'Сначала добавьте хотя бы одно упражнение'
              }
            </Empty.Description>
          </Empty>
        ) : (
          <div className="divide-y divide-border">
            {groupedSets.map((group) => (
              <div key={group.date}>
                {/* Date Header */}
                <div className="sticky top-0 bg-muted/80 backdrop-blur-sm px-4 py-2 border-b border-border">
                  <h2 className="text-sm font-medium text-muted-foreground">{group.dateLabel}</h2>
                </div>
                {/* Sets for this day */}
                <ul className="divide-y divide-border/50">
                  {group.sets.map((set) => (
                    <li key={set.id}>
                      <div className="flex items-center bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex-1 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              className="font-medium text-foreground text-left hover:text-primary transition-colors"
                              onClick={() => {
                                const exerciseId = resolveSetExerciseId(set);
                                if (!exerciseId || !onOpenExercise) return;
                                onOpenExercise(exerciseId);
                              }}
                            >
                              {getExerciseName(set)}
                            </button>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(set.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Repeat className="size-3.5" />
                              <span>{set.reps}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {set.weight} кг
                            </span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="mr-2">
                              <MoreVertical className="size-5" />
                              <span className="sr-only">Меню</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePrefillQuickFormFromSet(set)}>
                              <Repeat className="size-4 mr-2" />
                              Повторить в форме
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenEdit(set)}>
                              <Pencil className="size-4 mr-2" />
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              variant="destructive"
                              onClick={() => handleOpenDelete(set)}
                            >
                              <Trash2 className="size-4 mr-2" />
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div aria-hidden="true" className="h-[env(safe-area-inset-bottom)]" />
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle>
              {editingSet ? 'Редактировать подход' : 'Новый подход'}
            </DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Упражнение</FieldLabel>
              <ExercisePicker
                exercises={activeExercises}
                selectedIds={formData.exercise_id ? [formData.exercise_id] : []}
                onChange={(ids) => setFormData(prev => ({ ...prev, exercise_id: ids[0] ?? '' }))}
                placeholder="Выберите упражнение"
                searchPlaceholder="Поиск упражнения..."
                recentStorageKey="sets-edit-recent"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="set-reps">Повторения</FieldLabel>
                <Input
                  id="set-reps"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={formData.reps || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, reps: parseInt(e.target.value) || 0 }))}
                  placeholder="10"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="set-weight">Вес (кг)</FieldLabel>
                <Input
                  id="set-weight"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.5}
                  value={formData.weight || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  placeholder="50"
                />
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !formData.exercise_id || formData.reps <= 0}>
              {isSubmitting ? <Spinner className="size-4 mr-2" /> : null}
              {editingSet ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle>Фильтры</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <div className="flex items-center justify-between gap-2">
                <FieldLabel htmlFor="filter-exercise">Упражнение</FieldLabel>
                {localFilters.exercise_id !== 'all' ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => setLocalFilters(prev => ({ ...prev, exercise_id: 'all' }))}
                  >
                    Все упражнения
                  </Button>
                ) : null}
              </div>
              <ExercisePicker
                exercises={exercises}
                selectedIds={localFilters.exercise_id !== 'all' ? [localFilters.exercise_id] : []}
                onChange={(ids) => setLocalFilters(prev => ({
                  ...prev,
                  exercise_id: ids[0] ? String(ids[0]) : 'all',
                }))}
                placeholder="Все упражнения"
                searchPlaceholder="Поиск упражнения в фильтре..."
                recentStorageKey="sets-filter-recent"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="filter-from">Дата от</FieldLabel>
              <Input
                id="filter-from"
                type="date"
                value={localFilters.created_from}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, created_from: e.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="filter-to">Дата до</FieldLabel>
              <Input
                id="filter-to"
                type="date"
                value={localFilters.created_to}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, created_to: e.target.value }))}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={handleClearFilters}>
              <X className="size-4 mr-2" />
              Сбросить
            </Button>
            <Button onClick={handleApplyFilters}>Применить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить подход?</AlertDialogTitle>
            <AlertDialogDescription>
              Этот подход будет удалён. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
