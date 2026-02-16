import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { TemplatesApi } from "../api/endpoints";

export default function Templates() {
  const handleRefresh = async () => {
    await TemplatesApi.list();
  };

  const handleToday = async () => {
    await TemplatesApi.today();
  };

  return (
    <Box>
      <Stack spacing={2}>
        <Typography variant="h6">Шаблоны</Typography>
        <Typography variant="body2" color="text.secondary">
          Шаблоны тренировок и упражнения внутри них.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleRefresh}>
            Обновить
          </Button>
          <Button variant="outlined" onClick={handleToday}>
            Сегодня
          </Button>
        </Stack>
        <Card>
          <CardContent>
            <Typography variant="subtitle1">Пример</Typography>
            <Typography variant="body2" color="text.secondary">
              Здесь будет список шаблонов и упражнений.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
