import { useState, useEffect, type MouseEvent } from "react";
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
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  Select,
  FormControl,
  InputLabel,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { SetsApi, ExercisesApi, SetItem, Exercise } from "../api/endpoints";

export default function Sets() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [sets, setSets] = useState<SetItem[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSet, setEditingSet] = useState<SetItem | null>(null);
  const [exerciseId, setExerciseId] = useState<string>("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [filterExerciseId, setFilterExerciseId] = useState<string>("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [createdDate, setCreatedDate] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuSet, setMenuSet] = useState<SetItem | null>(null);

  const loadSets = async () => {
    setLoading(true);
    try {
      const res = await SetsApi.list({
        exercise_id: filterExerciseId || undefined,
        created_from: createdFrom || undefined,
        created_to: createdTo || undefined
      });
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
  }, [filterExerciseId, createdFrom, createdTo]);

  useEffect(() => {
    loadExercises();
  }, []);

  const handleCreate = async () => {
    if (!exerciseId || !reps || !weight) return;
    try {
      const payload: any = {
        exercise_id: exerciseId,
        reps: parseInt(reps),
        weight: parseFloat(weight)
      };
      if (createdDate) {
        payload.created_at = `${createdDate}T00:00:00`;
      }
      const res = await SetsApi.create(payload);
      setSets(prev => [...prev, res.data]);
      setExerciseId("");
      setReps("");
      setWeight("");
      setCreatedDate("");
      setEditingSet(null);
      setOpenDialog(false);
    } catch (err) {
      console.error("Ошибка создания подхода:", err);
    }
  };

  const handleUpdate = async () => {
    if (!editingSet || !reps || !weight) return;
    try {
      const res = await SetsApi.update(editingSet.id, {
        reps: parseInt(reps),
        weight: parseFloat(weight)
      });
      setSets((prev) => prev.map((s) => (s.id === editingSet.id ? res.data : s)));
      setExerciseId("");
      setReps("");
      setWeight("");
      setCreatedDate("");
      setEditingSet(null);
      setOpenDialog(false);
    } catch (err) {
      console.error("Ошибка обновления подхода:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить подход?")) return;
    try {
      await SetsApi.remove(id);
      setSets(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Ошибка удаления подхода:", err);
    }
  };

  const openEditDialog = (set: SetItem) => {
    setEditingSet(set);
    setExerciseId(set.exercise?.id || set.exercise_id || "");
    setReps(String(set.reps ?? ""));
    setWeight(String(set.weight ?? ""));
    setOpenDialog(true);
  };

  const openMenu = (event: MouseEvent<HTMLElement>, set: SetItem) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuSet(set);
  };

  const closeMenu = () => {
    setMenuAnchorEl(null);
    setMenuSet(null);
  };

  const getExerciseName = (set: SetItem) => {
    return set.exercise?.title || "Неизвестно";
  };

  const getDayKey = (set: SetItem) => {
    return set.created_at ? set.created_at.slice(0, 10) : "unknown";
  };

  const formatDay = (dayKey: string) => {
    if (dayKey === "unknown") return "Без даты";
    const date = new Date(dayKey);
    return Number.isNaN(date.getTime())
      ? dayKey
      : date.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        });
  };

  const groupedSets = sets.reduce((acc, set) => {
    const key = getDayKey(set);
    const group = acc.get(key);
    if (group) {
      group.items.push(set);
    } else {
      acc.set(key, { dayKey: key, items: [set] });
    }
    return acc;
  }, new Map<string, { dayKey: string; items: SetItem[] }>());

  return (
    <Box>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Подходы</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingSet(null);
              setExerciseId("");
              setReps("");
              setWeight("");
              setCreatedDate("");
              setOpenDialog(true);
            }}
          >
            Добавить
          </Button>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <FormControl fullWidth size={isMobile ? "small" : "medium"}>
            <InputLabel>Упражнение</InputLabel>
            <Select
              value={filterExerciseId}
              label="Упражнение"
              onChange={(e) => setFilterExerciseId(e.target.value)}
            >
              <MenuItem value="">Все упражнения</MenuItem>
              {exercises.map((ex) => (
                <MenuItem key={ex.id} value={ex.id}>
                  {ex.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="С даты"
            type="date"
            size={isMobile ? "small" : "medium"}
            value={createdFrom}
            onChange={(e) => setCreatedFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="По дату"
            type="date"
            size={isMobile ? "small" : "medium"}
            value={createdTo}
            onChange={(e) => setCreatedTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <Button
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            onClick={() => {
              setFilterExerciseId("");
              setCreatedFrom("");
              setCreatedTo("");
            }}
          >
            Сбросить
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
          <Stack spacing={2}>
            {Array.from(groupedSets.values()).map((group) => (
              <Stack key={group.dayKey} spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle2" color="text.secondary">
                    {formatDay(group.dayKey)}
                  </Typography>
                  <Divider sx={{ flex: 1 }} />
                </Stack>
                <List disablePadding>
                  {group.items.map((set) => (
                    <Card key={set.id} sx={{ mb: 1 }}>
                      <ListItem
                        secondaryAction={
                          <IconButton onClick={(event) => openMenu(event, set)}>
                            <MoreVertIcon />
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
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>

      <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            if (menuSet) openEditDialog(menuSet);
            closeMenu();
          }}
        >
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Редактировать
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuSet) handleDelete(menuSet.id);
            closeMenu();
          }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Удалить
        </MenuItem>
      </Menu>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{editingSet ? "Редактировать подход" : "Добавить подход"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, width: "100%" }}>
            <FormControl fullWidth>
              <InputLabel>Упражнение</InputLabel>
              <Select
                value={exerciseId}
                label="Упражнение"
                onChange={(e) => setExerciseId(e.target.value)}
                disabled={!!editingSet}
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
            {!editingSet && (
              <TextField
                label="Дата создания (опционально)"
                type="date"
                fullWidth
                value={createdDate}
                onChange={(e) => setCreatedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} size={isMobile ? "small" : "medium"}>
            Отмена
          </Button>
          <Button
            onClick={editingSet ? handleUpdate : handleCreate}
            variant="contained"
            size={isMobile ? "small" : "medium"}
          >
            {editingSet ? "Сохранить" : "Добавить"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
