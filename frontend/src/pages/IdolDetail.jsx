import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { CATEGORY_STYLES } from "../utils/categoryStyles";
import dayjs from "dayjs";
import api from "../services/api";

const statusStyles = {
  active: { bgcolor: "#3dcb8e", color: "#ffffff" },
  upcoming: { bgcolor: "#c06db2", color: "#ffffff" },
  ended: { bgcolor: "#b0a0b5", color: "#ffffff" },
};

const IdolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [idol, setIdol] = useState(null);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [idolRes, pollsRes] = await Promise.all([
          api.get(`/idols/${id}`),
          api.get(`/idols/${id}/polls`),
        ]);
        setIdol(idolRes.data.idol);
        setPolls(pollsRes.data.polls);
      } catch {
        enqueueSnackbar("Failed to load idol", { variant: "error" });
        navigate("/idols");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, enqueueSnackbar, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!idol) return null;

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Button component={Link} to="/idols" sx={{ mb: 2 }}>
        ← Back to Idols
      </Button>

      {/* Idol Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent
          sx={{
            p: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 3,
          }}
        >
          <Avatar
            src={idol.avatarUrl}
            sx={{
              width: 140,
              height: 140,
              bgcolor: "primary.main",
              fontSize: "3rem",
              fontWeight: "bold",
              border: "4px solid #ffffff",
              boxShadow: "0 4px 15px rgba(192, 109, 178, 0.25)",
            }}
          >
            {idol.name?.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flexGrow: 1, textAlign: { xs: "center", sm: "left" } }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
              {idol.name}
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 1,
                mb: 2,
                justifyContent: { xs: "center", sm: "flex-start" },
                flexWrap: "wrap",
              }}
            >
              <Chip
                label={idol.category}
                size="small"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  ...(CATEGORY_STYLES[idol.category] || {}),
                }}
              />
              <Chip
                label={idol.agencyId?.name || "Independent"}
                size="small"
                variant="outlined"
              />
            </Box>

            <Typography
              variant="h6"
              sx={{ color: "secondary.main", fontWeight: "bold" }}
            >
              {idol.totalVotes?.toLocaleString()} total votes
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Participated Polls */}
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Participated Polls ({polls.length})
      </Typography>

      {polls.length === 0 ? (
        <Typography color="text.secondary">
          This idol hasn't joined any polls yet.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {polls.map((poll) => (
            <Card key={poll._id}>
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: 2,
                  p: 2,
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Chip
                      label={poll.status}
                      size="small"
                      sx={{
                        ...statusStyles[poll.status],
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(poll.startDate).format("MMM D, YYYY")} -{" "}
                      {dayjs(poll.endDate).format("MMM D, YYYY")}
                    </Typography>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {poll.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: "secondary.main", fontWeight: 600 }}
                  >
                    {poll.voteCount} votes in this poll
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  component={Link}
                  to={`/polls/${poll._id}`}
                  sx={{ alignSelf: { xs: "stretch", sm: "center" } }}
                >
                  View Poll
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default IdolDetail;
