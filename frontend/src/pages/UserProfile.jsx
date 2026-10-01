import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
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

const UserProfile = () => {
  const { user, setUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [checkingIn, setCheckingIn] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await api.post("/votes/check-in");

      const updatedUser = {
        ...user,
        heartBalance: res.data.heartBalance,
        lastCheckIn: res.data.lastCheckIn,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      enqueueSnackbar("Check-in successful! +50 hearts", {
        variant: "success",
      });
    } catch (error) {
      let msg = error.response?.data?.message || "Check-in failed";

      if (user.lastCheckIn) {
        const remainingMs = Math.max(
          0,
          24 * 60 * 60 * 1000 -
            (Date.now() - new Date(user.lastCheckIn).getTime()),
        );

        if (remainingMs > 0) {
          const h = Math.floor(remainingMs / (1000 * 60 * 60));
          const m = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((remainingMs % (1000 * 60)) / 1000);

          msg = `Already checked in. Try again in ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        }
      }

      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setCheckingIn(false);
    }
  };

  if (!user) return null;

  const remainingMs = user.lastCheckIn
    ? Math.max(
        0,
        24 * 60 * 60 * 1000 - (now - new Date(user.lastCheckIn).getTime()),
      )
    : 0;

  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        My Profile
      </Typography>

      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0 4px 20px rgba(192, 109, 178, 0.15)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Account Info
          </Typography>

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

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Hearts</Typography>
              <Typography sx={{ fontWeight: "bold", color: "secondary.main" }}>
                {user.heartBalance}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

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

            <Button
              variant="contained"
              color="secondary"
              onClick={handleCheckIn}
              disabled={checkingIn}
            >
              {checkingIn ? <CircularProgress size={20} /> : "Check In"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserProfile;
