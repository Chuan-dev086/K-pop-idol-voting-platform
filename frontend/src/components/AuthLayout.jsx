import { Box, Card, CardContent, Typography } from "@mui/material";

const cardVariants = {
  // Login：粉色 neumorphism
  default: {
    backgroundColor: "#fde8f0",
    boxShadow: `
      inset 4px 4px 8px #ffffff,
      inset -10px -10px 20px #e0b3c5,
      8px 12px 28px rgba(228, 217, 247, 0.6)
    `,
  },
  // Register：紫色 neumorphism
  register: {
    backgroundColor: "#efe6fa",
    boxShadow: `
      inset 4px 4px 8px #ffffff,
      inset -10px -10px 20px #c9b3e0,
      8px 12px 28px rgba(228, 217, 247, 0.6)
    `,
  },
};

const AuthLayout = ({ title, children, variant = "default" }) => {
  const cardStyle = cardVariants[variant] || cardVariants.default;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: "40px",
          border: "none",
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
          ...cardStyle,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            sx={{ textAlign: "center", mb: 3, fontWeight: "bold" }}
          >
            {title}
          </Typography>
          {children}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthLayout;
