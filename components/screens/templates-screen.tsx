'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, MoreVertical, Pencil, Trash2, Calendar, ListChecks, X } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { useTelegram } from '@/hooks/use-telegram';
import type { Template, TemplateFormData, EntityId } from '@/lib/types';
import { DAYS_OF_WEEK, getDayLabel } from '@/lib/types';
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
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { Empty } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { ExercisePicker } from '@/components/exercise-picker';

export function TemplatesScreen() {
  const { 
    templates, 
    exercises,
    loadTemplates, 
    loadExercises,
    createTemplate, 
    updateTemplate, 
    deleteTemplate,
  } = useApp();
  const { haptic } = useTelegram();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>({ 
    title: '', 
    day_of_week: null,
    exercises: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadTemplates(), loadExercises()])
      .finally(() => setIsLoading(false));
  }, [loadTemplates, loadExercises]);

  // Group exercises by not archived
  const activeExercises = useMemo(() => {
    return exercises.filter(e => !e.is_archived);
  }, [exercises]);

  const getExerciseIds = (template: Template): EntityId[] => {
    if (!Array.isArray(template.exercises)) return [];

    return template.exercises
      .map((item) => item.exercise?.id ?? item.exercise_id)
      .filter((id): id is EntityId => id !== undefined && id !== null);
  };

  const idsEqual = (a: EntityId, b: EntityId): boolean => String(a) === String(b);

  const getExerciseNames = (template: Template): string[] => {
    const ids = getExerciseIds(template);
    return ids.map(id => {
      const exercise = exercises.find(e => idsEqual(e.id, id));
      return exercise?.title || `Упражнение #${id}`;
    });
  };

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormData({ title: '', day_of_week: null, exercises: [] });
    setIsDialogOpen(true);
    haptic?.impactOccurred('light');
  };

  const handleOpenEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({ 
      title: template.title, 
      day_of_week: template.day_of_week,
      exercises: getExerciseIds(template),
    });
    setIsDialogOpen(true);
    haptic?.impactOccurred('light');
  };

  const handleOpenDelete = (template: Template) => {
    setDeletingTemplate(template);
    setIsDeleteDialogOpen(true);
    haptic?.impactOccurred('medium');
  };

  const handleToggleExercise = (exerciseId: EntityId) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.some(id => idsEqual(id, exerciseId))
        ? prev.exercises.filter(id => !idsEqual(id, exerciseId))
        : [...prev.exercises, exerciseId],
    }));
    haptic?.selectionChanged();
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, formData);
        haptic?.notificationOccurred('success');
      } else {
        await createTemplate(formData);
        haptic?.notificationOccurred('success');
      }
      setIsDialogOpen(false);
      setFormData({ title: '', day_of_week: null, exercises: [] });
    } catch (error) {
      console.error('Failed to save template:', error);
      haptic?.notificationOccurred('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTemplate) return;
    
    try {
      await deleteTemplate(deletingTemplate.id);
      haptic?.notificationOccurred('success');
      setIsDeleteDialogOpen(false);
      setDeletingTemplate(null);
    } catch (error) {
      console.error('Failed to delete template:', error);
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
        <h1 className="text-xl font-semibold text-foreground">Шаблоны</h1>
        <Button 
          size="sm" 
          onClick={handleOpenCreate}
          className="gap-1.5"
        >
          <Plus className="size-4" />
          Добавить
        </Button>
      </div>

      {/* Templates List */}
      <div className="flex-1 overflow-y-auto">
        {templates.length === 0 ? (
          <Empty className="mt-16">
            <Empty.Icon>
              <ListChecks className="size-10" />
            </Empty.Icon>
            <Empty.Title>Нет шаблонов</Empty.Title>
            <Empty.Description>
              Создайте шаблон тренировки для быстрого добавления подходов
            </Empty.Description>
            <Empty.Actions>
              <Button onClick={handleOpenCreate}>
                <Plus className="size-4 mr-2" />
                Создать шаблон
              </Button>
            </Empty.Actions>
          </Empty>
        ) : (
          <ul className="divide-y divide-border">
            {templates.map((template) => {
              const exerciseNames = getExerciseNames(template);
              return (
                <li key={template.id}>
                  <div className="flex items-start bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex-1 px-4 py-3.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{template.title}</span>
                        {template.day_of_week !== null && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Calendar className="size-3" />
                            {getDayLabel(template.day_of_week)}
                          </Badge>
                        )}
                      </div>
                      {exerciseNames.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {exerciseNames.join(', ')}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="mr-2 mt-2">
                          <MoreVertical className="size-5" />
                          <span className="sr-only">Меню</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(template)}>
                          <Pencil className="size-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          variant="destructive"
                          onClick={() => handleOpenDelete(template)}
                        >
                          <Trash2 className="size-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Редактировать шаблон' : 'Новый шаблон'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="template-title">Название</FieldLabel>
                <Input
                  id="template-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Например: День груди"
                  autoFocus
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="template-day">День недели</FieldLabel>
                <Select
                  value={formData.day_of_week?.toString() ?? 'none'}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    day_of_week: value === 'none' ? null : parseInt(value) 
                  }))}
                >
                  <SelectTrigger id="template-day">
                    <SelectValue placeholder="Выберите день" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без привязки</SelectItem>
                    {DAYS_OF_WEEK.map(day => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Упражнения</FieldLabel>
                {activeExercises.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Нет доступных упражнений. Создайте упражнения в разделе категорий.
                  </p>
                ) : (
                  <ExercisePicker
                    exercises={activeExercises}
                    selectedIds={formData.exercises}
                    onChange={(ids) => setFormData(prev => ({ ...prev, exercises: ids }))}
                    multiple
                    placeholder="Выберите упражнения"
                    searchPlaceholder="Поиск упражнения..."
                    recentStorageKey="templates-exercises-recent"
                  />
                )}
                {formData.exercises.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {formData.exercises.map((exerciseId) => {
                      const exercise = exercises.find((item) => idsEqual(item.id, exerciseId));
                      const label = exercise?.title || `Упражнение #${exerciseId}`;
                      return (
                        <Badge key={String(exerciseId)} variant="secondary" className="gap-1 pl-2 pr-1">
                          <span>{label}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-5"
                            onClick={() => handleToggleExercise(exerciseId)}
                          >
                            <X className="size-3" />
                            <span className="sr-only">Удалить упражнение</span>
                          </Button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !formData.title.trim()}>
              {isSubmitting ? <Spinner className="size-4 mr-2" /> : null}
              {editingTemplate ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить шаблон?</AlertDialogTitle>
            <AlertDialogDescription>
              Шаблон &quot;{deletingTemplate?.title}&quot; будет удалён. Это действие нельзя отменить.
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
