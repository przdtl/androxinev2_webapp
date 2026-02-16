import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { CategoriesApi } from "../api/endpoints";

export default function Categories() {
  const handleRefresh = async () => {
    await CategoriesApi.list();
  };

  return (
    <Box>
      <Stack spacing={2}>
        <Typography variant="h6">Категории</Typography>
        <Typography variant="body2" color="text.secondary">
          Список категорий упражнений.
        </Typography>
        <Button variant="contained" onClick={handleRefresh}>
          Обновить
        </Button>
        <Card>
          <CardContent>
            <Typography variant="subtitle1">Пример</Typography>
            <Typography variant="body2" color="text.secondary">
              Здесь будет список категорий с API.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
