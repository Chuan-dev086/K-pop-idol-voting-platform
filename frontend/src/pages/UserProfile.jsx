import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useSnackbar } from "notistack";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";

// Human-readable labels for different heart balance change types.
const typeLabels = {
  CHECK_IN: "Daily Check-in",
  VOTE_SPENT: "Vote Spent",
  ADMIN_GRANT: "Admin Grant",
  TASK_REWARD: "Task Reward",
};

const UserProfile = () => {
  // Get the current user and the function used to update user state.
  const { user, setUser } = useAuth();

  // Snackbar helper used to show success and error notifications.
  const { enqueueSnackbar } = useSnackbar();

  // Whether the daily check-in request is currently in progress.
  const [checkingIn, setCheckingIn] = useState(false);

  // Current timestamp, updated every second for the check-in countdown.
  const [now, setNow] = useState(() => Date.now());

  // User's voting history and heart balance change history.
  const [history, setHistory] = useState({ votes: [], heartLogs: [] });

  // Update the current time every second so the check-in countdown stays accurate.
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    // Clear the interval when the component unmounts.
    return () => clearInterval(interval);
  }, []);

  // Fetch the user's voting history and heart history after login.
  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const res = await api.get("/votes/history");

        setHistory({
          votes: res.data.votes,
          heartLogs: res.data.heartLogs,
        });
      } catch {
        // Silently ignore history loading errors.
      }
    };

    fetchHistory();
  }, [user]);

  // Handle the daily check-in request.
  const handleCheckIn = async () => {
    setCheckingIn(true);

    try {
      // Send the check-in request to the backend.
      const res = await api.post("/votes/check-in");

      // Update the user's heart balance and last check-in time.
      const updatedUser = {
        ...user,
        heartBalance: res.data.heartBalance,
        lastCheckIn: res.data.lastCheckIn,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Show a success notification.
      enqueueSnackbar("Check-in successful! +50 hearts", {
        variant: "error",
      });

      // Refresh the voting and heart history after a successful check-in.
      const historyRes = await api.get("/votes/history");
      setHistory({
        votes: historyRes.data.votes,
        heartLogs: historyRes.data.heartLogs,
      });
    } catch (error) {
      // Use the backend error message if available.
      let msg = error.response?.data?.message || "Check-in failed";

      // If the user has already checked in, calculate and show the remaining cooldown time.
      if (user.lastCheckIn) {
        const remainingMs = Math.max(
          0,
          24 * 60 * 60 * 1000 -
            (Date.now() - new Date(user.lastCheckIn).getTime()),
        );

        if (remainingMs > 0) {
          // Convert the remaining time into hours, minutes, and seconds.
          const h = Math.floor(remainingMs / (1000 * 60 * 60));
          const m = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((remainingMs % (1000 * 60)) / 1000);

          msg = `Already checked in. Try again in ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        }
      }

      // Show the error notification.
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      // Re-enable the check-in button after the request finishes.
      setCheckingIn(false);
    }
  };

  // Do not render the profile page if no user is logged in.
  if (!user) return null;

  // Calculate the remaining time before the next check-in is available.
  const remainingMs = user.lastCheckIn
    ? Math.max(
        0,
        24 * 60 * 60 * 1000 - (now - new Date(user.lastCheckIn).getTime()),
      )
    : 0;

  // Convert the remaining cooldown time into hours, minutes, and seconds.
  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      {/* Page title */}
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        My Profile
      </Typography>

      {/* Account Info Card */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Account Info
          </Typography>

          {/* Basic account details */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Username</Typography>
              <Typography sx={{ fontWeight: 500 }}>{user.username}</Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Email</Typography>
              <Typography sx={{ fontWeight: 500 }}>{user.email}</Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Role</Typography>
              <Typography sx={{ fontWeight: 500, textTransform: "capitalize" }}>
                {user.role}
              </Typography>
            </Box>

            {/* Show heart balance only for non-admin users */}
            {user.role !== "admin" && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Hearts</Typography>
                <Typography
                  sx={{ fontWeight: "bold", color: "secondary.main" }}
                >
                  {user.heartBalance}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Daily check-in, voting history, and heart history for non-admin users */}
          {user.role !== "admin" && (
            <>
              <Divider sx={{ my: 3 }} />

              {/* Daily check-in section with countdown */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    Daily Check-in
                  </Typography>

                  {/* Show countdown if the user has already checked in today */}
                  {remainingMs > 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Next check-in in{" "}
                      <Box
                        component="span"
                        sx={{ fontWeight: "bold", color: "secondary.main" }}
                      >
                        {String(hours).padStart(2, "0")}:
                        {String(minutes).padStart(2, "0")}:
                        {String(seconds).padStart(2, "0")}
                      </Box>
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Claim 50 hearts now
                    </Typography>
                  )}
                </Box>

                {/* Daily check-in button */}
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                >
                  {checkingIn ? <CircularProgress size={20} /> : "Check In"}
                </Button>
              </Box>

              {/* Voting History Card */}
              <Card sx={{ mt: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                    Voting History
                  </Typography>

                  {/* Show an empty-state message if the user has not voted yet */}
                  {history.votes.length === 0 ? (
                    <Typography color="text.secondary">No votes yet</Typography>
                  ) : (
                    /* Render each voting history record */
                    history.votes.map((vote, index) => (
                      <Box
                        key={vote._id}
                        sx={{
                          py: 1.5,
                          borderBottom:
                            index < history.votes.length - 1
                              ? "1px solid rgba(192, 109, 178, 0.1)"
                              : "none",
                        }}
                      >
                        {/* Vote target and number of votes spent */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography sx={{ fontWeight: 600 }}>
                            {vote.idolId?.name || "Unknown Idol"} in{" "}
                            {vote.pollId?.title || "Unknown Poll"}
                          </Typography>
                          <Typography
                            sx={{ fontWeight: "bold", color: "secondary.main" }}
                          >
                            {vote.votesSpent} votes
                          </Typography>
                        </Box>

                        {/* Optional message submitted with the vote */}
                        {vote.message && (
                          <Typography variant="body2" color="text.secondary">
                            "{vote.message}"
                          </Typography>
                        )}

                        {/* Vote timestamp */}
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(vote.createdAt).format("MMM D, YYYY HH:mm")}
                        </Typography>
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Heart History Card */}
              <Card sx={{ mt: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                    Heart History
                  </Typography>

                  {/* Show an empty-state message if there are no heart balance changes */}
                  {history.heartLogs.length === 0 ? (
                    <Typography color="text.secondary">
                      No heart changes yet
                    </Typography>
                  ) : (
                    /* Render each heart balance change record */
                    history.heartLogs.map((log, index) => (
                      <Box
                        key={log._id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 1.5,
                          borderBottom:
                            index < history.heartLogs.length - 1
                              ? "1px solid rgba(192, 109, 178, 0.1)"
                              : "none",
                        }}
                      >
                        {/* Heart change type and timestamp */}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {typeLabels[log.type] || log.type}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(log.createdAt).format("MMM D, YYYY HH:mm")}
                          </Typography>
                        </Box>

                        {/* Heart amount gained or spent */}
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            color:
                              log.amount > 0 ? "success.main" : "error.main",
                          }}
                        >
                          {log.amount > 0 ? "+" : ""}
                          {log.amount}
                        </Typography>
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserProfile;
