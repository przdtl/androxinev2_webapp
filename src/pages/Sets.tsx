import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { SetsApi } from "../api/endpoints";

export default function Sets() {
  const handleRefresh = async () => {
    await SetsApi.list();
  };

  const handleCreate = async () => {
    await SetsApi.create({ exerciseId: 1, reps: 10, weight: 40 });
  };

  return (
    <Box>
      <Stack spacing={2}>
        <Typography variant="h6">Подходы</Typography>
        <Typography variant="body2" color="text.secondary">
          Учёт подходов с весом и повторениями.
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
              Здесь будет список подходов.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
