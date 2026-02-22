import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Stack,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import { ExercisesApi, CategoriesApi, Exercise, Category, CategorySchema } from "../api/endpoints";

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseShort, setExerciseShort] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");

  const loadExercises = async () => {
    setLoading(true);
    try {
      const res = await ExercisesApi.list();
      setExercises(res.data.items);
    } catch (err) {
      console.error("Ошибка загрузки упражнений:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await CategoriesApi.list();
      setCategories(res.data.items);
    } catch (err) {
      console.error("Ошибка загрузки категорий:", err);
    }
  };

  useEffect(() => {
    loadExercises();
    loadCategories();
  }, []);

  const handleCreate = async () => {
    if (!exerciseName.trim() || !exerciseShort.trim() || !categoryId) return;
    try {
      await ExercisesApi.create({
        title: exerciseName,
        short: exerciseShort,
        category_id: categoryId
      });
      setExerciseName("");
      setExerciseShort("");
      setCategoryId("");
      setOpenDialog(false);
      loadExercises();
    } catch (err) {
      console.error("Ошибка создания упражнения:", err);
    }
  };

  const handleUpdate = async () => {
    if (!editingExercise || !exerciseName.trim() || !exerciseShort.trim()) return;
    try {
      await ExercisesApi.update(editingExercise.id, {
        title: exerciseName,
        short: exerciseShort
      });
      setExerciseName("");
      setExerciseShort("");
      setCategoryId("");
      setEditingExercise(null);
      setOpenDialog(false);
      loadExercises();
    } catch (err) {
      console.error("Ошибка обновления упражнения:", err);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await ExercisesApi.archive(id);
      loadExercises();
    } catch (err) {
      console.error("Ошибка архивирования:", err);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await ExercisesApi.restore(id);
      loadExercises();
    } catch (err) {
      console.error("Ошибка восстановления:", err);
    }
  };

  const openCreateDialog = () => {
    setEditingExercise(null);
    setExerciseName("");
    setExerciseShort("");
    setCategoryId("");
    setOpenDialog(true);
  };

  const openEditDialog = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setExerciseName(exercise.title);
    setExerciseShort(exercise.short);
    setCategoryId(exercise.category?.id || "");
    setOpenDialog(true);
  };

  const getCategoryName = (category?: CategorySchema) => {
    return category?.title || "";
  };

  return (
    <Box>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Упражнения</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            Создать
          </Button>
        </Stack>

        {loading ? (
          <Typography>Загрузка...</Typography>
        ) : exercises.length === 0 ? (
          <Card sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Упражнения не найдены. Создайте первое упражнение.
            </Typography>
          </Card>
        ) : (
          <List>
            {exercises.map((exercise) => (
              <Card key={exercise.id} sx={{ mb: 1 }}>
                <ListItem
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={() => openEditDialog(exercise)}>
                        <EditIcon />
                      </IconButton>
                      {exercise.is_archived ? (
                        <IconButton onClick={() => handleRestore(exercise.id)}>
                          <UnarchiveIcon />
                        </IconButton>
                      ) : (
                        <IconButton onClick={() => handleArchive(exercise.id)}>
                          <ArchiveIcon />
                        </IconButton>
                      )}
                    </Stack>
                  }
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>{exercise.title}</Typography>
                        {exercise.is_archived && <Chip label="Архив" size="small" />}
                      </Stack>
                    }
                    secondary={getCategoryName(exercise.category)}
                  />
                </ListItem>
              </Card>
            ))}
          </List>
        )}
      </Stack>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {editingExercise ? "Редактировать упражнение" : "Создать упражнение"}
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={editingExercise ? handleUpdate : handleCreate} variant="contained">
            {editingExercise ? "Сохранить" : "Создать"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
