import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useSnackbar } from "notistack";
import api from "../services/api";
import PollCard from "../components/PollCard";

const PollList = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchPolls = async () => {
      setLoading(true);
      try {
        const res = await api.get("/polls");
        setPolls(res.data.polls);
      } catch (error) {
        enqueueSnackbar("Failed to load polls", { variant: "error" }, error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  const filteredPolls = polls.filter((poll) => poll.status === tab);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Polls
      </Typography>

      <Tabs
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Active" value="active" />
        <Tab label="Upcoming" value="upcoming" />
        <Tab label="Ended" value="ended" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : filteredPolls.length === 0 ? (
        <Typography
          sx={{ textAlign: "center", py: 6, color: "text.secondary" }}
        >
          No {tab} polls
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredPolls.map((poll) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={poll._id}>
              <PollCard poll={poll} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default PollList;
