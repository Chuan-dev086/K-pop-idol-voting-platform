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

const SORT_OPTIONS = [
  { value: "votes-desc", label: "Votes: High to Low" },
  { value: "votes-asc", label: "Votes: Low to High" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

const IdolDirectory = () => {
  const [idols, setIdols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("votes-desc");

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchIdols = async () => {
      setLoading(true);
      try {
        const params = {};
        if (category) params.category = category;
        if (search) params.name = search;

        const res = await api.get("/idols", { params });
        setIdols(res.data.idols);
      } catch {
        enqueueSnackbar("Failed to load idols", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchIdols();
  }, [category, search, enqueueSnackbar]);

  // 前端排序
  const sortedIdols = [...idols].sort((a, b) => {
    switch (sortBy) {
      case "votes-desc":
        return (b.totalVotes || 0) - (a.totalVotes || 0);
      case "votes-asc":
        return (a.totalVotes || 0) - (b.totalVotes || 0);
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Idols
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        <TextField
          label="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 240 }}
        />

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
