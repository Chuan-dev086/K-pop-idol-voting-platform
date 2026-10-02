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
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useSnackbar } from "notistack";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const emptyForm = {
  username: "",
  email: "",
  role: "user",
};

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [giveHeartsOpen, setGiveHeartsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [giveAmount, setGiveAmount] = useState(50);
  const [giving, setGiving] = useState(false);

  const { user: currentUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.users);
    } catch {
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

    setSubmitting(true);
    try {
      await api.put(`/users/${editingId}`, {
        username: form.username,
        email: form.email,
        role: form.role,
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

  const handleOpenGiveHearts = (user) => {
    setSelectedUser(user);
    setGiveAmount(50);
    setGiveHeartsOpen(true);
  };

  const handleCloseGiveHearts = () => {
    setGiveHeartsOpen(false);
    setSelectedUser(null);
  };

  const handleGiveHearts = async () => {
    const amount = parseInt(giveAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      enqueueSnackbar("Amount must be a positive number", {
        variant: "error",
      });
      return;
    }

    setGiving(true);
    try {
      await api.post(`/users/${selectedUser._id}/give-hearts`, { amount });
      enqueueSnackbar(`Gave ${amount} hearts to ${selectedUser.username}`, {
        variant: "success",
      });
      handleCloseGiveHearts();
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || "Give hearts failed";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setGiving(false);
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

                      {!isAdmin && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleOpenGiveHearts(user)}
                          title="Give Hearts"
                        >
                          <FavoriteIcon />
                        </IconButton>
                      )}

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

      {/* Edit User Modal */}
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
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
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

      {/* Give Hearts Modal */}
      <Dialog
        open={giveHeartsOpen}
        onClose={handleCloseGiveHearts}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Give Hearts</DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            To: <strong>{selectedUser?.username}</strong>
            <br />
            Current: <strong>{selectedUser?.heartBalance}</strong> hearts
          </Typography>

          <TextField
            label="Amount"
            type="number"
            fullWidth
            value={giveAmount}
            onChange={(e) => setGiveAmount(e.target.value)}
            slotProps={{ htmlInput: { min: 1 } }}
            helperText="Positive number of hearts to add"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseGiveHearts}>Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleGiveHearts}
            disabled={giving}
          >
            {giving ? "Giving..." : "Give"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersTab;
