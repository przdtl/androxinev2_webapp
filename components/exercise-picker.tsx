'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { EntityId, Exercise } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type CategoryMeta = {
  id: string;
  label: string;
};

interface ExercisePickerProps {
  exercises: Exercise[];
  selectedIds: EntityId[];
  onChange: (ids: EntityId[]) => void;
  multiple?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  recentStorageKey?: string;
  maxRecent?: number;
  disabled?: boolean;
}

function toIdString(id: EntityId): string {
  return String(id);
}

function idsEqual(a: EntityId, b: EntityId): boolean {
  return String(a) === String(b);
}

function getCategoryMeta(exercise: Exercise): CategoryMeta {
  if (exercise.category && typeof exercise.category === 'object') {
    return {
      id: toIdString(exercise.category.id),
      label: exercise.category.title,
    };
  }

  if (exercise.category !== null && exercise.category !== undefined) {
    return {
      id: toIdString(exercise.category),
      label: `Категория #${exercise.category}`,
    };
  }

  return {
    id: 'uncategorized',
    label: 'Без категории',
  };
}

export function ExercisePicker({
  exercises,
  selectedIds,
  onChange,
  multiple = false,
  placeholder = 'Выберите упражнение',
  searchPlaceholder = 'Поиск упражнения...',
  emptyText = 'Ничего не найдено',
  recentStorageKey = 'exercise-picker-recent',
  maxRecent = 8,
  disabled = false,
}: ExercisePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [recentIdStrings, setRecentIdStrings] = useState<string[]>([]);

  const categories = useMemo(() => {
    const entries = new Map<string, string>();
    exercises.forEach((exercise) => {
      const category = getCategoryMeta(exercise);
      entries.set(category.id, category.label);
    });

    return Array.from(entries.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ru'));
  }, [exercises]);

  const exerciseByIdString = useMemo(() => {
    const map = new Map<string, Exercise>();
    exercises.forEach((exercise) => {
      map.set(toIdString(exercise.id), exercise);
    });
    return map;
  }, [exercises]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(recentStorageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;

      const normalized = parsed
        .map((item) => String(item))
        .filter((item, index, arr) => item && arr.indexOf(item) === index)
        .slice(0, maxRecent);

      setRecentIdStrings(normalized);
    } catch {
      setRecentIdStrings([]);
    }
  }, [recentStorageKey, maxRecent]);

  const persistRecent = (nextRecent: string[]) => {
    setRecentIdStrings(nextRecent);
    try {
      localStorage.setItem(recentStorageKey, JSON.stringify(nextRecent));
    } catch {
      // ignore localStorage errors in restricted environments
    }
  };

  const touchRecent = (id: EntityId) => {
    const idString = toIdString(id);
    const nextRecent = [idString, ...recentIdStrings.filter((item) => item !== idString)].slice(0, maxRecent);
    persistRecent(nextRecent);
  };

  const recentExercises = useMemo(() => {
    return recentIdStrings
      .map((idString) => exerciseByIdString.get(idString))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
  }, [exerciseByIdString, recentIdStrings]);

  const filteredExercises = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return exercises.filter((exercise) => {
      if (selectedCategoryId !== 'all') {
        const category = getCategoryMeta(exercise);
        if (category.id !== selectedCategoryId) return false;
      }

      if (!normalizedQuery) return true;

      const category = getCategoryMeta(exercise);
      const haystack = `${exercise.title} ${exercise.short} ${category.label}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [exercises, query, selectedCategoryId]);

  const showRecent = query.trim() === '' && selectedCategoryId === 'all' && recentExercises.length > 0;
  const recentSet = new Set(recentExercises.map((exercise) => toIdString(exercise.id)));

  const groupedExercises = useMemo(() => {
    const groups = new Map<string, { label: string; items: Exercise[] }>();

    filteredExercises.forEach((exercise) => {
      if (showRecent && recentSet.has(toIdString(exercise.id))) return;

      const category = getCategoryMeta(exercise);
      const existing = groups.get(category.id);

      if (existing) {
        existing.items.push(exercise);
      } else {
        groups.set(category.id, { label: category.label, items: [exercise] });
      }
    });

    return Array.from(groups.entries())
      .map(([id, group]) => ({ id, ...group }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ru'));
  }, [filteredExercises, recentSet, showRecent]);

  const selectedExercises = useMemo(() => {
    return selectedIds
      .map((id) => exerciseByIdString.get(toIdString(id)))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
  }, [exerciseByIdString, selectedIds]);

  const isSelected = (id: EntityId) => {
    return selectedIds.some((selectedId) => idsEqual(selectedId, id));
  };

  const toggleSelection = (exercise: Exercise) => {
    if (multiple) {
      const selected = isSelected(exercise.id);
      if (selected) {
        onChange(selectedIds.filter((id) => !idsEqual(id, exercise.id)));
        return;
      }

      touchRecent(exercise.id);
      onChange([...selectedIds, exercise.id]);
      return;
    }

    touchRecent(exercise.id);
    onChange([exercise.id]);
    setOpen(false);
  };

  const triggerLabel = (() => {
    if (multiple) {
      if (selectedExercises.length === 0) return placeholder;
      return `Выбрано: ${selectedExercises.length}`;
    }

    const selected = selectedExercises[0];
    return selected ? selected.title : placeholder;
  })();

  const renderExerciseItem = (exercise: Exercise) => {
    const category = getCategoryMeta(exercise);
    const selected = isSelected(exercise.id);

    return (
      <CommandItem
        key={toIdString(exercise.id)}
        value={`${exercise.title} ${exercise.short} ${category.label}`}
        onSelect={() => toggleSelection(exercise)}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{exercise.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {category.label}
              {exercise.short ? ` • ${exercise.short}` : ''}
            </p>
          </div>
        </div>
        {selected ? <Check className="size-4" /> : null}
      </CommandItem>
    );
  };

  const hasItems = showRecent || groupedExercises.some((group) => group.items.length > 0);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={disabled}
          >
            <span className="truncate">{triggerLabel}</span>
            <ChevronDown className="ml-2 size-4 shrink-0 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(32rem,calc(100vw-2rem))] p-0"
          align="start"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={query}
              onValueChange={setQuery}
            />
            <div className="border-b p-2">
              {query.trim() ? (
                <div className="mb-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={() => setQuery('')}
                  >
                    Очистить поиск
                  </Button>
                </div>
              ) : null}
              <div className="overflow-x-auto pb-1">
                <div className="flex w-max gap-1">
                  <Button
                    size="sm"
                    variant={selectedCategoryId === 'all' ? 'secondary' : 'ghost'}
                    className="h-7 shrink-0 whitespace-nowrap"
                    onClick={() => setSelectedCategoryId('all')}
                  >
                    Все
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      size="sm"
                      variant={selectedCategoryId === category.id ? 'secondary' : 'ghost'}
                      className="h-7 shrink-0 whitespace-nowrap"
                      onClick={() => setSelectedCategoryId(category.id)}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <CommandList className="max-h-[320px]">
              {!hasItems ? <CommandEmpty>{emptyText}</CommandEmpty> : null}

              {showRecent ? (
                <CommandGroup heading="Недавние">
                  {recentExercises.map((exercise) => renderExerciseItem(exercise))}
                </CommandGroup>
              ) : null}

              {groupedExercises.map((group) => (
                <CommandGroup key={group.id} heading={group.label}>
                  {group.items.map((exercise) => renderExerciseItem(exercise))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
