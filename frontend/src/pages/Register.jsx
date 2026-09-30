import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { TextField, Button, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(username, email, password);
      enqueueSnackbar("Registration successful! Please login.", {
        variant: "success",
      });
      navigate("/login");
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Register" variant="register">
      <form onSubmit={handleSubmit}>
        <TextField
          label="Username"
          fullWidth
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          variant="contained"
          color="secondary"
          fullWidth
          disabled={loading}
          size="large"
          sx={{
            borderRadius: "16px",
            boxShadow: `
      0 6px 0 #c42069,
      inset 0 2px 4px rgba(255, 255, 255, 0.4)
    `,
            "&:hover": {
              boxShadow: `
        0 4px 0 #c42069,
        inset 0 2px 4px rgba(255, 255, 255, 0.4)
      `,
              transform: "translateY(2px)",
            },
          }}
        >
          {loading ? "Registering..." : "Register"}
        </Button>
      </form>

      <Typography sx={{ textAlign: "center", mt: 3 }} variant="body2">
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#c06db2", fontWeight: "bold" }}>
          Login
        </Link>
      </Typography>
    </AuthLayout>
  );
};

export default Register;
