// Import createTheme to create a custom Material UI theme
import { createTheme } from "@mui/material/styles";

// Import keyframes from Emotion for creating CSS animations
import { keyframes } from "@emotion/react";

// Define an animated background gradient
// The background position moves from left to right and then back again
const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
`;

// Create the global Material UI theme
const theme = createTheme({
  // Define the global color palette used throughout the application
  palette: {
    // Use light mode as the default application color mode
    mode: "light",

    // Primary color palette
    // Used by components with color="primary"
    primary: {
      main: "#af1696",
      dark: "#8a0f77",
      light: "#e3b5da",
      contrastText: "#ffffff",
    },

    // Secondary color palette
    // Used by components with color="secondary"
    secondary: {
      main: "#ff2d8a",
      contrastText: "#ffffff",
    },

    // Global success color
    // Used by success messages, Snackbar alerts, and related UI states
    success: {
      main: "#3dcb8e",
    },

    // Global error color
    // Used by error messages, Snackbar alerts, and validation states
    error: {
      main: "#e5484d",
    },

    // Default text colors used by Typography and other MUI components
    text: {
      primary: "#3b1f3f",
      secondary: "#7a5a80",
    },

    // Global application background colors
    background: {
      // Default background used by the application body
      default: "#fff0f6",

      // Background used by paper-based components such as Card and Dialog
      // The alpha value creates a semi-transparent glass effect
      paper: "rgba(255, 255, 255, 0.85)",
    },
  },

  // Define the default border radius used by supported MUI components
  shape: {
    borderRadius: 16,
  },

  // Define the global typography settings
  typography: {
    // Use Roboto first, then use fallback fonts if Roboto is unavailable
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },

  // Override default styles for specific Material UI components
  components: {
    // Global CSS baseline styles
    // These styles apply to html, body, #root, and media queries
    MuiCssBaseline: {
      styleOverrides: {
        // Make the html element fill the available page height
        html: {
          minHeight: "100%",
        },

        // Apply the animated gradient background to the entire page
        body: {
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #ffaccd 0%, #fff0f6 35%, #ddcff7 65%, #ffd0e6 100%)",

          // Make the background larger so the gradient can move during animation
          backgroundSize: "200% 200%",

          // Apply the Emotion keyframes animation
          animation: `${gradientShift} 15s ease infinite`,

          // Keep the background fixed while the page content scrolls
          backgroundAttachment: "fixed",
        },

        // Ensure the React root element fills the full viewport height
        "#root": {
          minHeight: "100vh",
        },

        // Disable the moving background for users who prefer reduced motion
        // This improves accessibility for users sensitive to animations
        "@media (prefers-reduced-motion: reduce)": {
          body: {
            animation: "none",
          },
        },
      },
    },

    // Customize the global AppBar/navbar appearance
    MuiAppBar: {
      styleOverrides: {
        root: {
          // Use a semi-transparent pink and purple gradient background
          background:
            "linear-gradient(135deg, rgba(255, 154, 200, 0.9) 0%, rgba(200, 170, 255, 0.85) 100%)",

          // Add a glassmorphism blur effect behind the AppBar
          backdropFilter: "blur(12px)",

          // Safari-compatible version of backdropFilter
          WebkitBackdropFilter: "blur(12px)",

          // Set the text color used inside the AppBar
          color: "#3b1f3f",

          // Remove MUI's default AppBar shadow
          boxShadow: "none",

          // Add a subtle border at the bottom of the navigation bar
          borderBottom: "1px solid rgba(192, 109, 178, 0.25)",
        },
      },
    },

    // Customize the global Button styles
    MuiButton: {
      styleOverrides: {
        // Styles applied to every MUI Button
        root: {
          // Display button labels in uppercase
          textTransform: "uppercase",

          // Make button text bold
          fontWeight: 700,

          // Add spacing between letters for a stronger visual style
          letterSpacing: "0.12em",

          // Set the default vertical and horizontal button padding
          padding: "6px 16px",
        },

        // Styles applied only to text variant buttons
        text: {
          // Add a subtle pink background when hovering over text buttons
          "&:hover": {
            backgroundColor: "rgba(192, 109, 178, 0.12)",
          },
        },

        // Styles applied only to contained secondary buttons
        containedSecondary: {
          // Add a white outline around secondary contained buttons
          border: "2px solid #ffffff",

          // Add a pink glow around the button
          boxShadow: "0 4px 14px rgba(255, 45, 138, 0.35)",

          // Darken the background slightly when the user hovers over the button
          "&:hover": {
            backgroundColor: "#e0207a",
          },
        },
      },
    },

    // Global Card styles:
    // Apply rounded corners, glassmorphism blur, border, and shadow
    MuiCard: {
      styleOverrides: {
        root: {
          // Use larger rounded corners for a soft K-pop-inspired design
          borderRadius: 32,
          // customized the backgroud color for every card
          backgroundColor: "rgba(255, 240, 246, 0.75)",

          // Add blur behind semi-transparent card backgrounds
          backdropFilter: "blur(8px)",

          // Safari-compatible version of backdropFilter
          WebkitBackdropFilter: "blur(8px)",

          // Add a subtle pink border around cards
          border: "1px solid rgba(192, 109, 178, 0.2)",

          // Add a soft pink shadow for depth
          boxShadow: "0 4px 20px rgba(192, 109, 178, 0.15)",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          // Use a soft pink color to match the application's overall theme
          backgroundColor: "rgba(255, 245, 250, 0.9)", 
        },
      },
    },
    // ============================================
    // NEW: Global Select styles
    // Ensures the selected value text always uses
    // the dark purple color, overriding any internal
    // Webkit text fill color or opacity set by MUI.
    // ============================================
    MuiSelect: {
      styleOverrides: {
        select: {
          color: "#3b1f3f !important",
          WebkitTextFillColor: "#3b1f3f !important",
          opacity: "1 !important",
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "rgba(192, 109, 178, 0.15)",
          },
          "&.Mui-selected": {
            backgroundColor: "rgba(192, 109, 178, 0.25)",
            "&:hover": {
              backgroundColor: "rgba(192, 109, 178, 0.35)",
            },
          },
        },
      },
    },

    // Customize the global LinearProgress appearance
    MuiLinearProgress: {
      styleOverrides: {
        // Styles for the progress bar container
        root: {
          // Set a thicker progress bar height
          height: 10,

          // Round the outer progress bar corners
          borderRadius: 5,

          // Use a light pink background for the unfilled portion
          backgroundColor: "rgba(192, 109, 178, 0.15)",
        },

        // Styles for the filled progress bar section
        bar: {
          // Round the filled bar corners
          borderRadius: 5,

          // Use a pink-to-purple gradient for the filled progress amount
          background: "linear-gradient(90deg, #c06db2, #b8a4ff)",
        },
      },
    },
  },
});

// Export the theme so it can be used by ThemeProvider in main.jsx or App.jsx
export default theme;
