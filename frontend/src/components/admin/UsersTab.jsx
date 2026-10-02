import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSnackbar } from "notistack";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const emptyForm = {
  username: "",
  email: "",
  role: "user",
  heartBalance: 0,
};

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const { user: currentUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.users);
    } catch (error) {
      console.error("LOAD USERS ERROR:", error);
      console.error("Response:", error.response);
      enqueueSnackbar("Failed to load users", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenEdit = (user) => {
    setEditingId(user._id);
    setForm({
      username: user.username,
      email: user.email,
      role: user.role,
      heartBalance: user.heartBalance,
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.username || !form.email) {
      enqueueSnackbar("Username and email are required", {
        variant: "error",
      });
      return;
    }

    if (form.heartBalance < 0) {
      enqueueSnackbar("Heart balance cannot be negative", {
        variant: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/users/${editingId}`, {
        username: form.username,
        email: form.email,
        role: form.role,
        heartBalance: parseInt(form.heartBalance, 10),
      });

      enqueueSnackbar("User updated successfully", { variant: "success" });
      handleCloseModal();
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || "Update failed";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.username}"?`)) return;

    try {
      await api.delete(`/users/${user._id}`);
      enqueueSnackbar("User deleted successfully", { variant: "success" });
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || "Delete failed";
      enqueueSnackbar(msg, { variant: "error" });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isEditingSelf = editingId === currentUser?._id;

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Users ({users.length})
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Hearts</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isSelf = user._id === currentUser?._id;
                const isAdmin = user.role === "admin";

                return (
                  <TableRow key={user._id}>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {user.username}
                      {isSelf && (
                        <Typography
                          component="span"
                          sx={{
                            ml: 1,
                            color: "text.secondary",
                            fontSize: "0.75rem",
                          }}
                        >
                          (you)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={isAdmin ? "secondary" : "default"}
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell align="right">{user.heartBalance}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEdit(user)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(user)}
                        disabled={isSelf || isAdmin}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit User</DialogTitle>

        <DialogContent>
          <TextField
            label="Username"
            fullWidth
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            sx={{ mt: 1, mb: 2 }}
          />

          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            select
            label="Role"
            fullWidth
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            disabled={isEditingSelf}
            helperText={isEditingSelf ? "You cannot change your own role" : ""}
            sx={{ mb: 2 }}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>

          <TextField
            label="Heart Balance"
            type="number"
            fullWidth
            value={form.heartBalance}
            onChange={(e) => setForm({ ...form, heartBalance: e.target.value })}
            slotProps={{ htmlInput: { min: 0 } }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersTab;
