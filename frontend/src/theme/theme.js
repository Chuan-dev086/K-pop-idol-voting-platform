import { createTheme } from "@mui/material/styles";
import { keyframes } from "@emotion/react";

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#fbe7ff",
    },
    secondary: {
      main: "#ffdeee",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    // 全局背景
    MuiCssBaseline: {
      styleOverrides: {
        html: { minHeight: "100%" },
        body: {
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #c06db2 0%, #fefaff 50%, #ffe7fb 100%)",
          backgroundSize: "200% 200%",
          animation: `${gradientShift} 8s ease infinite`,
          backgroundAttachment: "fixed",
        },
        "#root": { minHeight: "100vh" },
      },
    },

    // 毛玻璃 Navbar
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(229, 221, 255, 0.88)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          color: "#ffffff",
          boxShadow: "none",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
    },

    // Button
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "uppercase",
          fontWeight: 700,
          letterSpacing: "0.12em",
          padding: "6px 16px",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.15)",
          },
        },
      },
    },
  },
});

export default theme;
