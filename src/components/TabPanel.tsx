import { Box } from "@mui/material";
import type { ReactNode } from "react";

type TabPanelProps = {
  value: number;
  index: number;
  children: ReactNode;
};

export function TabPanel({ value, index, children }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index ? <Box sx={{ py: 2 }}>{children}</Box> : null}
    </div>
  );
}
