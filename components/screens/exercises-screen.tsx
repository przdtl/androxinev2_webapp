'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, MoreVertical, Pencil, Trash2, Archive, ArchiveRestore, Dumbbell, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { useTelegram } from '@/hooks/use-telegram';
import type { Exercise, ExerciseFormData } from '@/lib/types';
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
  DropdownMenuSeparator,
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
import { cn } from '@/lib/utils';

interface ExercisesScreenProps {
  categoryId: number;
  categoryTitle: string;
}

export function ExercisesScreen({ categoryId, categoryTitle }: ExercisesScreenProps) {
  const { 
    exercises, 
    loadExercises, 
    createExercise, 
    updateExercise, 
    deleteExercise,
    archiveExercise,
    restoreExercise,
  } = useApp();
  const { haptic } = useTelegram();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [deletingExercise, setDeletingExercise] = useState<Exercise | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [formData, setFormData] = useState<ExerciseFormData>({ 
    title: '', 
    short: '',
    category: categoryId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    loadExercises(categoryId).finally(() => setIsLoading(false));
  }, [loadExercises, categoryId]);

  // Filter exercises by category and archive status
  const filteredExercises = useMemo(() => {
    return exercises.filter(e => {
      const catId = typeof e.category === 'object' ? e.category.id : e.category;
      const matchesCategory = catId === categoryId;
      const matchesArchiveFilter = showArchived ? e.is_archived : !e.is_archived;
      return matchesCategory && matchesArchiveFilter;
    });
  }, [exercises, categoryId, showArchived]);

  const archivedCount = useMemo(() => {
    return exercises.filter(e => {
      const catId = typeof e.category === 'object' ? e.category.id : e.category;
      return catId === categoryId && e.is_archived;
    }).length;
  }, [exercises, categoryId]);

  const handleOpenCreate = () => {
    setEditingExercise(null);
    setFormData({ title: '', short: '', category: categoryId });
    setIsDialogOpen(true);
    haptic?.impactOccurred('light');
  };

  const handleOpenEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    const catId = typeof exercise.category === 'object' ? exercise.category.id : exercise.category;
    setFormData({ 
      title: exercise.title, 
      short: exercise.short,
      category: catId,
    });
    setIsDialogOpen(true);
    haptic?.impactOccurred('light');
  };

  const handleOpenDelete = (exercise: Exercise) => {
    setDeletingExercise(exercise);
    setIsDeleteDialogOpen(true);
    haptic?.impactOccurred('medium');
  };

  const handleArchive = async (exercise: Exercise) => {
    try {
      await archiveExercise(exercise.id);
      haptic?.notificationOccurred('success');
    } catch (error) {
      console.error('Failed to archive exercise:', error);
      haptic?.notificationOccurred('error');
    }
  };

  const handleRestore = async (exercise: Exercise) => {
    try {
      await restoreExercise(exercise.id);
      haptic?.notificationOccurred('success');
    } catch (error) {
      console.error('Failed to restore exercise:', error);
      haptic?.notificationOccurred('error');
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (editingExercise) {
        await updateExercise(editingExercise.id, formData);
        haptic?.notificationOccurred('success');
      } else {
        await createExercise(formData);
        haptic?.notificationOccurred('success');
      }
      setIsDialogOpen(false);
      setFormData({ title: '', short: '', category: categoryId });
    } catch (error) {
      console.error('Failed to save exercise:', error);
      haptic?.notificationOccurred('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingExercise) return;
    
    try {
      await deleteExercise(deletingExercise.id);
      haptic?.notificationOccurred('success');
      setIsDeleteDialogOpen(false);
      setDeletingExercise(null);
    } catch (error) {
      console.error('Failed to delete exercise:', error);
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
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-foreground truncate">{categoryTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {filteredExercises.length} {showArchived ? 'в архиве' : 'упражнений'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {archivedCount > 0 && (
            <Button 
              size="sm" 
              variant={showArchived ? 'secondary' : 'ghost'}
              onClick={() => setShowArchived(!showArchived)}
              className="gap-1.5"
            >
              {showArchived ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              {archivedCount}
            </Button>
          )}
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

      {/* Exercises List */}
      <div className="flex-1 overflow-y-auto">
        {filteredExercises.length === 0 ? (
          <Empty className="mt-16">
            <Empty.Icon>
              <Dumbbell className="size-10" />
            </Empty.Icon>
            <Empty.Title>
              {showArchived ? 'Нет архивных упражнений' : 'Нет упражнений'}
            </Empty.Title>
            <Empty.Description>
              {showArchived 
                ? 'Архивированные упражнения появятся здесь'
                : 'Добавьте первое упражнение в эту категорию'
              }
            </Empty.Description>
            {!showArchived && (
              <Empty.Actions>
                <Button onClick={handleOpenCreate}>
                  <Plus className="size-4 mr-2" />
                  Добавить упражнение
                </Button>
              </Empty.Actions>
            )}
          </Empty>
        ) : (
          <ul className="divide-y divide-border">
            {filteredExercises.map((exercise) => (
              <li key={exercise.id}>
                <div className={cn(
                  "flex items-center bg-card hover:bg-muted/50 transition-colors",
                  exercise.is_archived && "opacity-60"
                )}>
                  <div className="flex-1 px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{exercise.title}</span>
                      {exercise.is_archived && (
                        <Badge variant="secondary" className="text-xs">Архив</Badge>
                      )}
                    </div>
                    {exercise.short && (
                      <p className="text-sm text-muted-foreground mt-0.5">{exercise.short}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="mr-2">
                        <MoreVertical className="size-5" />
                        <span className="sr-only">Меню</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEdit(exercise)}>
                        <Pencil className="size-4 mr-2" />
                        Редактировать
                      </DropdownMenuItem>
                      {exercise.is_archived ? (
                        <DropdownMenuItem onClick={() => handleRestore(exercise)}>
                          <ArchiveRestore className="size-4 mr-2" />
                          Восстановить
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleArchive(exercise)}>
                          <Archive className="size-4 mr-2" />
                          В архив
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        variant="destructive"
                        onClick={() => handleOpenDelete(exercise)}
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
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle>
              {editingExercise ? 'Редактировать упражнение' : 'Новое упражнение'}
            </DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="exercise-title">Название</FieldLabel>
              <Input
                id="exercise-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Например: Жим лёжа"
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="exercise-short">Сокращение</FieldLabel>
              <Input
                id="exercise-short"
                value={formData.short}
                onChange={(e) => setFormData(prev => ({ ...prev, short: e.target.value }))}
                placeholder="Например: ЖЛ"
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !formData.title.trim()}>
              {isSubmitting ? <Spinner className="size-4 mr-2" /> : null}
              {editingExercise ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить упражнение?</AlertDialogTitle>
            <AlertDialogDescription>
              Упражнение &quot;{deletingExercise?.title}&quot; будет удалено. Это действие нельзя отменить.
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
