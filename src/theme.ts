import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6ea8fe" },
    secondary: { main: "#22c55e" },
    background: {
      default: "#0b0f17",
      paper: "#111827"
    }
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'Inter', system-ui, sans-serif"
  }
});
