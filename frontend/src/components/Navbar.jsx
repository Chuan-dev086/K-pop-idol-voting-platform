import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../context/AuthContext";

// links shown to everyone, shared by the desktop menu and the mobile drawer
const navLinks = [
  { label: "Polls", to: "/polls" },
  { label: "Idols", to: "/idols" },
];

const Navbar = () => {
  // global auth state: current user and logout function
  const { user, logout } = useAuth();
  // returns a function for programmatic navigation
  const navigate = useNavigate();

  // controls the mobile drawer; closed by default
  const [drawerOpen, setDrawerOpen] = useState(false);

  // returns a handler that sets the drawer open (true) or closed (false)
  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  // log out, close the drawer, and go back to the home page
  const handleLogout = () => {
    logout();
    setDrawerOpen(false);
    navigate("/");
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        {/* Logo */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            textDecoration: "none",
            color: "inherit",
            fontWeight: "bold",
            flexGrow: 1,
          }}
        >
          Idol Vote Hub
        </Typography>

        {/* desktop menu: hidden on small screens */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
          {navLinks.map((link) => (
            <Button key={link.to} color="inherit" component={Link} to={link.to}>
              {link.label}
            </Button>
          ))}

          {user ? (
            <>
              {/* only admins see the admin panel */}
              {user.role === "admin" && (
                <Button color="inherit" component={Link} to="/admin">
                  Admin Panel
                </Button>
              )}
              <Button color="inherit" component={Link} to="/profile">
                {user.username}
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>

        {/* mobile menu button: hidden on large screens */}
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton color="inherit" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
        </Box>

        {/* right-side drawer for the mobile menu */}
        <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
          {/* clicking anywhere inside closes the drawer (click bubbles up) */}
          <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer(false)}
          >
            <List>
              {navLinks.map((link) => (
                <ListItemButton key={link.to} component={Link} to={link.to}>
                  <ListItemText primary={link.label} />
                </ListItemButton>
              ))}
            </List>

            <Divider />

            <List>
              {user ? (
                <>
                  {user.role === "admin" && (
                    <ListItemButton component={Link} to="/admin">
                      <ListItemText primary="Admin Panel" />
                    </ListItemButton>
                  )}
                  <ListItemButton component={Link} to="/profile">
                    <ListItemText primary={user.username} />
                  </ListItemButton>
                  <ListItemButton onClick={handleLogout}>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </>
              ) : (
                <>
                  <ListItemButton component={Link} to="/login">
                    <ListItemText primary="Login" />
                  </ListItemButton>
                  <ListItemButton component={Link} to="/register">
                    <ListItemText primary="Register" />
                  </ListItemButton>
                </>
              )}
            </List>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
