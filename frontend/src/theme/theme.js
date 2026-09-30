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
      main: "#ff2d8a", // 投票按钮、选中状态
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
    // 全局背景
    MuiCssBaseline: {
      styleOverrides: {
        html: { minHeight: "100%" },
        body: {
          minHeight: "100vh",
          // 粉 → 奶白 → 薰衣草 → 粉，4 个色标，过渡平缓不出现色带
          background:
            "linear-gradient(135deg, #fbc4da 0%, #fff0f6 35%, #e4d9f7 65%, #ffd0e6 100%)",
          backgroundSize: "200% 200%",
          // 30 秒一个循环：有流动感但不会分散注意力
          animation: `${gradientShift} 30s ease infinite`,
          backgroundAttachment: "fixed",
        },
        "#root": { minHeight: "100vh" },
        // 系统开启"减少动态效果"时，关闭背景动画
        "@media (prefers-reduced-motion: reduce)": {
          body: { animation: "none" },
        },
      },
    },

    // 毛玻璃 Navbar：浅色底 + 深色字
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(255, 240, 251, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          color: "#3b1f3f",
          boxShadow: "none",
          borderBottom: "1px solid rgba(192, 109, 178, 0.25)",
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
        },
        // 文字按钮（如导航链接）：悬停用淡粉底
        text: {
          "&:hover": {
            backgroundColor: "rgba(192, 109, 178, 0.12)",
          },
        },
        // 投票按钮：白色描边，让它从粉色背景里跳出来
        containedSecondary: {
          border: "2px solid #ffffff",
          boxShadow: "0 4px 14px rgba(255, 45, 138, 0.35)",
          "&:hover": {
            backgroundColor: "#e0207a",
          },
        },
      },
    },

    // 卡片：半透明白底，保证文字和进度条清晰
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(192, 109, 178, 0.2)",
          boxShadow: "0 4px 20px rgba(192, 109, 178, 0.15)",
        },
      },
    },

    // 票数进度条
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