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
  ListItemText
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CategoriesApi, Category } from "../api/endpoints";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCategory, setMenuCategory] = useState<Category | null>(null);

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
      const res = await CategoriesApi.create({ title: categoryName });
      setCategories(prev => [...prev, res.data]);
      setCategoryName("");
      setOpenDialog(false);
    } catch (err) {
      console.error("Ошибка создания категории:", err);
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory || !categoryName.trim()) return;
    try {
      const res = await CategoriesApi.update(editingCategory.id, { title: categoryName });
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? res.data : c));
      setCategoryName("");
      setEditingCategory(null);
      setOpenDialog(false);
    } catch (err) {
      console.error("Ошибка обновления категории:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить категорию?")) return;
    try {
      await CategoriesApi.remove(id);
      setCategories((prev) => prev.filter((category) => category.id !== id));
    } catch (err) {
      console.error("Ошибка удаления категории:", err);
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

  const openMenu = (event: MouseEvent<HTMLElement>, category: Category) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuCategory(category);
  };

  const closeMenu = () => {
    setMenuAnchorEl(null);
    setMenuCategory(null);
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
                    <IconButton onClick={(event) => openMenu(event, category)}>
                      <MoreVertIcon />
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
