import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
} from "@mui/material";
import { Link } from "react-router";
import dayjs from "dayjs";

// the color of status badge
const statusStyles = {
  active: { bgcolor: "#3dcb8e", color: "#ffffff" },
  upcoming: { bgcolor: "#c06db2", color: "#ffffff" },
  ended: { bgcolor: "#b0a0b5", color: "#ffffff" },
};

const PollCard = ({ poll }) => {
  // if don't have poll it will return null
  if (!poll) return null;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
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
          flexGrow: 1,
          gap: 1,
          p: 3,
        }}
      >
        {/* the poll status  */}
        {/* text transform : capitalize is make the first letter become capital letter  */}
        <Chip
          label={poll.status}
          size="small"
          sx={{
            ...statusStyles[poll.status],
            fontWeight: 600,
            alignSelf: "flex-start",
            textTransform: "capitalize",
          }}
        />

        {/* the poll title  */}
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {poll.title}
        </Typography>

        {/* the poll description  */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {poll.description}
        </Typography>

        {/* the start and end date of poll  */}
        <Typography variant="caption" color="text.secondary">
          {dayjs(poll.startDate).format("MMM D")} -{" "}
          {dayjs(poll.endDate).format("MMM D")}
        </Typography>

        <Box
          sx={{
            marginTop: "auto",
            pt: 2,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {/* view poll button  */}
          <Button
            variant="contained"
            color="secondary"
            component={Link}
            to={`/polls/${poll._id}`}
          >
            View Poll
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PollCard;
