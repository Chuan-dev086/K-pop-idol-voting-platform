// Import React Hooks for state management and API side effects
import { useState, useEffect } from "react";

// Import routing hooks and Link component
import { useParams, useNavigate, Link } from "react-router";

// Import Material UI components used on this page
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

// Import Snackbar function for showing feedback messages
import { useSnackbar } from "notistack";

// Import dayjs for formatting poll start and end dates
import dayjs from "dayjs";

// Import the configured Axios API instance
import api from "../services/api";

// Import the custom authentication context hook
import { useAuth } from "../context/AuthContext";

// Define a color style for every possible poll status
// The poll status is used by the Chip component in the poll header
const statusStyles = {
  active: {
    bgcolor: "#3dcb8e",
    color: "#ffffff",
  },
  upcoming: {
    bgcolor: "#c06db2",
    color: "#ffffff",
  },
  ended: {
    bgcolor: "#b0a0b5",
    color: "#ffffff",
  },
};

// Page component for showing one poll and allowing users to vote
const PollDetail = () => {
  // Get the poll ID from the URL
  // Example route: /polls/123
  // id will be "123"
  const { id } = useParams();

  // Get the function used to redirect the user to another page
  const navigate = useNavigate();

  // Get the currently logged-in user from AuthContext
  // user is usually null when the visitor is not logged in
  const { user, refreshUser } = useAuth();

  // Get the Snackbar function for success, warning, and error notifications
  const { enqueueSnackbar } = useSnackbar();

  // Store the poll data returned from the backend API
  // It starts as null because the page has not loaded the poll yet
  const [poll, setPoll] = useState(null);

  // Track whether the poll data is still being loaded
  const [loading, setLoading] = useState(true);

  // Control whether the voting dialog/modal is open
  const [openModal, setOpenModal] = useState(false);

  // Store the candidate selected by the user for voting
  const [selectedIdol, setSelectedIdol] = useState(null);

  // Store the number of votes/hearts the user wants to spend
  // The default value is 1 vote
  const [votesSpent, setVotesSpent] = useState(1);

  // Store the optional message sent together with the vote
  const [message, setMessage] = useState("");

  // Track whether the vote submission API request is currently running
  // This prevents duplicate vote submissions
  const [submitting, setSubmitting] = useState(false);

  // Fetch poll details when the page first loads or when the poll ID changes
  useEffect(() => {
    // Create an async function because useEffect should not directly be async
    const fetchPoll = async () => {
      try {
        // Request one poll using the ID from the URL
        // Example: GET /polls/123
        const res = await api.get(`/polls/${id}`);

        // Save the returned poll object into state
        setPoll(res.data.poll);
      } catch (error) {
        console.error("Failed to load poll:", error);
        // Show an error notification if the poll cannot be loaded
        enqueueSnackbar("Failed to load poll", {
          variant: "error",
        });

        // Redirect the user back to the polls list page
        // This is useful if the ID is invalid or the poll was deleted
        navigate("/polls");
      } finally {
        // Stop the loading state whether the API request succeeds or fails
        setLoading(false);
      }
    };

    // Run the function that loads the poll data
    fetchPoll();
  }, [id, enqueueSnackbar, navigate]);

  // Open the voting modal after checking whether the user is logged in
  const handleOpenVote = (candidate) => {
    // Prevent visitors who are not logged in from voting
    if (!user) {
      // Inform the visitor that login is required
      enqueueSnackbar("Please login to vote", {
        variant: "warning",
      });

      // Redirect the visitor to the login page
      navigate("/login");

      // Stop the rest of this function
      return;
    }

    // Save the clicked candidate so the dialog knows who the user is voting for
    setSelectedIdol(candidate);

    // Reset the vote amount to 1 every time the voting modal opens
    setVotesSpent(1);

    // Clear any previous optional message
    setMessage("");

    // Open the voting dialog
    setOpenModal(true);
  };

  // Submit the vote to the backend API
  const handleVote = async () => {
    // Do not allow zero or negative votes
    if (votesSpent < 1) {
      enqueueSnackbar("Please enter at least 1 vote", {
        variant: "error",
      });

      return;
    }

    // Start the submitting state to disable the Vote button
    setSubmitting(true);

    try {
      // Send the vote information to the backend
      await api.post("/votes/cast", {
        // The current poll ID from the URL
        pollId: id,

        // The selected candidate contains a populated idolId object
        // Send the actual idol MongoDB ID to the backend
        idolId: selectedIdol.idolId._id,

        // Convert the input value to an integer before sending it
        votesSpent: parseInt(votesSpent, 10),

        // Send the optional supporting message
        message,
      });

      // Show a success notification after the vote is successfully saved
      enqueueSnackbar("Vote cast successfully!", {
        variant: "success",
      });

      // Close the voting dialog
      setOpenModal(false);

      // Fetch the updated poll data again
      // This refreshes the vote counts and ranking without reloading the page
      const res = await api.get(`/polls/${id}`);
      setPoll(res.data.poll);
      await refreshUser();
    } catch (error) {
      // Use the backend error message if it exists
      // Otherwise, use a fallback error message
      const msg = error.response?.data?.message || "Vote failed";

      // Show the error message to the user
      enqueueSnackbar(msg, {
        variant: "error",
      });
    } finally {
      // Stop the submitting state whether the vote succeeds or fails
      setSubmitting(false);
    }
  };

  // Show a loading spinner while the poll data is being fetched
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Do not render the page if no poll was found
  // Usually this happens after an error and redirect
  if (!poll) {
    return null;
  }

  // Find the highest vote count among all candidates
  // The value is used to calculate each candidate's progress bar percentage
  //
  // The fallback value of 1 prevents division by zero if all candidates have 0 votes
  const maxVotes = Math.max(
    ...poll.candidates.map((candidate) => candidate.voteCount),
    1,
  );

  return (
    // Main page container with a maximum width for better readability
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      {/* Link button that returns the user to the poll directory page */}
      <Button component={Link} to="/polls" sx={{ mb: 2 }}>
        ← Back to Polls
      </Button>

      {/* Poll information header card */}
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0 4px 20px rgba(192, 109, 178, 0.15)",
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Display poll status and date range in one row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            {/* Status chip: active, upcoming, or ended */}
            <Chip
              label={poll.status}
              size="small"
              sx={{
                // Apply the correct color style from statusStyles
                ...statusStyles[poll.status],
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            />

            {/* Format the poll's start and end date with dayjs */}
            <Typography variant="caption" color="text.secondary">
              {dayjs(poll.startDate).format("MMM D, YYYY")} -{" "}
              {dayjs(poll.endDate).format("MMM D, YYYY")}
            </Typography>
          </Box>

          {/* Display the poll title */}
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            {poll.title}
          </Typography>

          {/* Only display the description if the poll has one */}
          {poll.description && (
            <Typography variant="body1" color="text.secondary">
              {poll.description}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Ranking section heading */}
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Rankings
      </Typography>

      {/* Display candidates vertically with a gap between every ranking card */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Convert each candidate in the poll into one ranking card */}
        {poll.candidates.map((candidate, index) => {
          // The backend has likely populated idolId with full idol information
          const idol = candidate.idolId;

          // Calculate the progress bar width based on the highest vote count
          // The highest-ranked candidate gets 100%
          const percentage = (candidate.voteCount / maxVotes) * 100;

          return (
            <Card
              // Use the idol's MongoDB ID as the unique React key
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
                {/* Display the candidate ranking number, such as #1 or #2 */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    minWidth: 32,
                    color: "primary.main",
                  }}
                >
                  No.{index + 1}
                </Typography>

                {/* Display the idol image, or the first letter of the idol name as fallback */}
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

                {/* Display the idol name and relative vote progress bar */}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {idol.name}
                  </Typography>

                  {/* Show vote progress relative to the candidate with the most votes */}
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{ mt: 0.5, height: 8, borderRadius: 4 }}
                  />
                </Box>

                {/* Display the exact vote count */}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "bold",
                    minWidth: 80,
                    textAlign: "right",
                  }}
                >
                  {candidate.voteCount} votes
                </Typography>

                {/* Only allow voting when the poll status is active */}
                {poll.status === "active" && user?.role !== "admin" && (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    // Pass the current candidate to the voting handler
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

      {/* Voting dialog/modal */}
      <Dialog
        // Control whether the modal is visible
        open={openModal}
        // Close the modal when the user clicks outside it or presses Escape
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="xs"
      >
        {/* Optional chaining prevents errors before a candidate is selected */}
        <DialogTitle>Vote for {selectedIdol?.idolId?.name}</DialogTitle>

        <DialogContent>
          {/* Show the logged-in user's remaining heart balance */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your hearts: {user?.heartBalance}
          </Typography>

          {/* Input for choosing how many votes/hearts to spend */}
          <TextField
            label="Votes"
            type="number"
            fullWidth
            // Controlled input value
            value={votesSpent}
            // Update votesSpent whenever the user changes the number
            onChange={(e) => setVotesSpent(e.target.value)}
            // Prevent values lower than 1 in the browser input UI
            inputProps={{ min: 1 }}
            sx={{ mb: 2 }}
          />

          {/* Optional message that can be included with the vote */}
          <TextField
            label="Message (optional)"
            fullWidth
            multiline
            rows={2}
            // Controlled input value
            value={message}
            // Update the message state while the user types
            onChange={(e) => setMessage(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          {/* Close the modal without sending a vote */}
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>

          {/* Submit the vote to the backend */}
          <Button
            variant="contained"
            color="secondary"
            onClick={handleVote}
            // Disable the button while the vote API request is processing
            disabled={submitting}
          >
            {/* Change the button text while submitting */}
            {submitting ? "Voting..." : "Vote"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Export the page component for use in React Router
export default PollDetail;
