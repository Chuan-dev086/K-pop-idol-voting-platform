// Import React Hooks for state management and side effects
import { useState, useEffect } from "react";

// Import Material UI components used on this page
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  CircularProgress,
} from "@mui/material";

// Import Snackbar function for displaying error notifications
import { useSnackbar } from "notistack";

// Import the configured Axios API instance
import api from "../services/api";

// Import the reusable poll card component
import PollCard from "../components/PollCard";

// Page component for displaying all polls with status tabs
const PollList = () => {
  // Store the complete list of polls returned from the backend API
  const [polls, setPolls] = useState([]);

  // Track whether the page is currently loading poll data
  const [loading, setLoading] = useState(true);

  // Store the currently selected tab value
  // The default tab is "active"
  const [tab, setTab] = useState("active");

  // Get the function used to display Snackbar notifications
  const { enqueueSnackbar } = useSnackbar();

  // Fetch all polls when the component first loads
  useEffect(() => {
    // Create an async function because useEffect itself should not be async
    const fetchPolls = async () => {
      // Start the loading state before sending the API request
      setLoading(true);

      try {
        // Request all polls from the backend
        // Example request: GET /polls
        const res = await api.get("/polls");

        // Save the returned poll array into state
        // Updating state causes React to re-render the page
        setPolls(res.data.polls);
      } catch (error) {
        // Print the full error in the browser console for debugging
        console.error("Failed to load polls:", error);

        // Show a user-friendly error notification
        enqueueSnackbar("Failed to load polls", {
          variant: "error",
        });
      } finally {
        // Stop the loading state whether the request succeeds or fails
        // This prevents the loading spinner from appearing forever
        setLoading(false);
      }
    };

    // Run the function that fetches polls from the API
    fetchPolls();
  }, [enqueueSnackbar]);

  // Filter the complete poll list based on the selected tab
  //
  // Examples:
  // tab === "active"   -> show only active polls
  // tab === "upcoming" -> show only upcoming polls
  // tab === "ended"    -> show only ended polls
  const filteredPolls = polls.filter((poll) => poll.status === tab);

  return (
    // Main page container
    <Box sx={{ p: 3 }}>
      {/* Page title */}
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Polls
      </Typography>

      {/* Tabs for switching between active, upcoming, and ended polls */}
      <Tabs
        // The currently selected tab value
        value={tab}
        // Update the tab state when the user clicks a different tab
        onChange={(e, newValue) => setTab(newValue)}
        sx={{ mb: 3 }}
      >
        {/* Each Tab value must match a possible poll.status value */}
        <Tab label="Active" value="active" />
        <Tab label="Upcoming" value="upcoming" />
        <Tab label="Ended" value="ended" />
      </Tabs>

      {/*
        Render one of three possible UI states:

        1. Loading: show a spinner while the API request is running
        2. Empty: show a message when no polls match the selected tab
        3. Data: display matching polls in a responsive grid
      */}
      {loading ? (
        // Show a loading spinner while waiting for the API response
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : filteredPolls.length === 0 ? (
        // Show this message when no polls match the selected status
        <Typography
          sx={{
            textAlign: "center",
            py: 6,
            color: "text.secondary",
          }}
        >
          No {tab} polls
        </Typography>
      ) : (
        // Display poll cards when there are matching polls
        <Grid container spacing={3}>
          {/* Convert every matching poll object into one Grid item and PollCard */}
          {filteredPolls.map((poll) => (
            <Grid
              size={{
                xs: 12, // Mobile: 1 card per row
                sm: 6, // Small screens: 2 cards per row
                md: 4, // Medium and larger screens: 3 cards per row
              }}
              // Use the MongoDB document _id as a unique React key
              key={poll._id}
            >
              {/* Pass the current poll object to the reusable PollCard component */}
              <PollCard poll={poll} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

// Export the component so it can be used in React Router routes
export default PollList;
