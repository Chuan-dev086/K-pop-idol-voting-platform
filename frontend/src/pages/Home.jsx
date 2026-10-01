import { useState, useEffect } from "react";
import { Box, Typography, Grid, CircularProgress, Button } from "@mui/material";
import { Link } from "react-router";
import { useSnackbar } from "notistack";
import api from "../services/api";
import PollCard from "../components/PollCard";
import IdolCard from "../components/IdolCard";

const Home = () => {
  const [polls, setPolls] = useState([]);
  const [topIdols, setTopIdols] = useState([]);
  const [loading, setLoading] = useState(true);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pollsRes, idolsRes] = await Promise.all([
          api.get("/polls", { params: { status: "active" } }),
          api.get("/idols"),
        ]);

        setPolls(pollsRes.data.polls.slice(0, 3));

        const sorted = [...idolsRes.data.idols]
          .sort((a, b) => b.totalVotes - a.totalVotes)
          .slice(0, 5);

        setTopIdols(sorted);
      } catch {
        enqueueSnackbar("Failed to load data", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [enqueueSnackbar]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Hero 区域 */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
          Idol Vote Hub
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Support your favorite K-pop idols
        </Typography>
      </Box>

      {/* Active Polls 区域 */}
      <Box sx={{ mb: 6 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Active Polls
          </Typography>
          <Button component={Link} to="/polls" size="small">
            See All
          </Button>
        </Box>

        {polls.length === 0 ? (
          <Typography color="text.secondary">
            No active polls right now
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {polls.map((poll) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={poll._id}>
                <PollCard poll={poll} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Top Idols 区域 */}
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Top Idols
          </Typography>
          <Button component={Link} to="/idols" size="small">
            See All
          </Button>
        </Box>

        {topIdols.length === 0 ? (
          <Typography color="text.secondary">No idols yet</Typography>
        ) : (
          <Grid container spacing={3}>
            {topIdols.map((idol) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={idol._id}>
                <IdolCard idol={idol} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Home;
