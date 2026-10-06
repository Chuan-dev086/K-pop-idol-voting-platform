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

// Default values for the edit user form
const emptyForm = {
  username: "",
  email: "",
  role: "user",
};

const UsersTab = () => {
  // Store the list of users retrieved from the API
  const [users, setUsers] = useState([]);

  // Control the loading state while fetching users
  const [loading, setLoading] = useState(true);

  // Control the visibility of the edit user dialog
  const [openModal, setOpenModal] = useState(false);

  // Store the ID of the user currently being edited
  const [editingId, setEditingId] = useState(null);

  // Store the values entered in the edit user form
  const [form, setForm] = useState(emptyForm);

  // Control the submit button loading state
  const [submitting, setSubmitting] = useState(false);

  // Control the visibility of the give hearts dialog
  const [giveHeartsOpen, setGiveHeartsOpen] = useState(false);

  // Store the selected user who will receive the hearts
  const [selectedUser, setSelectedUser] = useState(null);

  // Store the number of hearts to give
  const [giveAmount, setGiveAmount] = useState(50);

  // Control the give hearts button loading state
  const [giving, setGiving] = useState(false);

  // Get the currently logged-in user from the authentication context
  const { user: currentUser } = useAuth();

  // Snackbar is used to display success and error messages
  const { enqueueSnackbar } = useSnackbar();

  /**
   * Fetch all users from the backend API.
   */
  const fetchData = useCallback(async () => {
    try {
      const res = await api.get("/users");

      // Store the users returned by the API
      setUsers(res.data.users);
    } catch {
      // Display an error message when the request fails
      enqueueSnackbar("Failed to load users", {
        variant: "error",
      });
    } finally {
      // Hide the loading indicator after the request finishes
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  /**
   * Load users when the component is first rendered.
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Open the edit dialog and populate the form
   * with the selected user's information.
   */
  const handleOpenEdit = (user) => {
    setEditingId(user._id);

    setForm({
      username: user.username,
      email: user.email,
      role: user.role,
    });

    setOpenModal(true);
  };

  /**
   * Close the edit dialog and reset the form.
   */
  const handleCloseModal = () => {
    setOpenModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  /**
   * Validate and submit the user update form.
   */
  const handleSubmit = async () => {
    // Make sure the required fields are not empty
    if (!form.username || !form.email) {
      enqueueSnackbar("Username and email are required", {
        variant: "error",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Send the updated user information to the backend
      await api.put(`/users/${editingId}`, {
        username: form.username,
        email: form.email,
        role: form.role,
      });

      enqueueSnackbar("User updated successfully", {
        variant: "success",
      });

      // Close the dialog and refresh the user list
      handleCloseModal();
      fetchData();
    } catch (error) {
      // Use the backend error message when available
      const msg = error.response?.data?.message || "Update failed";

      enqueueSnackbar(msg, {
        variant: "error",
      });
    } finally {
      // Re-enable the submit button
      setSubmitting(false);
    }
  };

  /**
   * Delete a user after asking for confirmation.
   */
  const handleDelete = async (user) => {
    // Ask the administrator to confirm the delete action
    if (!window.confirm(`Delete user "${user.username}"?`)) {
      return;
    }

    try {
      // Delete the selected user
      await api.delete(`/users/${user._id}`);

      enqueueSnackbar("User deleted successfully", {
        variant: "success",
      });

      // Refresh the user list after deletion
      fetchData();
    } catch (error) {
      // Display the backend error message when available
      const msg = error.response?.data?.message || "Delete failed";

      enqueueSnackbar(msg, {
        variant: "error",
      });
    }
  };

  /**
   * Open the give hearts dialog for a selected user.
   */
  const handleOpenGiveHearts = (user) => {
    setSelectedUser(user);

    // Reset the default amount every time the dialog opens
    setGiveAmount(50);
    setGiveHeartsOpen(true);
  };

  /**
   * Close the give hearts dialog and clear the selected user.
   */
  const handleCloseGiveHearts = () => {
    setGiveHeartsOpen(false);
    setSelectedUser(null);
  };

  /**
   * Validate and submit the give hearts request.
   */
  const handleGiveHearts = async () => {
    // Convert the input value from a string into an integer
    const amount = parseInt(giveAmount, 10);

    // Make sure the amount is a positive number
    if (isNaN(amount) || amount <= 0) {
      enqueueSnackbar("Amount must be a positive number", {
        variant: "error",
      });
      return;
    }

    setGiving(true);

    try {
      // Send a request to add hearts to the selected user's balance
      await api.post(`/users/${selectedUser._id}/give-hearts`, {
        amount,
      });

      enqueueSnackbar(`Gave ${amount} hearts to ${selectedUser.username}`, {
        variant: "success",
      });

      // Close the dialog and refresh the user list
      handleCloseGiveHearts();
      fetchData();
    } catch (error) {
      // Display the backend error message when available
      const msg = error.response?.data?.message || "Give hearts failed";

      enqueueSnackbar(msg, {
        variant: "error",
      });
    } finally {
      // Re-enable the give hearts button
      setGiving(false);
    }
  };

  // Display a loading spinner while users are being fetched
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 6,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Check whether the currently edited user is the logged-in user
  const isEditingSelf = editingId === currentUser?._id;

  return (
    <Box>
      {/* Page heading showing the total number of users */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Users ({users.length})
        </Typography>
      </Box>

      {/* Users table */}
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
              // Display an empty state when no users are found
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                // Check whether this row belongs to the logged-in user
                const isSelf = user._id === currentUser?._id;

                // Check whether the user has administrator privileges
                const isAdmin = user.role === "admin";

                return (
                  <TableRow key={user._id}>
                    {/* Username column */}
                    <TableCell sx={{ fontWeight: 500 }}>
                      {user.username}

                      {/* Mark the currently logged-in user */}
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

                    {/* Email column */}
                    <TableCell>{user.email}</TableCell>

                    {/* Role column */}
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={isAdmin ? "secondary" : "default"}
                        sx={{
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>

                    {/* Heart balance column */}
                    <TableCell align="right">{user.heartBalance}</TableCell>

                    {/* User action buttons */}
                    <TableCell align="right">
                      {/* Open the edit user dialog */}
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEdit(user)}
                        title="Edit User"
                      >
                        <EditIcon />
                      </IconButton>

                      {/* Only non-admin users can receive hearts */}
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

                      {/* Admins and the current user cannot be deleted */}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(user)}
                        disabled={isSelf || isAdmin}
                        title="Delete User"
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
          {/* Username input */}
          <TextField
            label="Username"
            fullWidth
            required
            value={form.username}
            onChange={(e) =>
              setForm({
                ...form,
                username: e.target.value,
              })
            }
            sx={{ mt: 1, mb: 2 }}
          />

          {/* Email input */}
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            sx={{ mb: 2 }}
          />

          {/* Role selection input */}
          <TextField
            select
            label="Role"
            fullWidth
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value,
              })
            }
            // Prevent administrators from changing their own role
            disabled={isEditingSelf}
            helperText={isEditingSelf ? "You cannot change your own role" : ""}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
        </DialogContent>

        <DialogActions>
          {/* Close the dialog without saving changes */}
          <Button onClick={handleCloseModal}>Cancel</Button>

          {/* Submit the updated user information */}
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
          {/* Display the selected user's name and current heart balance */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            To: <strong>{selectedUser?.username}</strong>
            <br />
            Current: <strong>{selectedUser?.heartBalance}</strong> hearts
          </Typography>

          {/* Input for the number of hearts to add */}
          <TextField
            label="Amount"
            type="number"
            fullWidth
            value={giveAmount}
            onChange={(e) => setGiveAmount(e.target.value)}
            slotProps={{
              htmlInput: {
                min: 1,
              },
            }}
            helperText="Positive number of hearts to add"
          />
        </DialogContent>

        <DialogActions>
          {/* Close the dialog without giving hearts */}
          <Button onClick={handleCloseGiveHearts}>Cancel</Button>

          {/* Submit the give hearts request */}
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
