'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, MoreVertical, Pencil, Trash2, Filter, X, ClipboardList, Repeat } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { useTelegram } from '@/hooks/use-telegram';
import type { WorkoutSet, SetFormData, Exercise } from '@/lib/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { Empty } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';

export function SetsScreen() {
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
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<WorkoutSet | null>(null);
  const [deletingSet, setDeletingSet] = useState<WorkoutSet | null>(null);
  const [formData, setFormData] = useState<SetFormData>({ 
    exercise_id: 0,
    reps: 0,
    weight: 0,
  });
  const [showDateField, setShowDateField] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Local filter state
  const [localFilters, setLocalFilters] = useState({
    exercise_id: setFilters.exercise_id?.toString() || '',
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

  const getExerciseName = (set: WorkoutSet): string => {
    const exerciseId = set.exercise_id || (typeof set.exercise === 'number' ? set.exercise : (set.exercise as Exercise)?.id);
    if (!exerciseId) return 'Неизвестно';
    const exercise = getExerciseById(exerciseId);
    return exercise?.short || exercise?.title || `Упражнение #${exerciseId}`;
  };

  const handleOpenCreate = () => {
    setEditingSet(null);
    setFormData({ 
      exercise_id: activeExercises[0]?.id || 0,
      reps: 10,
      weight: 0,
    });
    setShowDateField(true);
    setIsDialogOpen(true);
    haptic?.impactOccurred('light');
  };

  const handleOpenEdit = (set: WorkoutSet) => {
    setEditingSet(set);
    const exerciseId = set.exercise_id || (typeof set.exercise === 'number' ? set.exercise : (set.exercise as Exercise)?.id) || 0;
    setFormData({ 
      exercise_id: exerciseId,
      reps: set.reps,
      weight: set.weight,
    });
    setShowDateField(false); // Hide date field when editing
    setIsDialogOpen(true);
    haptic?.impactOccurred('light');
  };

  const handleOpenDelete = (set: WorkoutSet) => {
    setDeletingSet(set);
    setIsDeleteDialogOpen(true);
    haptic?.impactOccurred('medium');
  };

  const handleApplyFilters = () => {
    setSetFilters({
      exercise_id: localFilters.exercise_id ? parseInt(localFilters.exercise_id) : undefined,
      created_from: localFilters.created_from || undefined,
      created_to: localFilters.created_to || undefined,
    });
    loadSets({
      exercise_id: localFilters.exercise_id ? parseInt(localFilters.exercise_id) : undefined,
      created_from: localFilters.created_from || undefined,
      created_to: localFilters.created_to || undefined,
    });
    setIsFilterSheetOpen(false);
    haptic?.notificationOccurred('success');
  };

  const handleClearFilters = () => {
    setLocalFilters({ exercise_id: '', created_from: '', created_to: '' });
    setSetFilters({});
    loadSets({});
    setIsFilterSheetOpen(false);
    haptic?.impactOccurred('light');
  };

  const handleSubmit = async () => {
    if (!formData.exercise_id || formData.reps <= 0) return;
    
    setIsSubmitting(true);
    try {
      if (editingSet) {
        await updateSet(editingSet.id, {
          exercise_id: formData.exercise_id,
          reps: formData.reps,
          weight: formData.weight,
        });
        haptic?.notificationOccurred('success');
      } else {
        const data: SetFormData = {
          exercise_id: formData.exercise_id,
          reps: formData.reps,
          weight: formData.weight,
        };
        if (formData.created_at) {
          data.created_at = formData.created_at;
        }
        await createSet(data);
        haptic?.notificationOccurred('success');
      }
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <h1 className="text-xl font-semibold text-foreground">Подходы</h1>
        <div className="flex items-center gap-2">
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button 
                size="sm" 
                variant={activeFiltersCount > 0 ? 'secondary' : 'ghost'}
                className="gap-1.5"
              >
                <Filter className="size-4" />
                {activeFiltersCount > 0 && (
                  <Badge variant="default" className="h-5 px-1.5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[70vh]">
              <SheetHeader>
                <SheetTitle>Фильтры</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="filter-exercise">Упражнение</FieldLabel>
                    <Select
                      value={localFilters.exercise_id}
                      onValueChange={(value) => setLocalFilters(prev => ({ ...prev, exercise_id: value }))}
                    >
                      <SelectTrigger id="filter-exercise">
                        <SelectValue placeholder="Все упражнения" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Все упражнения</SelectItem>
                        {exercises.map(exercise => (
                          <SelectItem key={exercise.id} value={exercise.id.toString()}>
                            {exercise.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleClearFilters}>
                  <X className="size-4 mr-2" />
                  Сбросить
                </Button>
                <Button className="flex-1" onClick={handleApplyFilters}>
                  Применить
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <Button 
            size="sm" 
            onClick={handleOpenCreate}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            Добавить
          </Button>
        </div>
      </div>

      {/* Sets List */}
      <div className="flex-1 overflow-y-auto">
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
                  ? 'Запишите свой первый подход'
                  : 'Сначала добавьте хотя бы одно упражнение'
              }
            </Empty.Description>
            {activeFiltersCount === 0 && (
              <Empty.Actions>
                <Button onClick={handleOpenCreate} disabled={!canCreateSet}>
                  <Plus className="size-4 mr-2" />
                  Добавить подход
                </Button>
              </Empty.Actions>
            )}
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
                            <span className="font-medium text-foreground">{getExerciseName(set)}</span>
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
              <FieldLabel htmlFor="set-exercise">Упражнение</FieldLabel>
              <Select
                value={formData.exercise_id.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, exercise_id: parseInt(value) }))}
              >
                <SelectTrigger id="set-exercise">
                  <SelectValue placeholder="Выберите упражнение" />
                </SelectTrigger>
                <SelectContent>
                  {activeExercises.map(exercise => (
                    <SelectItem key={exercise.id} value={exercise.id.toString()}>
                      {exercise.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            {showDateField && !editingSet && (
              <Field>
                <FieldLabel htmlFor="set-date">Дата (опционально)</FieldLabel>
                <Input
                  id="set-date"
                  type="date"
                  value={formData.created_at ? formatForInput(parseFromInput(formData.created_at)) : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      const date = parseFromInput(e.target.value);
                      setFormData(prev => ({ ...prev, created_at: formatForApi(date) }));
                    } else {
                      setFormData(prev => ({ ...prev, created_at: undefined }));
                    }
                  }}
                />
              </Field>
            )}
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
