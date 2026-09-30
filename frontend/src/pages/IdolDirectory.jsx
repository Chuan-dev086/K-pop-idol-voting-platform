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

const idolDirectory = () => {
  const [idols, setIdols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchIdols = async () => {
      setLoading(true);
      try {
        const params = {};
        if (category) params.category = category;
        if (search) params.name = search;

        const res = await api.get("/idols", { params });
        setIdols(res.data.idols);
      } catch (error) {
        enqueueSnackbar("Failed to load idols", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchIdols();
  }, [category, search]);
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Idols
      </Typography>

      {/* 筛选栏 */}
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
      </Box>

      {/* 内容 */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : idols.length === 0 ? (
        <Typography
          sx={{ textAlign: "center", py: 6, color: "text.secondary" }}
        >
          No idols found
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {idols.map((idol) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={idol._id}>
              <IdolCard idol={idol} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default idolDirectory;
