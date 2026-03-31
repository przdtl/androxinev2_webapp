'use client';

import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, History, Dumbbell, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useApp } from '@/lib/app-context';
import { useTelegram } from '@/hooks/use-telegram';
import api from '@/lib/api';
import type { EntityId, ExerciseFormData, WorkoutSet } from '@/lib/types';
import { formatDate, formatTime, parseServerDate } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Empty } from '@/components/ui/empty';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { buildExerciseShort } from '@/lib/exercise-short';

interface ExerciseDetailsScreenProps {
  exerciseId: EntityId;
  onBack: () => void;
  onOpenSetsList: () => void;
}

const chartConfig = {
  maxWeight: {
    label: 'Макс. вес',
    color: 'var(--color-chart-1)',
  },
} satisfies ChartConfig;

export function ExerciseDetailsScreen({ exerciseId, onBack, onOpenSetsList }: ExerciseDetailsScreenProps) {
  const { getExerciseById, getCategoryById, loadExercises, updateExercise, deleteExercise } = useApp();
  const { haptic } = useTelegram();
  const [isLoading, setIsLoading] = useState(true);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAutoShort, setLastAutoShort] = useState('');
  const [formData, setFormData] = useState<ExerciseFormData>({
    title: '',
    short: '',
  });

  const exercise = getExerciseById(exerciseId);

  useEffect(() => {
    if (!exercise) return;
    const categoryId = typeof exercise.category === 'object' ? exercise.category.id : exercise.category;
    setFormData({
      title: exercise.title,
      short: exercise.short,
      category_id: categoryId,
    });
    setLastAutoShort('');
  }, [exercise]);

  const handleTitleChange = (title: string) => {
    const nextTitle = title;
    let nextAutoShort: string | null = null;

    setFormData((prev) => {
      const currentShort = prev.short ?? '';
      const shouldAutoFill = currentShort.trim() === '' || currentShort === lastAutoShort;

      if (!shouldAutoFill) {
        return { ...prev, title: nextTitle };
      }

      nextAutoShort = buildExerciseShort(nextTitle);
      return {
        ...prev,
        title: nextTitle,
        short: nextAutoShort,
      };
    });

    if (nextAutoShort !== null) {
      setLastAutoShort(nextAutoShort);
    }
  };

  const handleShortChange = (short: string) => {
    setFormData((prev) => ({ ...prev, short }));

    if (short !== lastAutoShort) {
      setLastAutoShort('');
    }
  };

  useEffect(() => {
    if (!exercise) {
      void loadExercises();
    }
  }, [exercise, loadExercises]);

  useEffect(() => {
    let active = true;

    async function loadExerciseSets() {
      setIsLoading(true);
      try {
        const data = await api.getSets({ exercise_id: exerciseId });
        if (!active) return;
        setSets(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load exercise sets:', error);
        if (!active) return;
        setSets([]);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadExerciseSets();

    return () => {
      active = false;
    };
  }, [exerciseId]);

  const category = useMemo(() => {
    if (!exercise) return null;
    const categoryId = typeof exercise.category === 'object' ? exercise.category.id : exercise.category;
    return getCategoryById(categoryId);
  }, [exercise, getCategoryById]);

  const sortedSets = useMemo(() => {
    return [...sets].sort((a, b) => parseServerDate(b.created_at).getTime() - parseServerDate(a.created_at).getTime());
  }, [sets]);

  const chartData = useMemo(() => {
    const map = new Map<string, { dateLabel: string; maxWeight: number }>();

    sets.forEach((set) => {
      const date = parseServerDate(set.created_at);
      const key = formatDate(date, 'yyyy-MM-dd');
      const dateLabel = formatDate(date, 'dd.MM');
      const prev = map.get(key);

      if (!prev || set.weight > prev.maxWeight) {
        map.set(key, { dateLabel, maxWeight: set.weight });
      }
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([, value]) => value);
  }, [sets]);

  const stats = useMemo(() => {
    if (!sets.length) {
      return {
        totalSets: 0,
        maxWeight: 0,
        maxReps: 0,
      };
    }

    return {
      totalSets: sets.length,
      maxWeight: Math.max(...sets.map((set) => set.weight)),
      maxReps: Math.max(...sets.map((set) => set.reps)),
    };
  }, [sets]);

  const handleSaveExercise = async () => {
    if (!exercise) return;

    const title = formData.title.trim();
    if (!title) return;

    const short = formData.short?.trim() || buildExerciseShort(title);

    setIsSubmitting(true);
    try {
      await updateExercise(exercise.id, {
        title,
        short,
      });
      haptic?.notificationOccurred('success');
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update exercise:', error);
      haptic?.notificationOccurred('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExercise = async () => {
    if (!exercise) return;

    setIsSubmitting(true);
    try {
      await deleteExercise(exercise.id);
      haptic?.notificationOccurred('success');
      setIsDeleteDialogOpen(false);
      onBack();
    } catch (error) {
      console.error('Failed to delete exercise:', error);
      haptic?.notificationOccurred('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex min-w-0 items-center justify-between border-b border-border bg-card px-4 py-3">
        <h1 className="min-w-0 truncate text-lg font-semibold text-foreground">{exercise?.title || 'Упражнение'}</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="-mr-2" disabled={!exercise}>
              <MoreVertical className="size-5" />
              <span className="sr-only">Действия с упражнением</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setIsEditDialogOpen(true);
                haptic?.impactOccurred('light');
              }}
            >
              <Pencil className="mr-2 size-4" />
              Редактировать
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                setIsDeleteDialogOpen(true);
                haptic?.impactOccurred('medium');
              }}
            >
              <Trash2 className="mr-2 size-4" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Упражнение</p>
              <p className="min-w-0 truncate text-base font-semibold text-foreground">{exercise?.title || 'Не найдено'}</p>
            </div>
            {category ? (
              <div className="min-w-0 max-w-[8rem] flex-shrink-0">
                <Badge variant="outline" className="w-full truncate" title={category.title}>
                  {category.title}
                </Badge>
              </div>
            ) : null}
          </div>
          {exercise?.short ? <p className="mt-2 text-sm text-muted-foreground">Сокращение: {exercise.short}</p> : null}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Подходов" value={String(stats.totalSets)} />
          <StatCard label="Макс. вес" value={`${stats.maxWeight} кг`} />
          <StatCard label="Макс. повт." value={String(stats.maxReps)} />
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">График прогресса</h2>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Spinner className="size-6 text-primary" />
            </div>
          ) : chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Недостаточно данных для графика.</p>
          ) : (
            <ChartContainer config={chartConfig} className="h-44 w-full">
              <LineChart data={chartData} margin={{ left: 4, right: 4, top: 6, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="dateLabel" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={34}
                  domain={[
                    (min: number) => Math.max(0, min - 2),
                    (max: number) => max + 2,
                  ]}
                />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Line
                  type="monotone"
                  dataKey="maxWeight"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2.5}
                  connectNulls
                  dot={{ r: 2, fill: 'var(--color-chart-1)' }}
                  activeDot={{ r: 4, fill: 'var(--color-chart-1)' }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <History className="size-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Список подходов</h2>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                haptic?.selectionChanged();
                onOpenSetsList();
              }}
            >
              Открыть в подходах
            </Button>
          </div>

          {isLoading ? (
            <div className="flex h-24 items-center justify-center">
              <Spinner className="size-6 text-primary" />
            </div>
          ) : sortedSets.length === 0 ? (
            <Empty className="my-8">
              <Empty.Icon>
                <Dumbbell className="size-8" />
              </Empty.Icon>
              <Empty.Title>Пока нет подходов</Empty.Title>
              <Empty.Description>Добавьте первый подход для этого упражнения.</Empty.Description>
            </Empty>
          ) : (
            <ul className="divide-y divide-border">
              {sortedSets.slice(0, 30).map((set) => (
                <li key={String(set.id)} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground">{formatDate(set.created_at, 'd MMMM')}</div>
                    <div className="text-xs text-muted-foreground">{formatTime(set.created_at)}</div>
                  </div>
                  <div className="mt-1 text-sm font-medium text-foreground">
                    {set.reps} повт. x {set.weight} кг
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div aria-hidden="true" className="h-[env(safe-area-inset-bottom)]" />
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle>Редактировать упражнение</DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="exercise-title">Название</FieldLabel>
              <Input
                id="exercise-title"
                value={formData.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                placeholder="Например: Жим лёжа"
                autoFocus
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="exercise-short">Сокращение</FieldLabel>
              <Input
                id="exercise-short"
                value={formData.short}
                onChange={(event) => handleShortChange(event.target.value)}
                placeholder="Например: ЖЛ"
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button type="button" onClick={handleSaveExercise} disabled={isSubmitting || !formData.title.trim()}>
              {isSubmitting ? <Spinner className="mr-2 size-4" /> : null}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить упражнение?</AlertDialogTitle>
            <AlertDialogDescription>
              Упражнение &quot;{exercise?.title || 'Без названия'}&quot; будет удалено. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExercise}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? <Spinner className="mr-2 size-4" /> : null}
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
