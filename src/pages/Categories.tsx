import { useState, useEffect } from "react";
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
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { CategoriesApi, Category } from "../api/endpoints";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await CategoriesApi.list();
      setCategories(res.data.items);
    } catch (err) {
      console.error("Ошибка загрузки категорий:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async () => {
    if (!categoryName.trim()) return;
    try {
      await CategoriesApi.create({ title: categoryName });
      setCategoryName("");
      setOpenDialog(false);
      loadCategories();
    } catch (err) {
      console.error("Ошибка создания категории:", err);
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory || !categoryName.trim()) return;
    try {
      await CategoriesApi.update(editingCategory.id, { title: categoryName });
      setCategoryName("");
      setEditingCategory(null);
      setOpenDialog(false);
      loadCategories();
    } catch (err) {
      console.error("Ошибка обновления категории:", err);
    }
  };

  const openCreateDialog = () => {
    setEditingCategory(null);
    setCategoryName("");
    setOpenDialog(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.title);
    setOpenDialog(true);
  };

  return (
    <Box>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Категории</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            Создать
          </Button>
        </Stack>

        {loading ? (
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
                    <IconButton edge="end" onClick={() => openEditDialog(category)}>
                      <EditIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={category.title} />
                </ListItem>
              </Card>
            ))}
          </List>
        )}
      </Stack>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
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
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={editingCategory ? handleUpdate : handleCreate} variant="contained">
            {editingCategory ? "Сохранить" : "Создать"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
