import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
} from "@mui/material";

// Category 颜色映射（对象查表）
const CATEGORY_STYLES = {
  Soloist: {
    backgroundColor: "rgba(175, 22, 150, 0.15)",
    color: "#af1696",
    borderColor: "#af1696",
  },
  "Girl Group": {
    backgroundColor: "rgba(255, 45, 138, 0.15)",
    color: "#ff2d8a",
    borderColor: "#ff2d8a",
  },
  "Boy Group": {
    backgroundColor: "rgba(33, 150, 243, 0.15)",
    color: "#1976d2",
    borderColor: "#1976d2",
  },
};

const IdolCard = ({ idol }) => {
  if (!idol) return null;

  const categoryStyle = CATEGORY_STYLES[idol.category] || {};

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 4px 20px rgba(192, 109, 178, 0.15)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 30px rgba(192, 109, 178, 0.25)",
        },
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 3,
        }}
      >
        <Avatar
          src={idol.avatarUrl}
          alt={idol.name}
          sx={{
            width: 120,
            height: 120,
            mb: 2,
            border: "4px solid #ffffff",
            boxShadow: "0 4px 15px rgba(192, 109, 178, 0.25)",
            backgroundColor: "primary.main",
            fontSize: "2.5rem",
            fontWeight: "bold",
          }}
        >
          {idol.name?.charAt(0).toUpperCase()}
        </Avatar>

        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
          {idol.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1.5, fontStyle: "italic" }}
        >
          {idol.agencyId?.name || "Independent"}
        </Typography>

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
          <Chip
            label={idol.category}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 600,
              ...categoryStyle,
            }}
          />

          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "primary.main" }}
          >
            {idol.totalVotes?.toLocaleString()} votes
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default IdolCard;
