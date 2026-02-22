import { useState, useEffect, type MouseEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import {
  CategoriesApi,
  Category,
  ExercisesApi,
  Exercise
} from "../api/endpoints";

export default function Categories() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [categories, setCategories] = useState<Category[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openExerciseDialog, setOpenExerciseDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseShort, setExerciseShort] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCategory, setMenuCategory] = useState<Category | null>(null);
  const [exerciseMenuAnchorEl, setExerciseMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuExercise, setMenuExercise] = useState<Exercise | null>(null);
  const [addMenuAnchorEl, setAddMenuAnchorEl] = useState<null | HTMLElement>(null);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await CategoriesApi.list();
      setCategories(res.data.items);
    } catch (err) {
      console.error("Ошибка загрузки категорий:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadExercises = async (categoryId: string) => {
    setLoadingExercises(true);
    try {
      const res = await ExercisesApi.list({ category_id: categoryId });
      setExercises(res.data.items);
    } catch (err) {
      console.error("Ошибка загрузки упражнений:", err);
    } finally {
      setLoadingExercises(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async () => {
    if (!categoryName.trim()) return;
    try {
      const res = await CategoriesApi.create({ title: categoryName });
      setCategories((prev) => [...prev, res.data]);
      setCategoryName("");
      setOpenCategoryDialog(false);
    } catch (err) {
      console.error("Ошибка создания категории:", err);
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory || !categoryName.trim()) return;
    try {
      const res = await CategoriesApi.update(editingCategory.id, { title: categoryName });
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? res.data : c))
      );
      if (selectedCategory?.id === editingCategory.id) {
        setSelectedCategory(res.data);
      }
      setCategoryName("");
      setEditingCategory(null);
      setOpenCategoryDialog(false);
    } catch (err) {
      console.error("Ошибка обновления категории:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить категорию?")) return;
    try {
      await CategoriesApi.remove(id);
      setCategories((prev) => prev.filter((category) => category.id !== id));
      if (selectedCategory?.id === id) {
        setSelectedCategory(null);
        setExercises([]);
      }
    } catch (err) {
      console.error("Ошибка удаления категории:", err);
    }
  };

  const handleCreateExercise = async () => {
    if (!exerciseName.trim() || !exerciseShort.trim() || !categoryId) return;
    try {
      const res = await ExercisesApi.create({
        title: exerciseName,
        short: exerciseShort,
        category_id: categoryId
      });
      if (!selectedCategory || selectedCategory.id === categoryId) {
        setExercises((prev) => [...prev, res.data]);
      }
      setExerciseName("");
      setExerciseShort("");
      setCategoryId("");
      setEditingExercise(null);
      setOpenExerciseDialog(false);
    } catch (err) {
      console.error("Ошибка создания упражнения:", err);
    }
  };

  const handleUpdateExercise = async () => {
    if (!editingExercise || !exerciseName.trim() || !exerciseShort.trim()) return;
    try {
      const res = await ExercisesApi.update(editingExercise.id, {
        title: exerciseName,
        short: exerciseShort
      });
      setExercises((prev) =>
        prev.map((e) => (e.id === editingExercise.id ? res.data : e))
      );
      setExerciseName("");
      setExerciseShort("");
      setCategoryId("");
      setEditingExercise(null);
      setOpenExerciseDialog(false);
    } catch (err) {
      console.error("Ошибка обновления упражнения:", err);
    }
  };

  const handleArchiveExercise = async (id: string) => {
    try {
      await ExercisesApi.archive(id);
      setExercises((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_archived: true } : e))
      );
    } catch (err) {
      console.error("Ошибка архивирования упражнения:", err);
    }
  };

  const handleRestoreExercise = async (id: string) => {
    try {
      await ExercisesApi.restore(id);
      setExercises((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_archived: false } : e))
      );
    } catch (err) {
      console.error("Ошибка восстановления упражнения:", err);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!confirm("Удалить упражнение?")) return;
    try {
      await ExercisesApi.remove(id);
      setExercises((prev) => prev.filter((exercise) => exercise.id !== id));
    } catch (err) {
      console.error("Ошибка удаления упражнения:", err);
    }
  };

  const openCreateDialog = () => {
    setEditingCategory(null);
    setCategoryName("");
    setOpenCategoryDialog(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.title);
    setOpenCategoryDialog(true);
  };

  const openExerciseCreateDialog = (category?: Category | null) => {
    setEditingExercise(null);
    setExerciseName("");
    setExerciseShort("");
    setCategoryId(category?.id || "");
    setOpenExerciseDialog(true);
  };

  const openExerciseEditDialog = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setExerciseName(exercise.title);
    setExerciseShort(exercise.short);
    setCategoryId(exercise.category?.id || "");
    setOpenExerciseDialog(true);
  };

  const openCategoryExercises = (category: Category) => {
    setSelectedCategory(category);
    loadExercises(category.id);
  };

  const closeCategoryExercises = () => {
    setSelectedCategory(null);
    setExercises([]);
  };

  const openMenu = (event: MouseEvent<HTMLElement>, category: Category) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuCategory(category);
  };

  const closeMenu = () => {
    setMenuAnchorEl(null);
    setMenuCategory(null);
  };

  const openExerciseMenu = (event: MouseEvent<HTMLElement>, exercise: Exercise) => {
    setExerciseMenuAnchorEl(event.currentTarget);
    setMenuExercise(exercise);
  };

  const closeExerciseMenu = () => {
    setExerciseMenuAnchorEl(null);
    setMenuExercise(null);
  };

  const openAddMenu = (event: MouseEvent<HTMLElement>) => {
    setAddMenuAnchorEl(event.currentTarget);
  };

  const closeAddMenu = () => {
    setAddMenuAnchorEl(null);
  };

  return (
    <Box>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            {selectedCategory && (
              <IconButton onClick={closeCategoryExercises}>
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h6">
              {selectedCategory ? selectedCategory.title : "Категории"}
            </Typography>
          </Stack>
          {isMobile ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={
                selectedCategory
                  ? () => openExerciseCreateDialog(selectedCategory)
                  : openAddMenu
              }
              size="small"
              sx={{ minHeight: 32, px: 1.5 }}
            >
              Добавить
            </Button>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openExerciseCreateDialog(selectedCategory)}
              >
                Добавить упражнение
              </Button>
              {!selectedCategory && (
                <Button variant="outlined" startIcon={<AddIcon />} onClick={openCreateDialog}>
                  Создать категорию
                </Button>
              )}
            </Stack>
          )}
        </Stack>

        {!selectedCategory ? (
          loadingCategories ? (
            <Typography>Загрузка...</Typography>
          ) : categories.length === 0 ? (
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Категории не найдены. Создайте первую категорию.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <List>
              {categories.map((category) => (
                <Card key={category.id} sx={{ mb: 1 }}>
                  <ListItem
                    secondaryAction={
                      <IconButton onClick={(event) => openMenu(event, category)}>
                        <MoreVertIcon />
                      </IconButton>
                    }
                    disablePadding
                  >
                    <ListItemButton onClick={() => openCategoryExercises(category)}>
                      <ListItemText primary={category.title} />
                    </ListItemButton>
                  </ListItem>
                </Card>
              ))}
            </List>
          )
        ) : loadingExercises ? (
          <Typography>Загрузка...</Typography>
        ) : exercises.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Упражнения не найдены. Добавьте первое упражнение.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <List>
            {exercises.map((exercise) => (
              <Card key={exercise.id} sx={{ mb: 1 }}>
                <ListItem
                  secondaryAction={
                    <IconButton onClick={(event) => openExerciseMenu(event, exercise)}>
                      <MoreVertIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>{exercise.title}</Typography>
                        {exercise.is_archived && <Chip label="Архив" size="small" />}
                      </Stack>
                    }
                    secondary={exercise.short}
                  />
                </ListItem>
              </Card>
            ))}
          </List>
        )}
      </Stack>

      <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            if (menuCategory) openEditDialog(menuCategory);
            closeMenu();
          }}
        >
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Редактировать
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuCategory) handleDelete(menuCategory.id);
            closeMenu();
          }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Удалить
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={exerciseMenuAnchorEl}
        open={Boolean(exerciseMenuAnchorEl)}
        onClose={closeExerciseMenu}
      >
        <MenuItem
          onClick={() => {
            if (menuExercise) openExerciseEditDialog(menuExercise);
            closeExerciseMenu();
          }}
        >
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Редактировать
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuExercise) handleDeleteExercise(menuExercise.id);
            closeExerciseMenu();
          }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Удалить
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (!menuExercise) return;
            if (menuExercise.is_archived) {
              handleRestoreExercise(menuExercise.id);
            } else {
              handleArchiveExercise(menuExercise.id);
            }
            closeExerciseMenu();
          }}
        >
          {menuExercise?.is_archived ? (
            <UnarchiveIcon sx={{ mr: 1 }} fontSize="small" />
          ) : (
            <ArchiveIcon sx={{ mr: 1 }} fontSize="small" />
          )}
          {menuExercise?.is_archived ? "Восстановить" : "Архивировать"}
        </MenuItem>
      </Menu>

      <Menu anchorEl={addMenuAnchorEl} open={Boolean(addMenuAnchorEl)} onClose={closeAddMenu}>
        <MenuItem
          onClick={() => {
            openExerciseCreateDialog(selectedCategory);
            closeAddMenu();
          }}
        >
          <AddIcon sx={{ mr: 1 }} fontSize="small" />
          Упражнение
        </MenuItem>
        {!selectedCategory && (
          <MenuItem
            onClick={() => {
              openCreateDialog();
              closeAddMenu();
            }}
          >
            <AddIcon sx={{ mr: 1 }} fontSize="small" />
            Категория
          </MenuItem>
        )}
      </Menu>

      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)}>
        <DialogTitle>
          {editingCategory ? "Редактировать категорию" : "Создать категорию"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название"
            fullWidth
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
            <Button
              onClick={() => setOpenCategoryDialog(false)}
              size={isMobile ? "small" : "medium"}
            >
              Отмена
            </Button>
            <Button
              onClick={editingCategory ? handleUpdate : handleCreate}
              variant="contained"
              size={isMobile ? "small" : "medium"}
            >
            {editingCategory ? "Сохранить" : "Создать"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openExerciseDialog} onClose={() => setOpenExerciseDialog(false)}>
        <DialogTitle>
          {editingExercise ? "Редактировать упражнение" : "Добавить упражнение"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Название"
              fullWidth
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
            />
            <TextField
              label="Короткое название (макс. 10 символов)"
              fullWidth
              inputProps={{ maxLength: 10 }}
              value={exerciseShort}
              onChange={(e) => setExerciseShort(e.target.value)}
            />
            {!selectedCategory && (
              <FormControl fullWidth>
                <InputLabel>Категория</InputLabel>
                <Select
                  value={categoryId}
                  label="Категория"
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={!!editingExercise}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
            <Button
              onClick={() => setOpenExerciseDialog(false)}
              size={isMobile ? "small" : "medium"}
            >
              Отмена
            </Button>
          <Button
            onClick={editingExercise ? handleUpdateExercise : handleCreateExercise}
            variant="contained"
              size={isMobile ? "small" : "medium"}
          >
            {editingExercise ? "Сохранить" : "Добавить"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
