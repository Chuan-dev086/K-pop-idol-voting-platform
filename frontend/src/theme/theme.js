import { createTheme } from "@mui/material/styles";
import { keyframes } from "@emotion/react";

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#c06db2",
      dark: "#a3559a",
      light: "#e3b5da",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ff2d8a",
      contrastText: "#ffffff",
    },
    success: { main: "#3dcb8e" },
    error: { main: "#e5484d" },
    text: {
      primary: "#3b1f3f",
      secondary: "#7a5a80",
    },
    background: {
      default: "#fff0f6",
      paper: "rgba(255, 255, 255, 0.85)",
    },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { minHeight: "100%" },
        body: {
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #ffaccd 0%, #fff0f6 35%, #ddcff7 65%, #ffd0e6 100%)",
          backgroundSize: "200% 200%",
          animation: `${gradientShift} 15s ease infinite`,
          backgroundAttachment: "fixed",
        },
        "#root": { minHeight: "100vh" },
        "@media (prefers-reduced-motion: reduce)": {
          body: { animation: "none" },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background:
            "linear-gradient(135deg, rgba(255, 154, 200, 0.9) 0%, rgba(200, 170, 255, 0.85) 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          color: "#3b1f3f",
          boxShadow: "none",
          borderBottom: "1px solid rgba(192, 109, 178, 0.25)",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "uppercase",
          fontWeight: 700,
          letterSpacing: "0.12em",
          padding: "6px 16px",
        },
        text: {
          "&:hover": {
            backgroundColor: "rgba(192, 109, 178, 0.12)",
          },
        },
        containedSecondary: {
          border: "2px solid #ffffff",
          boxShadow: "0 4px 14px rgba(255, 45, 138, 0.35)",
          "&:hover": {
            backgroundColor: "#e0207a",
          },
        },
      },
    },

    // 卡片：统一圆角 + 毛玻璃 + 阴影
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 32,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(192, 109, 178, 0.2)",
          boxShadow: "0 4px 20px rgba(192, 109, 178, 0.15)",
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 10,
          borderRadius: 5,
          backgroundColor: "rgba(192, 109, 178, 0.15)",
        },
        bar: {
          borderRadius: 5,
          background: "linear-gradient(90deg, #c06db2, #b8a4ff)",
        },
      },
    },
  },
});

export default theme;
