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
  InputLabel
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { SetsApi, ExercisesApi, SetItem, Exercise } from "../api/endpoints";

export default function Sets() {
  const [sets, setSets] = useState<SetItem[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [exerciseId, setExerciseId] = useState<string>("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  const loadSets = async () => {
    setLoading(true);
    try {
      const res = await SetsApi.list();
      setSets(res.data.items);
    } catch (err) {
      console.error("Ошибка загрузки подходов:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadExercises = async () => {
    try {
      const res = await ExercisesApi.list();
      setExercises(res.data.items.filter((e) => !e.is_archived));
    } catch (err) {
      console.error("Ошибка загрузки упражнений:", err);
    }
  };

  useEffect(() => {
    loadSets();
    loadExercises();
  }, []);

  const handleCreate = async () => {
    if (!exerciseId || !reps || !weight) return;
    try {
      await SetsApi.create({
        exercise_id: exerciseId,
        reps: parseInt(reps),
        weight: parseFloat(weight)
      });
      setExerciseId("");
      setReps("");
      setWeight("");
      setOpenDialog(false);
      loadSets();
    } catch (err) {
      console.error("Ошибка создания подхода:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить подход?")) return;
    try {
      await SetsApi.remove(id);
      loadSets();
    } catch (err) {
      console.error("Ошибка удаления подхода:", err);
    }
  };

  const getExerciseName = (set: SetItem) => {
    return set.exercise?.title || "Неизвестно";
  };

  return (
    <Box>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Подходы</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Добавить
          </Button>
        </Stack>

        {loading ? (
          <Typography>Загрузка...</Typography>
        ) : sets.length === 0 ? (
          <Card sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Подходы не найдены. Добавьте первый подход.
            </Typography>
          </Card>
        ) : (
          <List>
            {sets.map((set) => (
              <Card key={set.id} sx={{ mb: 1 }}>
                <ListItem
                  secondaryAction={
                    <IconButton onClick={() => handleDelete(set.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={getExerciseName(set)}
                    secondary={`${set.reps || "-"} повт × ${set.weight || "-"} кг`}
                  />
                </ListItem>
              </Card>
            ))}
          </List>
        )}
      </Stack>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Добавить подход</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
            <FormControl fullWidth>
              <InputLabel>Упражнение</InputLabel>
              <Select
                value={exerciseId}
                label="Упражнение"
                onChange={(e) => setExerciseId(e.target.value)}
              >
                {exercises.map((ex) => (
                  <MenuItem key={ex.id} value={ex.id}>
                    {ex.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Повторения"
              type="number"
              fullWidth
              required
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
            <TextField
              label="Вес (кг)"
              type="number"
              fullWidth
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={handleCreate} variant="contained">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
