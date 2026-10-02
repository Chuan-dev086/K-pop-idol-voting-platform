// Import React Hooks for managing state and running side effects
import { useState, useEffect } from "react";

// Import UI components from Material UI
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
} from "@mui/material";

// Import Snackbar function for showing notifications
import { useSnackbar } from "notistack";

// Import the configured Axios API instance
import api from "../services/api";

// Import the reusable card component for displaying one idol
import IdolCard from "../components/IdolCard";

// Page component for displaying, searching, and filtering idols
const IdolDirectory = () => {
  // Store the idol list returned from the backend API
  const [idols, setIdols] = useState([]);

  // Control whether the page is currently loading data
  const [loading, setLoading] = useState(true);

  // Store the selected category from the dropdown
  // An empty string means no category filter is applied
  const [category, setCategory] = useState("");

  // Store the text entered by the user in the search input
  const [search, setSearch] = useState("");

  // Get the function used to display Snackbar notifications
  const { enqueueSnackbar } = useSnackbar();

  // Fetch idols whenever the category or search value changes
  useEffect(() => {
    // Create an async function because useEffect itself should not be async
    const fetchIdols = async () => {
      // Show the loading spinner before sending the API request
      setLoading(true);

      try {
        // Create an empty object for optional query parameters
        const params = {};

        // Add the category filter only if the user selected a category
        // Example: { category: "Girl Group" }
        if (category) {
          params.category = category;
        }

        // Add the name filter only if the user entered a search term
        // Example: { name: "Lisa" }
        if (search) {
          params.name = search;
        }

        // Request idols from the backend API
        // Axios converts the params object into URL query parameters
        //
        // Example:
        // api.get("/idols", {
        //   params: { category: "Girl Group", name: "Lisa" },
        // });
        //
        // Resulting request:
        // GET /idols?category=Girl%20Group&name=Lisa
        const res = await api.get("/idols", { params });

        // Save the idol array from the API response into state
        // Updating state causes React to render the updated idol list
        setIdols(res.data.idols);
      } catch (error) {
        // Print the full error in the browser console for debugging
        console.error("Failed to load idols:", error);

        // Show an error notification to the user
        enqueueSnackbar("Failed to load idols", {
          variant: "error",
        });
      } finally {
        // Stop the loading state whether the request succeeds or fails
        // This prevents the spinner from showing forever after an error
        setLoading(false);
      }
    };

    // Run the function that fetches idol data
    fetchIdols();
  }, [category, search, enqueueSnackbar]);

  return (
    // Main page container
    <Box sx={{ p: 3 }}>
      {/* Page heading */}
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Idols
      </Typography>

      {/* Search and category filter controls */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 4,
          flexWrap: "wrap",
        }}
      >
        {/* Controlled input for searching idols by name */}
        <TextField
          label="Search by name"
          value={search}
          // Update the search state whenever the user types
          // This triggers the useEffect and sends a new API request
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 240 }}
        />

        {/* Dropdown menu for filtering idols by category */}
        <TextField
          select
          label="Category"
          value={category}
          // Update the category state when the user chooses an option
          // This triggers the useEffect and sends a new API request
          onChange={(e) => setCategory(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {/* Empty value means no category filter: show all idols */}
          <MenuItem value="">All</MenuItem>

          {/* Category options */}
          <MenuItem value="Boy Group">Boy Group</MenuItem>
          <MenuItem value="Girl Group">Girl Group</MenuItem>
          <MenuItem value="Soloist">Soloist</MenuItem>
        </TextField>
      </Box>

      {/*
        Render one of three UI states:

        1. Loading: show a spinner while waiting for the API response
        2. Empty: show a message if no idols match the filters
        3. Data: show the idol cards in a responsive grid
      */}
      {loading ? (
        // Show a loading spinner while the API request is running
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : idols.length === 0 ? (
        // Show this message when the API succeeds but returns no idols
        <Typography
          sx={{
            textAlign: "center",
            py: 6,
            color: "text.secondary",
          }}
        >
          No idols found
        </Typography>
      ) : (
        // Display idol cards when the API returns one or more idols
        <Grid container spacing={3}>
          {/* Convert every idol object into one responsive Grid item and IdolCard */}
          {idols.map((idol) => (
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 4,
                lg: 2.4,
              }}
              // Use MongoDB's unique _id value as React's list key
              key={idol._id}
            >
              {/* Pass the current idol object to the reusable card component */}
              <IdolCard idol={idol} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

// Export the component so it can be used by React Router or other files
export default IdolDirectory;
