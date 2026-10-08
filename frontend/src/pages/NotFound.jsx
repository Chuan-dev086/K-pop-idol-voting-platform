import { Link } from "react-router";
import { Box, Typography, Button } from "@mui/material";

const NotFound = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        p: 3,
        textAlign: "center",
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: "6rem", md: "8rem" },
          fontWeight: "bold",
          color: "primary.main",
          lineHeight: 1,
        }}
      >
        404
      </Typography>

      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
        Page Not Found
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        The page you're looking for doesn't exist.
      </Typography>

      <Button
        variant="contained"
        color="secondary"
        component={Link}
        to="/"
        size="large"
      >
        Go Home
      </Button>
    </Box>
  );
};

export default NotFound;
