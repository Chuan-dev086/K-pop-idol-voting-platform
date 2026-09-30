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

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

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

        {/* ========== 桌面版 ========== */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
          <Button color="inherit" component={Link} to="/polls">
            Polls
          </Button>
          <Button color="inherit" component={Link} to="/idols">
            Idols
          </Button>

          {user ? (
            <>
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

        {/* ========== 移动版：汉堡按钮 ========== */}
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton color="inherit" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
        </Box>

        {/* ========== Drawer ========== */}
        <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
          <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer(false)}
          >
            <List>
              <ListItemButton component={Link} to="/polls">
                <ListItemText primary="Polls" />
              </ListItemButton>
              <ListItemButton component={Link} to="/idols">
                <ListItemText primary="Idols" />
              </ListItemButton>
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
