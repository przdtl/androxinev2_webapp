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
  ListItemText
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { TemplatesApi, Template } from "../api/endpoints";

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState("");

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await TemplatesApi.list();
      setTemplates(res.data.items);
    } catch (err) {
      console.error("Ошибка загрузки шаблонов:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreate = async () => {
    if (!templateName.trim()) return;
    try {
      const res = await TemplatesApi.create({ title: templateName });
      setTemplates(prev => [...prev, res.data]);
      setTemplateName("");
      setOpenDialog(false);
    } catch (err) {
      console.error("Ошибка создания шаблона:", err);
    }
  };

  const handleUpdate = async () => {
    if (!editingTemplate || !templateName.trim()) return;
    try {
      const res = await TemplatesApi.update(editingTemplate.id, { title: templateName });
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? res.data : t));
      setTemplateName("");
      setEditingTemplate(null);
      setOpenDialog(false);
    } catch (err) {
      console.error("Ошибка обновления шаблона:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить шаблон?")) return;
    try {
      await TemplatesApi.remove(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error("Ошибка удаления шаблона:", err);
    }
  };

  const openCreateDialog = () => {
    setEditingTemplate(null);
    setTemplateName("");
    setOpenDialog(true);
  };

  const openEditDialog = (template: Template) => {
    setEditingTemplate(template);
    setTemplateName(template.title);
    setOpenDialog(true);
  };

  return (
    <Box>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Шаблоны</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            Создать
          </Button>
        </Stack>

        {loading ? (
          <Typography>Загрузка...</Typography>
        ) : templates.length === 0 ? (
          <Card sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Шаблоны не найдены. Создайте первый шаблон.
            </Typography>
          </Card>
        ) : (
          <List>
            {templates.map((template) => (
              <Card key={template.id} sx={{ mb: 1 }}>
                <ListItem
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <IconButton onClick={() => openEditDialog(template)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(template.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemText primary={template.title} />
                </ListItem>
              </Card>
            ))}
          </List>
        )}
      </Stack>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {editingTemplate ? "Редактировать шаблон" : "Создать шаблон"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название"
            fullWidth
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={editingTemplate ? handleUpdate : handleCreate} variant="contained">
            {editingTemplate ? "Сохранить" : "Создать"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
