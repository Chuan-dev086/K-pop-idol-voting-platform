// Import React Hooks for managing state and side effects
import { useState, useEffect } from "react";

// Import useNavigate for redirecting users to another route
import { useNavigate } from "react-router";

// Import Material UI components used on this page
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";

// Import Snackbar function for displaying success and error notifications
import { useSnackbar } from "notistack";

// Import the configured Axios API instance
import api from "../services/api";

// Import the authentication context hook
import { useAuth } from "../context/AuthContext";

// Import dayjs for formatting vote and heart history dates
import dayjs from "dayjs";

// User profile page component
const UserProfile = () => {
  // Get the current user and the function for updating user data
  const { user, setUser } = useAuth();

  // Get the function used to display Snackbar notifications
  const { enqueueSnackbar } = useSnackbar();

  // Get the function used to redirect users programmatically
  const navigate = useNavigate();

  // Track whether the daily check-in API request is currently running
  // This prevents the user from clicking the Check In button repeatedly
  const [checkingIn, setCheckingIn] = useState(false);

  // Store the current time in milliseconds
  // This state updates every second to keep the countdown timer live
  const [now, setNow] = useState(() => Date.now());

  // Store the user's voting history and heart transaction history
  // Both values start as empty arrays before API data is loaded
  const [history, setHistory] = useState({
    votes: [],
    heartLogs: [],
  });

  // Redirect visitors to the login page when they are not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Update the current time every second for the daily check-in countdown
  useEffect(() => {
    // Run setNow every 1000 milliseconds, which is once per second
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    // Clear the interval when the component unmounts
    // This prevents memory leaks and unnecessary background updates
    return () => clearInterval(interval);
  }, []);

  // Fetch voting and heart history after a user is available
  useEffect(() => {
    // Do not send an authenticated request if there is no logged-in user
    if (!user) {
      return;
    }

    // Create an async function because useEffect should not directly be async
    const fetchHistory = async () => {
      try {
        // Request the logged-in user's voting and heart transaction history
        const res = await api.get("/votes/history");

        // Store the returned history data in state
        setHistory({
          votes: res.data.votes,
          heartLogs: res.data.heartLogs,
        });
      } catch (error) {
        // Do not show an error message here because the profile page
        // can still display account information if history loading fails
        console.error("Failed to load profile history:", error);
      }
    };

    // Run the function that fetches the user's history
    fetchHistory();
  }, [user]);

  // Handle the daily check-in button click
  const handleCheckIn = async () => {
    // Disable the button and show a loading indicator while checking in
    setCheckingIn(true);

    try {
      // Send a request to claim the daily heart reward
      const res = await api.post("/votes/check-in");

      // Create an updated user object using the latest values from the backend
      const updatedUser = {
        ...user,
        heartBalance: res.data.heartBalance,
        lastCheckIn: res.data.lastCheckIn,
      };

      // Update the user stored in AuthContext
      // This updates the UI immediately without requiring a page refresh
      setUser(updatedUser);

      // Keep localStorage synchronized with the updated user data
      // This helps preserve the latest user information after refreshing the browser
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Show a success notification after the daily reward is claimed
      enqueueSnackbar("Check-in successful! +50 hearts", {
        variant: "success",
      });

      // Fetch history again so the new check-in appears in Heart History
      const historyRes = await api.get("/votes/history");

      // Update both voting history and heart transaction history
      setHistory({
        votes: historyRes.data.votes,
        heartLogs: historyRes.data.heartLogs,
      });
    } catch (error) {
      // Use the backend message when available
      // Otherwise, use a general fallback message
      let msg = error.response?.data?.message || "Check-in failed";

      // If the user has checked in before, calculate the remaining cooldown time
      if (user.lastCheckIn) {
        // Calculate how many milliseconds remain before 24 hours have passed
        const remainingMs = Math.max(
          0,
          24 * 60 * 60 * 1000 -
            (Date.now() - new Date(user.lastCheckIn).getTime()),
        );

        // Only replace the message if there is still cooldown time remaining
        if (remainingMs > 0) {
          // Convert milliseconds into hours, minutes, and seconds
          const h = Math.floor(remainingMs / (1000 * 60 * 60));
          const m = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((remainingMs % (1000 * 60)) / 1000);

          // Format the countdown as HH:MM:SS
          msg = `Already checked in. Try again in ${String(h).padStart(
            2,
            "0",
          )}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        }
      }

      // Show the error or cooldown message
      enqueueSnackbar(msg, {
        variant: "error",
      });
    } finally {
      // Re-enable the Check In button whether the request succeeds or fails
      setCheckingIn(false);
    }
  };

  // Do not render profile content while redirecting an unauthenticated visitor
  if (!user) {
    return null;
  }

  // Calculate the remaining daily check-in cooldown in milliseconds
  // If the user has never checked in, the remaining time is 0
  const remainingMs = user.lastCheckIn
    ? Math.max(
        0,
        24 * 60 * 60 * 1000 - (now - new Date(user.lastCheckIn).getTime()),
      )
    : 0;

  // Convert remaining milliseconds into displayable hours, minutes, and seconds
  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

  return (
    // Main profile page container
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      {/* Page title */}
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        My Profile
      </Typography>

      {/* Account information and daily check-in card */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          {/* Account information section heading */}
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Account Info
          </Typography>

          {/* Display basic user information in label-value rows */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {/* Display the user's username */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Username</Typography>
              <Typography sx={{ fontWeight: 500 }}>{user.username}</Typography>
            </Box>

            {/* Display the user's email address */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Email</Typography>
              <Typography sx={{ fontWeight: 500 }}>{user.email}</Typography>
            </Box>

            {/* Display the user's role with the first letter capitalized */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Role</Typography>
              <Typography
                sx={{
                  fontWeight: 500,
                  textTransform: "capitalize",
                }}
              >
                {user.role}
              </Typography>
            </Box>

            {/* Display the user's current heart balance */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Hearts</Typography>
              <Typography
                sx={{
                  fontWeight: "bold",
                  color: "secondary.main",
                }}
              >
                {user.heartBalance}
              </Typography>
            </Box>
          </Box>

          {/* Separate account information from the daily check-in section */}
          <Divider sx={{ my: 3 }} />

          {/* Daily check-in section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              {/* Daily check-in section heading */}
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Daily Check-in
              </Typography>

              {/* Show the countdown only when the user must wait */}
              {remainingMs > 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Next check-in in{" "}
                  {/* Use a span so only the countdown receives special styling */}
                  <Box
                    component="span"
                    sx={{
                      fontWeight: "bold",
                      color: "secondary.main",
                    }}
                  >
                    {/* Format hours, minutes, and seconds with leading zeros */}
                    {String(hours).padStart(2, "0")}:
                    {String(minutes).padStart(2, "0")}:
                    {String(seconds).padStart(2, "0")}
                  </Box>
                </Typography>
              ) : (
                // Show this message when the user can claim today's reward
                <Typography variant="body2" color="text.secondary">
                  Claim 50 hearts now
                </Typography>
              )}
            </Box>

            {/* Button for claiming the daily heart reward */}
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCheckIn}
              // Disable the button while the check-in request is running
              disabled={checkingIn}
            >
              {/* Show a spinner inside the button while submitting */}
              {checkingIn ? <CircularProgress size={20} /> : "Check In"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Voting history card */}
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Voting history section heading */}
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Voting History
          </Typography>

          {/* Show a message if the user has not cast any votes yet */}
          {history.votes.length === 0 ? (
            <Typography color="text.secondary">No votes yet</Typography>
          ) : (
            // Render one row for every vote record
            history.votes.map((vote, index) => (
              <Box
                // Use the vote MongoDB _id as a stable React key
                key={vote._id}
                sx={{
                  py: 1.5,
                  // Add a divider below every item except the last one
                  borderBottom:
                    index < history.votes.length - 1
                      ? "1px solid rgba(192, 109, 178, 0.1)"
                      : "none",
                }}
              >
                {/* Show idol name, poll title, and vote amount */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>
                    {/* Optional chaining prevents errors if related data was deleted */}
                    {vote.idolId?.name || "Unknown Idol"} in{" "}
                    {vote.pollId?.title || "Unknown Poll"}
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: "bold",
                      color: "secondary.main",
                    }}
                  >
                    {vote.votesSpent} votes
                  </Typography>
                </Box>

                {/* Only show the message if the user wrote one when voting */}
                {vote.message && (
                  <Typography variant="body2" color="text.secondary">
                    "{vote.message}"
                  </Typography>
                )}

                {/* Format the vote creation date and time */}
                <Typography variant="caption" color="text.secondary">
                  {dayjs(vote.createdAt).format("MMM D, YYYY HH:mm")}
                </Typography>
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      {/* Heart transaction history card */}
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Heart history section heading */}
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Heart History
          </Typography>

          {/* Show a message if there are no heart transactions */}
          {history.heartLogs.length === 0 ? (
            <Typography color="text.secondary">No heart changes yet</Typography>
          ) : (
            // Render one row for every heart transaction record
            history.heartLogs.map((log, index) => (
              <Box
                // Use the heart log MongoDB _id as a stable React key
                key={log._id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1.5,
                  // Add a divider below every item except the last one
                  borderBottom:
                    index < history.heartLogs.length - 1
                      ? "1px solid rgba(192, 109, 178, 0.1)"
                      : "none",
                }}
              >
                {/* Display the heart transaction type and its date */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {log.type}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {dayjs(log.createdAt).format("MMM D, YYYY HH:mm")}
                  </Typography>
                </Box>

                {/* Display positive amounts in green and negative amounts in red */}
                <Typography
                  sx={{
                    fontWeight: "bold",
                    color: log.amount > 0 ? "success.main" : "error.main",
                  }}
                >
                  {/* Add a plus sign only for positive heart changes */}
                  {log.amount > 0 ? "+" : ""}
                  {log.amount}
                </Typography>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

// Export the component so it can be used in React Router routes
export default UserProfile;
