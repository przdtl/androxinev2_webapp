import { useState } from "react";
import {
  AppBar,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Container,
  Tabs,
  Tab,
  Toolbar,
  Typography,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CategoryIcon from "@mui/icons-material/Category";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ViewListIcon from "@mui/icons-material/ViewList";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import Categories from "./pages/Categories";
import Exercises from "./pages/Exercises";
import Templates from "./pages/Templates";
import Sets from "./pages/Sets";
import { TabPanel } from "./components/TabPanel";

const tabs = [
  { label: "Категории", icon: <CategoryIcon /> },
  { label: "Упражнения", icon: <FitnessCenterIcon /> },
  { label: "Шаблоны", icon: <ViewListIcon /> },
  { label: "Подходы", icon: <PlaylistAddCheckIcon /> }
];

export default function App() {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="sticky" color="transparent" elevation={0}>
        <Toolbar sx={{ flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
          <Typography variant="h6">Тренировки</Typography>
          {!isMobile && (
            <Tabs
              value={value}
              onChange={(_, next) => setValue(next)}
              variant="scrollable"
              scrollButtons="auto"
              textColor="inherit"
            >
              {tabs.map((tab) => (
                <Tab key={tab.label} label={tab.label} />
              ))}
            </Tabs>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ flex: 1, pb: { xs: 12, sm: 6 } }}>
        <TabPanel value={value} index={0}>
          <Categories />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Exercises />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Templates />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <Sets />
        </TabPanel>
      </Container>

      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            pb: "env(safe-area-inset-bottom)"
          }}
        >
          <BottomNavigation value={value} onChange={(_, next) => setValue(next)} showLabels>
            {tabs.map((tab) => (
              <BottomNavigationAction key={tab.label} label={tab.label} icon={tab.icon} />
            ))}
          </BottomNavigation>
        </Box>
      )}
    </Box>
  );
}
