import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const statusStyles = {
  active: { bgcolor: "#3dcb8e", color: "#ffffff" },
  upcoming: { bgcolor: "#c06db2", color: "#ffffff" },
  ended: { bgcolor: "#b0a0b5", color: "#ffffff" },
};

const PollDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedIdol, setSelectedIdol] = useState(null);
  const [votesSpent, setVotesSpent] = useState(1);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await api.get(`/polls/${id}`);
        setPoll(res.data.poll);
      } catch (error) {
        enqueueSnackbar("Failed to load poll", { variant: "error" }, error);
        navigate("/polls");
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [id, enqueueSnackbar, navigate]);

  const handleOpenVote = (candidate) => {
    if (!user) {
      enqueueSnackbar("Please login to vote", { variant: "warning" });
      navigate("/login");
      return;
    }

    setSelectedIdol(candidate);
    setVotesSpent(1);
    setMessage("");
    setOpenModal(true);
  };

  const handleVote = async () => {
    if (votesSpent < 1) {
      enqueueSnackbar("Please enter at least 1 vote", { variant: "error" });
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/votes/cast", {
        pollId: id,
        idolId: selectedIdol.idolId._id,
        votesSpent: parseInt(votesSpent, 10),
        message,
      });

      enqueueSnackbar("Vote cast successfully!", { variant: "success" });
      setOpenModal(false);

      const res = await api.get(`/polls/${id}`);
      setPoll(res.data.poll);
    } catch (error) {
      const msg = error.response?.data?.message || "Vote failed";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!poll) return null;

  const maxVotes = Math.max(...poll.candidates.map((c) => c.voteCount), 1);

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Button component={Link} to="/polls" sx={{ mb: 2 }}>
        ← Back to Polls
      </Button>

      {/* Poll 信息头部 */}
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0 4px 20px rgba(192, 109, 178, 0.15)",
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
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

          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            {poll.title}
          </Typography>

          {poll.description && (
            <Typography variant="body1" color="text.secondary">
              {poll.description}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* 候选人排名 */}
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Rankings
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {poll.candidates.map((candidate, index) => {
          const idol = candidate.idolId;
          const percentage = (candidate.voteCount / maxVotes) * 100;

          return (
            <Card
              key={idol._id}
              sx={{
                borderRadius: 3,
                boxShadow: "0 2px 10px rgba(192, 109, 178, 0.1)",
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    minWidth: 32,
                    color: "primary.main",
                  }}
                >
                  #{index + 1}
                </Typography>

                <Avatar
                  src={idol.avatarUrl}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "primary.main",
                    fontWeight: "bold",
                  }}
                >
                  {idol.name?.charAt(0).toUpperCase()}
                </Avatar>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {idol.name}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{ mt: 0.5, height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", minWidth: 80, textAlign: "right" }}
                >
                  {candidate.voteCount} votes
                </Typography>

                {poll.status === "active" && (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => handleOpenVote(candidate)}
                  >
                    Vote
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* 投票 Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Vote for {selectedIdol?.idolId?.name}</DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your hearts: {user?.heartBalance}
          </Typography>

          <TextField
            label="Votes"
            type="number"
            fullWidth
            value={votesSpent}
            onChange={(e) => setVotesSpent(e.target.value)}
            inputProps={{ min: 1 }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Message (optional)"
            fullWidth
            multiline
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleVote}
            disabled={submitting}
          >
            {submitting ? "Voting..." : "Vote"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PollDetail;
