import { useState } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import IdolsTab from "../components/admin/IdolsTab";

const AdminDashboard = () => {
  // set state for idol tabs
  const [tab, setTab] = useState("idols");

  // the function of clicking tabs
  const handleChange = (e, newValue) => {
    setTab(newValue);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Admin Dashboard
      </Typography>

      <Tabs value={tab} onChange={handleChange} sx={{ mb: 3 }}>
        <Tab label="Idols" value="idols" />
        <Tab label="Agencies" value="agencies" />
        <Tab label="Polls" value="polls" />
        <Tab label="Users" value="users" />
      </Tabs>

      {tab === "idols" && <IdolsTab />}
      {tab === "agencies" && (
        <Typography>Agencies Tab (coming soon)</Typography>
      )}
      {tab === "polls" && <Typography>Polls Tab (coming soon)</Typography>}
      {tab === "users" && <Typography>Users Tab (coming soon)</Typography>}
    </Box>
  );
};

export default AdminDashboard;
