'use client';

import { useState, useEffect } from 'react';
import { Plus, ChevronRight, MoreVertical, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { useApp } from '@/lib/app-context';
import { useTelegram } from '@/hooks/use-telegram';
import type { Category, CategoryFormData, EntityId } from '@/lib/types';
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
import { ExercisesScreen } from './exercises-screen';
import { Empty } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';

export function CategoriesScreen() {
  const { 
    categories, 
    loadCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    selectedCategoryId,
    setSelectedCategoryId,
    isLoading,
  } = useApp();
  const { haptic, showBackButton, hideBackButton } = useTelegram();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({ title: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Handle back button for exercises view
  useEffect(() => {
    if (selectedCategoryId) {
      showBackButton(() => {
        setSelectedCategoryId(null);
        haptic?.impactOccurred('light');
      });
    } else {
      hideBackButton();
    }
    return () => hideBackButton();
  }, [selectedCategoryId, showBackButton, hideBackButton, setSelectedCategoryId, haptic]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ title: '' });
    setIsDialogOpen(true);
    haptic?.impactOccurred('light');
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ title: category.title });
    setIsDialogOpen(true);
    haptic?.impactOccurred('light');
  };

  const handleOpenDelete = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
    haptic?.impactOccurred('medium');
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        haptic?.notificationOccurred('success');
      } else {
        await createCategory(formData);
        haptic?.notificationOccurred('success');
      }
      setIsDialogOpen(false);
      setFormData({ title: '' });
    } catch (error) {
      console.error('Failed to save category:', error);
      haptic?.notificationOccurred('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    
    try {
      await deleteCategory(deletingCategory.id);
      haptic?.notificationOccurred('success');
      setIsDeleteDialogOpen(false);
      setDeletingCategory(null);
    } catch (error) {
      console.error('Failed to delete category:', error);
      haptic?.notificationOccurred('error');
    }
  };

  const handleSelectCategory = (categoryId: EntityId) => {
    setSelectedCategoryId(categoryId);
    haptic?.impactOccurred('light');
  };

  // Show exercises for selected category
  if (selectedCategoryId) {
    const selectedCategory = categories.find(c => c.id === selectedCategoryId);
    return (
      <ExercisesScreen 
        categoryId={selectedCategoryId}
        categoryTitle={selectedCategory?.title || 'Упражнения'}
      />
    );
  }

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
        <h1 className="text-xl font-semibold text-foreground">Категории</h1>
        <Button 
          size="sm" 
          onClick={handleOpenCreate}
          className="gap-1.5"
        >
          <Plus className="size-4" />
          Добавить
        </Button>
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto">
        {categories.length === 0 ? (
          <Empty className="mt-16">
            <Empty.Icon>
              <FolderOpen className="size-10" />
            </Empty.Icon>
            <Empty.Title>Нет категорий</Empty.Title>
            <Empty.Description>
              Создайте первую категорию для группировки упражнений
            </Empty.Description>
            <Empty.Actions>
              <Button onClick={handleOpenCreate}>
                <Plus className="size-4 mr-2" />
                Создать категорию
              </Button>
            </Empty.Actions>
          </Empty>
        ) : (
          <ul className="divide-y divide-border">
            {categories.map((category) => (
              <li key={category.id}>
                <div className="flex items-center bg-card hover:bg-muted/50 transition-colors touch-feedback">
                  <button
                    onClick={() => handleSelectCategory(category.id)}
                    className="flex-1 flex items-center justify-between px-4 py-3.5 text-left"
                  >
                    <span className="font-medium text-foreground">{category.title}</span>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="mr-2">
                        <MoreVertical className="size-5" />
                        <span className="sr-only">Меню</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEdit(category)}>
                        <Pencil className="size-4 mr-2" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        variant="destructive"
                        onClick={() => handleOpenDelete(category)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            ))}
            <li aria-hidden="true" className="h-[env(safe-area-inset-bottom)]" />
          </ul>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Редактировать категорию' : 'Новая категория'}
            </DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="category-title">Название</FieldLabel>
              <Input
                id="category-title"
                value={formData.title}
                onChange={(e) => setFormData({ title: e.target.value })}
                placeholder="Например: Грудь"
                autoFocus
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !formData.title.trim()}>
              {isSubmitting ? <Spinner className="size-4 mr-2" /> : null}
              {editingCategory ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить категорию?</AlertDialogTitle>
            <AlertDialogDescription>
              Категория &quot;{deletingCategory?.title}&quot; будет удалена. Это действие нельзя отменить.
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
