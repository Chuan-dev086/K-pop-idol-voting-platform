// Import React Hook for managing component state
import { useState } from "react";

// Import Link for navigation links and useNavigate for programmatic navigation
import { Link, useNavigate } from "react-router";

// Import Material UI components
import { TextField, Button, Typography } from "@mui/material";

// Import the reusable authentication page layout
import AuthLayout from "../components/AuthLayout";

// Import Snackbar function for showing success and error messages
import { useSnackbar } from "notistack";

// Import the custom authentication context hook
import { useAuth } from "../context/AuthContext";

// Login page component
const Login = () => {
  // Store the email entered by the user
  const [email, setEmail] = useState("");

  // Store the password entered by the user
  const [password, setPassword] = useState("");

  // Track whether the login request is currently being processed
  // This is used to disable the button and prevent multiple submissions
  const [loading, setLoading] = useState(false);

  // Get the login function from AuthContext
  // This function usually sends the login request to the backend
  const { login } = useAuth();

  // Get the function for displaying Snackbar notifications
  const { enqueueSnackbar } = useSnackbar();

  // Get the navigate function for redirecting users after login
  const navigate = useNavigate();

  // Handle form submission when the user clicks the Login button
  const handleSubmit = async (e) => {
    // Prevent the browser from refreshing the page when the form submits
    e.preventDefault();

    // Start the loading state before sending the login request
    setLoading(true);

    try {
      // Call the login function with the user's email and password
      // The returned user object is expected to contain the user's role
      const user = await login(email, password);

      // Show a success notification after a successful login
      enqueueSnackbar("Login successful", {
        variant: "success",
      });

      // Redirect admins to the admin dashboard
      // Redirect normal users to the home page
      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (error) {
      // Try to get the backend error message
      // Fall back to a general message if no backend message is available
      const message = error.response?.data?.message || "Login failed";

      // Show the error message to the user
      enqueueSnackbar(message, {
        variant: "error",
      });
    } finally {
      // Stop the loading state whether login succeeds or fails
      // This re-enables the login button
      setLoading(false);
    }
  };

  return (
    // Reusable layout component for login and register pages
    <AuthLayout title="Login">
      {/* Submit the form through handleSubmit instead of refreshing the page */}
      <form onSubmit={handleSubmit}>
        {/* Controlled input for the user's email address */}
        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          // The displayed value is controlled by the email state
          value={email}
          // Update email state whenever the user types
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Controlled input for the user's password */}
        <TextField
          label="Password"
          type="password"
          fullWidth
          required
          // The displayed value is controlled by the password state
          value={password}
          // Update password state whenever the user types
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* Submit button for the login form */}
        <Button
          // type="submit" triggers the form's onSubmit event
          type="submit"
          variant="contained"
          color="secondary"
          fullWidth
          // Disable the button while the login request is running
          // This prevents the user from submitting the form multiple times
          disabled={loading}
          size="large"
          sx={{
            // Round the button corners
            borderRadius: "16px",

            // Create a raised 3D button effect
            boxShadow: `
              0 6px 0 #c42069,
              inset 0 2px 4px rgba(255, 255, 255, 0.4)
            `,

            // Change the button appearance when the user hovers over it
            "&:hover": {
              // Reduce the bottom shadow so the button appears pressed
              boxShadow: `
                0 4px 0 #c42069,
                inset 0 2px 4px rgba(255, 255, 255, 0.4)
              `,

              // Move the button down slightly for a press effect
              transform: "translateY(2px)",
            },
          }}
        >
          {/* Change the button text while the login request is loading */}
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>

      {/* Link for users who do not have an account yet */}
      <Typography sx={{ textAlign: "center", mt: 3 }} variant="body2">
        Don't have an account?{" "}
        <Link to="/register" style={{ color: "#c06db2", fontWeight: "bold" }}>
          Register
        </Link>
      </Typography>
    </AuthLayout>
  );
};

// Export the component so it can be used in your routes
export default Login;
