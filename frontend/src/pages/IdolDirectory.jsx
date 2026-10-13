import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useSnackbar } from "notistack";
import api from "../services/api";
import IdolCard from "../components/IdolCard";

// Available sorting options for the idol directory.
const SORT_OPTIONS = [
  { value: "votes-desc", label: "Votes: High to Low" },
  { value: "votes-asc", label: "Votes: Low to High" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

const IdolDirectory = () => {
  // List of idols fetched from the API.
  const [idols, setIdols] = useState([]);

  // Whether the idol list is currently loading.
  const [loading, setLoading] = useState(true);

  // Selected category filter. An empty string means "All".
  const [category, setCategory] = useState("");

  // Search text entered by the user.
  const [search, setSearch] = useState("");

  // Current sorting option.
  const [sortBy, setSortBy] = useState("votes-desc");

  // Snackbar helper used to show error notifications.
  const { enqueueSnackbar } = useSnackbar();

  // Fetch idols from the API whenever the category or search value changes.
  useEffect(() => {
    const fetchIdols = async () => {
      setLoading(true);

      try {
        // Build query parameters only when a filter or search value is provided.
        const params = {};
        if (category) params.category = category;
        if (search) params.name = search;

        // Request the idol list from the backend.
        const res = await api.get("/idols", { params });
        setIdols(res.data.idols);
      } catch {
        // Show an error notification if the request fails.
        enqueueSnackbar("Failed to load idols", { variant: "error" });
      } finally {
        // Stop showing the loading indicator after the request finishes.
        setLoading(false);
      }
    };

    fetchIdols();
  }, [category, search, enqueueSnackbar]);

  // Sort a copy of the idols list based on the selected sorting option.
  const sortedIdols = [...idols].sort((a, b) => {
    switch (sortBy) {
      // Sort by total votes from highest to lowest.
      case "votes-desc":
        return (b.totalVotes || 0) - (a.totalVotes || 0);

      // Sort by total votes from lowest to highest.
      case "votes-asc":
        return (a.totalVotes || 0) - (b.totalVotes || 0);

      // Sort idol names alphabetically from A to Z.
      case "name-asc":
        return a.name.localeCompare(b.name);

      // Sort idol names alphabetically from Z to A.
      case "name-desc":
        return b.name.localeCompare(a.name);

      // Keep the original order if no valid sorting option is selected.
      default:
        return 0;
    }
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Page title */}
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Idols
      </Typography>

      {/* Search, category filter, and sorting controls */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        {/* Search idols by name */}
        <TextField
          label="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 240 }}
        />

        {/* Filter idols by category */}
        <TextField
          select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Boy Group">Boy Group</MenuItem>
          <MenuItem value="Girl Group">Girl Group</MenuItem>
          <MenuItem value="Soloist">Soloist</MenuItem>
        </TextField>

        {/* Choose how the idol list should be sorted */}
        <TextField
          select
          label="Sort By"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          {SORT_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Show a loading spinner, empty-state message, or the idol grid */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : sortedIdols.length === 0 ? (
        <Typography
          sx={{ textAlign: "center", py: 6, color: "text.secondary" }}
        >
          No idols found
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {/* Render each idol as a responsive card */}
          {sortedIdols.map((idol) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={idol._id}>
              <IdolCard idol={idol} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default IdolDirectory;
