import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
} from "@mui/material";

// Map each idol category to its corresponding color styles
const CATEGORY_STYLES = {
  // Styling for solo artists
  Soloist: {
    backgroundColor: "rgba(175, 22, 150, 0.15)",
    color: "#af1696",
    borderColor: "#af1696",
  },

  // Styling for girl groups
  "Girl Group": {
    backgroundColor: "rgba(255, 45, 138, 0.15)",
    color: "#ff2d8a",
    borderColor: "#ff2d8a",
  },

  // Styling for boy groups
  "Boy Group": {
    backgroundColor: "rgba(33, 150, 243, 0.15)",
    color: "#1976d2",
    borderColor: "#1976d2",
  },
};

// Reusable card component for displaying idol information
const IdolCard = ({ idol }) => {
  // Return nothing when no idol data is provided
  if (!idol) {
    return null;
  }

  // Get the style for the idol's category.
  // Use an empty object when the category is not defined.
  const categoryStyle = CATEGORY_STYLES[idol.category] || {};

  return (
    <Card
      sx={{
        borderRadius: 4,

        // Add a soft shadow around the card
        boxShadow: "0 4px 20px rgba(192, 109, 178, 0.15)",

        // Add a smooth hover animation
        transition: "transform 0.2s ease, box-shadow 0.2s ease",

        // Move the card slightly upward when hovered
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 30px rgba(192, 109, 178, 0.25)",
        },
      }}
    >
      <CardContent
        sx={{
          // Arrange the card content vertically
          display: "flex",
          flexDirection: "column",

          // Center all content horizontally
          alignItems: "center",
          p: 3,
        }}
      >
        {/* Display the idol's avatar image */}
        <Avatar
          src={idol.avatarUrl}
          alt={idol.name}
          sx={{
            width: 120,
            height: 120,
            mb: 2,

            // Add a white border around the avatar
            border: "4px solid #ffffff",

            // Add a soft shadow to the avatar
            boxShadow: "0 4px 15px rgba(192, 109, 178, 0.25)",

            // Use the primary color as the fallback background
            backgroundColor: "primary.main",

            // Style the fallback initial
            fontSize: "2.5rem",
            fontWeight: "bold",
          }}
        >
          {/* Display the first letter of the idol's name
              when the avatar image is unavailable */}
          {idol.name?.charAt(0).toUpperCase()}
        </Avatar>

        {/* Display the idol's name */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            mb: 0.5,
          }}
        >
          {idol.name}
        </Typography>

        {/* Display the agency name.
            Show "Independent" when no agency is assigned. */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1.5,
            fontStyle: "italic",
          }}
        >
          {idol.agencyId?.name || "Independent"}
        </Typography>

        {/* Display the category and total vote count */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 1,
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          {/* Category label with category-specific colors */}
          <Chip
            label={idol.category}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 600,
              ...categoryStyle,
            }}
          />

          {/* Display the total number of votes */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: "primary.main",
            }}
          >
            {idol.totalVotes?.toLocaleString()} votes
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default IdolCard;
