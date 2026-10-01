// Import React Hook for managing component state
import { useState } from "react";

// Import Link for navigation links and useNavigate for programmatic navigation
import { Link, useNavigate } from "react-router";

// Import Material UI components
import { TextField, Button, Typography } from "@mui/material";

// Import Snackbar function for showing success and error messages
import { useSnackbar } from "notistack";

// Import the custom authentication context hook
import { useAuth } from "../context/AuthContext";

// Import the reusable authentication page layout
import AuthLayout from "../components/AuthLayout";

// Register page component
const Register = () => {
  // Store the username entered by the user
  const [username, setUsername] = useState("");

  // Store the email entered by the user
  const [email, setEmail] = useState("");

  // Store the password entered by the user
  const [password, setPassword] = useState("");

  // Track whether the registration request is currently running
  // This is used to disable the button and prevent duplicate submissions
  const [loading, setLoading] = useState(false);

  // Get the register function from AuthContext
  // This function usually sends the registration request to the backend API
  const { register } = useAuth();

  // Get the Snackbar function for displaying notifications
  const { enqueueSnackbar } = useSnackbar();

  // Get the navigate function for redirecting users after registration
  const navigate = useNavigate();

  // Handle form submission when the user clicks the Register button
  const handleSubmit = async (e) => {
    // Prevent the browser from refreshing the page after form submission
    e.preventDefault();

    // Start the loading state before sending the registration request
    setLoading(true);

    try {
      // Send the username, email, and password to the register function
      await register(username, email, password);

      // Show a success notification after registration succeeds
      enqueueSnackbar("Registration successful! Please login.", {
        variant: "success",
      });

      // Redirect the new user to the login page
      navigate("/login");
    } catch (error) {
      // Use the error message returned by the backend if it exists
      // Otherwise, use a fallback message
      const message = error.response?.data?.message || "Registration failed";

      // Show the error notification to the user
      enqueueSnackbar(message, {
        variant: "error",
      });
    } finally {
      // Stop the loading state whether registration succeeds or fails
      // This re-enables the Register button
      setLoading(false);
    }
  };

  return (
    // Reusable layout component for authentication pages
    // variant="register" can be used to apply register-page-specific styling
    <AuthLayout title="Register" variant="register">
      {/* Submit the form through handleSubmit without refreshing the page */}
      <form onSubmit={handleSubmit}>
        {/* Controlled input for the user's username */}
        <TextField
          label="Username"
          fullWidth
          required
          // The input value is controlled by the username state
          value={username}
          // Update the username state whenever the user types
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Controlled input for the user's email address */}
        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          // The input value is controlled by the email state
          value={email}
          // Update the email state whenever the user types
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Controlled input for the user's password */}
        <TextField
          label="Password"
          type="password"
          fullWidth
          required
          // The input value is controlled by the password state
          value={password}
          // Update the password state whenever the user types
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* Submit button for the registration form */}
        <Button
          // type="submit" triggers the form onSubmit handler
          type="submit"
          variant="contained"
          color="secondary"
          fullWidth
          // Disable the button while the registration API request is running
          disabled={loading}
          size="large"
          sx={{
            // Create rounded button corners
            borderRadius: "16px",

            // Create a raised 3D button effect
            boxShadow: `
              0 6px 0 #c42069,
              inset 0 2px 4px rgba(255, 255, 255, 0.4)
            `,

            // Apply a pressed visual effect when the button is hovered
            "&:hover": {
              // Reduce the bottom shadow to make the button look pressed
              boxShadow: `
                0 4px 0 #c42069,
                inset 0 2px 4px rgba(255, 255, 255, 0.4)
              `,

              // Move the button downward slightly
              transform: "translateY(2px)",
            },
          }}
        >
          {/* Change the button text while the registration request is running */}
          {loading ? "Registering..." : "Register"}
        </Button>
      </form>

      {/* Link for users who already have an account */}
      <Typography sx={{ textAlign: "center", mt: 3 }} variant="body2">
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#c06db2", fontWeight: "bold" }}>
          Login
        </Link>
      </Typography>
    </AuthLayout>
  );
};

// Export the component so it can be used in your React Router routes
export default Register;
