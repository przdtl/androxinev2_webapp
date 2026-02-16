import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { ExercisesApi } from "../api/endpoints";

export default function Exercises() {
  const handleRefresh = async () => {
    await ExercisesApi.list();
  };

  const handleCreate = async () => {
    await ExercisesApi.create({ name: "Новое упражнение" });
  };

  return (
    <Box>
      <Stack spacing={2}>
        <Typography variant="h6">Упражнения</Typography>
        <Typography variant="body2" color="text.secondary">
          Управление упражнениями: создание, редактирование, архив.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleRefresh}>
            Обновить
          </Button>
          <Button variant="outlined" onClick={handleCreate}>
            Добавить
          </Button>
        </Stack>
        <Card>
          <CardContent>
            <Typography variant="subtitle1">Пример</Typography>
            <Typography variant="body2" color="text.secondary">
              Здесь будет таблица упражнений.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
