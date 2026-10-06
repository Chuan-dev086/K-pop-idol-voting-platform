// This component contains the shared styling and layout
// for both the login page and the register page.

import { Box, Card, CardContent, Typography } from "@mui/material";

// Different card styles for the login and register pages
const cardVariants = {
  // Styling used on the login page
  default: {
    backgroundColor: "#fde8f0",

    // Create a soft neumorphic-style card effect
    boxShadow: `
      inset 4px 4px 8px #ffffff,
      inset -10px -10px 20px #e0b3c5,
      8px 12px 28px rgba(228, 217, 247, 0.6)
    `,
  },

  // Styling used on the register page
  register: {
    backgroundColor: "#ffe3f9",

    // Create a different neumorphic-style effect
    // for the register page
    boxShadow: `
      inset 4px 4px 8px #ffffff,
      inset -10px -10px 20px #c9b3e0,
      8px 12px 28px rgba(228, 217, 247, 0.6)
    `,
  },
};

// Reusable layout component for authentication pages
const AuthLayout = ({ title, children, variant = "default" }) => {
  // Select the card style based on the variant prop.
  // Use the default login style if the provided variant is invalid.
  const cardStyle = cardVariants[variant] || cardVariants.default;

  return (
    // Outer container used to center the authentication card
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        p: 2,
      }}
    >
      {/* Authentication card */}
      <Card
        sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: "40px",
          border: "none",

          // Disable backdrop blur because the card does not
          // require a transparent glass effect
          backdropFilter: "none",
          WebkitBackdropFilter: "none",

          // Apply the selected login or register card style
          ...cardStyle,
        }}
      >
        {/* Card content area */}
        <CardContent sx={{ p: 4 }}>
          {/* Page title */}
          <Typography
            variant="h4"
            sx={{
              textAlign: "center",
              mb: 3,
              fontWeight: "bold",
            }}
          >
            {title}
          </Typography>

          {/* Render the form or other page content */}
          {children}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthLayout;
