// Import React Hook for managing the selected admin tab state
import { useState } from "react";

// Import Material UI components used on this page
import { Box, Typography, Tabs, Tab } from "@mui/material";

// Import the admin component for managing idols
import IdolsTab from "../components/admin/IdolsTab";
import AgenciesTab from "../components/admin/AgenciesTab";
import UsersTab from "../components/admin/UsersTab";
import PollsTab from "../components/admin/PollsTab";

// Main admin dashboard page component
const AdminDashboard = () => {
  // Store the currently selected admin tab
  // The default tab is "idols"
  const [tab, setTab] = useState("idols");

  // Update the selected tab when an admin clicks a different tab
  // e is the click/change event
  // newValue is the value of the clicked Tab component
  const handleChange = (e, newValue) => {
    setTab(newValue);
  };

  return (
    // Main dashboard container
    // maxWidth keeps content readable on large screens
    // mx: "auto" centers the container horizontally
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Dashboard page heading */}
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Admin Dashboard
      </Typography>

      {/* Navigation tabs for different admin management sections */}
      <Tabs
        // The currently selected tab value
        value={tab}
        // Run handleChange when an admin selects another tab
        onChange={handleChange}
        sx={{ mb: 3 }}
      >
        {/* Each Tab value identifies which admin content should be displayed */}
        <Tab label="Idols" value="idols" />
        <Tab label="Agencies" value="agencies" />
        <Tab label="Polls" value="polls" />
        <Tab label="Users" value="users" />
      </Tabs>

      {/* Render the IdolsTab component only when the Idols tab is selected */}
      {tab === "idols" && <IdolsTab />}

      {/* Temporary placeholder for the future Agencies management feature */}
      {tab === "agencies" && <AgenciesTab />}

      {/* Temporary placeholder for the future Polls management feature */}
      {tab === "polls" && <PollsTab />}

      {/* Temporary placeholder for the future Users management feature */}
      {tab === "users" && <UsersTab />}
    </Box>
  );
};

// Export the component so it can be used in your React Router routes
export default AdminDashboard;
