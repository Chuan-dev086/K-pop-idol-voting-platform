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
import relativeTime from "dayjs/plugin/relativeTime";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Enable Day.js plugins for relative time formatting, such as "5 minutes ago".
dayjs.extend(relativeTime);

// Custom colors used for each poll status chip.
const statusStyles = {
  active: { bgcolor: "#3dcb8e", color: "#ffffff" },
  upcoming: { bgcolor: "#c06db2", color: "#ffffff" },
  ended: { bgcolor: "#b0a0b5", color: "#ffffff" },
};

const PollDetail = () => {
  // Get the poll ID from the current URL.
  const { id } = useParams();

  // Navigation helper used to redirect the user when needed.
  const navigate = useNavigate();

  // Get the current authenticated user and a function to refresh their data.
  const { user, refreshUser } = useAuth();

  // Snackbar helper used to show success, warning, and error notifications.
  const { enqueueSnackbar } = useSnackbar();

  // Details of the currently loaded poll.
  const [poll, setPoll] = useState(null);

  // Fan wall messages related to this poll.
  const [messages, setMessages] = useState([]);

  // Whether the poll and messages are still being fetched.
  const [loading, setLoading] = useState(true);

  // Whether the voting modal is open.
  const [openModal, setOpenModal] = useState(false);

  // The idol candidate selected for voting.
  const [selectedIdol, setSelectedIdol] = useState(null);

  // Number of votes the user wants to spend.
  const [votesSpent, setVotesSpent] = useState(1);

  // Optional message submitted with the vote.
  const [message, setMessage] = useState("");

  // Whether the vote request is currently being submitted.
  const [submitting, setSubmitting] = useState(false);

  // Fetch the poll details and fan wall messages when the page loads
  // or when the poll ID changes.
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the poll details and its messages at the same time.
        const [pollRes, messagesRes] = await Promise.all([
          api.get(`/polls/${id}`),
          api.get(`/votes/poll/${id}`),
        ]);

        setPoll(pollRes.data.poll);
        setMessages(messagesRes.data.messages);
      } catch {
        // Show an error and return to the polls page if loading fails.
        enqueueSnackbar("Failed to load poll", { variant: "error" });
        navigate("/polls");
      } finally {
        // Stop showing the loading spinner after the requests finish.
        setLoading(false);
      }
    };

    fetchData();
  }, [id, enqueueSnackbar, navigate]);

  // Open the voting modal for the selected candidate.
  const handleOpenVote = (candidate) => {
    // Require the user to log in before voting.
    if (!user) {
      enqueueSnackbar("Please login to vote", { variant: "warning" });
      navigate("/login");
      return;
    }

    // Reset the voting form and open the modal.
    setSelectedIdol(candidate);
    setVotesSpent(1);
    setMessage("");
    setOpenModal(true);
  };

  // Submit the user's vote to the backend.
  const handleVote = async () => {
    // Ensure the user enters at least one vote.
    if (votesSpent < 1) {
      enqueueSnackbar("Please enter at least 1 vote", { variant: "error" });
      return;
    }

    setSubmitting(true);

    try {
      // Send the vote request, including the selected idol, vote amount, and optional message.
      await api.post("/votes/cast", {
        pollId: id,
        idolId: selectedIdol.idolId._id,
        votesSpent: parseInt(votesSpent, 10),
        message,
      });

      // Notify the user and close the voting modal.
      enqueueSnackbar("Vote cast successfully!", { variant: "success" });
      setOpenModal(false);

      // Refresh the poll results and fan wall messages after voting.
      const [pollRes, messagesRes] = await Promise.all([
        api.get(`/polls/${id}`),
        api.get(`/votes/poll/${id}`),
      ]);

      setPoll(pollRes.data.poll);
      setMessages(messagesRes.data.messages);

      // Refresh the user's data, such as their remaining heart balance.
      await refreshUser();
    } catch (error) {
      // Show the backend error message if available, otherwise show a default message.
      const msg = error.response?.data?.message || "Vote failed";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      // Re-enable the vote button after the request finishes.
      setSubmitting(false);
    }
  };

  // Show a loading spinner while the poll data is being fetched.
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Do not render anything if the poll data is unavailable.
  if (!poll) return null;

  // Find the highest vote count so the ranking bars can be scaled correctly.
  const maxVotes = Math.max(...poll.candidates.map((c) => c.voteCount), 1);

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      {/* Button to return to the polls list */}
      <Button component={Link} to="/polls" sx={{ mb: 2 }}>
        ← Back to Polls
      </Button>

      {/* Poll information header */}
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0 4px 20px rgba(192, 109, 178, 0.15)",
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Poll status and date range */}
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

          {/* Poll title and optional description */}
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

      {/* Candidate rankings */}
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Rankings
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Render each candidate with their rank, avatar, vote progress, and vote button */}
        {poll.candidates.map((candidate, index) => {
          const idol = candidate.idolId;

          // Calculate the candidate's vote percentage relative to the highest vote count.
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
                {/* Candidate ranking position */}
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

                {/* Candidate avatar with a fallback initial */}
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

                {/* Candidate name and vote progress bar */}
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

                {/* Total votes received by this candidate */}
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", minWidth: 80, textAlign: "right" }}
                >
                  {candidate.voteCount} votes
                </Typography>

                {/* Show the vote button only for active polls and non-admin users */}
                {poll.status === "active" && user?.role !== "admin" && (
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

      {/* Fan wall section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Fan Wall
        </Typography>

        {/* Show an empty-state message when there are no fan messages */}
        {messages.length === 0 ? (
          <Typography color="text.secondary">
            No messages yet. Be the first to cheer!
          </Typography>
        ) : (
          /* Render each fan wall message */
          messages.map((msg) => (
            <Card key={msg._id} sx={{ mb: 2 }}>
              <CardContent>
                {/* Message author, supported idol, and timestamp */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 1,
                    flexWrap: "wrap",
                    gap: 0.5,
                  }}
                >
                  {/* User avatar with a fallback initial */}
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "primary.main",
                      fontSize: "0.9rem",
                    }}
                  >
                    {msg.userId?.username?.charAt(0).toUpperCase() || "?"}
                  </Avatar>

                  <Typography sx={{ fontWeight: 600 }}>
                    {msg.userId?.username || "Unknown"}
                  </Typography>

                  <Typography sx={{ color: "text.secondary" }}>→</Typography>

                  <Typography sx={{ fontWeight: 600, color: "primary.main" }}>
                    {msg.idolId?.name || "Unknown Idol"}
                  </Typography>
                </Box>

                {/* Optional fan message */}
                {msg.message && msg.message.trim() && (
                  <Typography sx={{ mb: 1, fontStyle: "italic" }}>
                    "{msg.message}"
                  </Typography>
                )}

                {/* Number of votes spent and relative posting time */}
                <Typography variant="caption" color="text.secondary">
                  {msg.votesSpent} votes · {dayjs(msg.createdAt).fromNow()}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Voting modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Vote for {selectedIdol?.idolId?.name}</DialogTitle>

        <DialogContent>
          {/* Show the user's current heart balance */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your hearts: {user?.heartBalance}
          </Typography>

          {/* Input for the number of votes to spend */}
          <TextField
            label="Votes"
            type="number"
            fullWidth
            value={votesSpent}
            onChange={(e) => setVotesSpent(e.target.value)}
            slotProps={{ htmlInput: { min: 1 } }}
            sx={{ mb: 2 }}
          />

          {/* Optional message to accompany the vote */}
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
          {/* Close the modal without voting */}
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>

          {/* Submit the vote; disabled while the request is in progress */}
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
