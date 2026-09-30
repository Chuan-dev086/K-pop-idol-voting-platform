import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
} from "@mui/material";

const IdolCard = ({ idol }) => {
  if (!idol) return null;

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
            width: 80,
            height: 80,
            mb: 2,
            border: "3px solid #ffffff",
            boxShadow: "0 2px 10px rgba(192, 109, 178, 0.2)",
            backgroundColor: "primary.main",
            fontSize: "2rem",
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
            color="primary"
            variant="outlined"
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
