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
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import api from "../../services/api";

// Default values for the poll form
const emptyForm = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  candidateIds: [],
};

// Styling configuration for each poll status
const statusStyles = {
  active: {
    bgcolor: "#3dcb8e",
    color: "#ffffff",
  },
  upcoming: {
    bgcolor: "#c06db2",
    color: "#ffffff",
  },
  ended: {
    bgcolor: "#b0a0b5",
    color: "#ffffff",
  },
};

const PollsTab = () => {
  // Store the list of polls and idols fetched from the API
  const [polls, setPolls] = useState([]);
  const [idols, setIdols] = useState([]);

  // Control the loading state while fetching data
  const [loading, setLoading] = useState(true);

  // Control whether the poll form dialog is open
  const [openModal, setOpenModal] = useState(false);

  // Store the ID of the poll currently being edited
  const [editingId, setEditingId] = useState(null);

  // Store the ID of the original poll being duplicated
  const [duplicatingFrom, setDuplicatingFrom] = useState(null);

  // Store the current poll form values
  const [form, setForm] = useState(emptyForm);

  // Control the submit button state while submitting the form
  const [submitting, setSubmitting] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  /**
   * Fetch polls and idols from the API.
   *
   * useCallback keeps the same function reference between renders
   * so it can safely be used as a dependency of useEffect.
   */
  const fetchData = useCallback(async () => {
    try {
      // Fetch polls and idols at the same time
      const [pollsRes, idolsRes] = await Promise.all([
        api.get("/polls"),
        api.get("/idols"),
      ]);

      // Store the fetched polls and idols in component state
      setPolls(pollsRes.data.polls);
      setIdols(idolsRes.data.idols);
    } catch {
      // Display an error notification if the request fails
      enqueueSnackbar("Failed to load data", {
        variant: "error",
      });
    } finally {
      // Stop the loading state after the request completes
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  /**
   * Fetch poll and idol data when the component is mounted.
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Open the dialog in create mode.
   */
  const handleOpenAdd = () => {
    setEditingId(null);
    setDuplicatingFrom(null);
    setForm(emptyForm);
    setOpenModal(true);
  };

  /**
   * Open the dialog in edit mode and fill the form
   * with the selected poll's existing data.
   */
  const handleOpenEdit = (poll) => {
    setEditingId(poll._id);
    setDuplicatingFrom(null);

    setForm({
      title: poll.title,
      description: poll.description || "",

      // Convert the date into the format required by the date input
      startDate: dayjs(poll.startDate).format("YYYY-MM-DD"),
      endDate: dayjs(poll.endDate).format("YYYY-MM-DD"),

      // Extract idol IDs from the poll candidates
      candidateIds: poll.candidates.map(
        (candidate) => candidate.idolId?._id || candidate.idolId,
      ),
    });

    setOpenModal(true);
  };

  /**
   * Open the dialog in duplicate mode.
   *
   * The duplicated poll receives a new title and default dates.
   */
  const handleOpenDuplicate = (poll) => {
    setEditingId(null);
    setDuplicatingFrom(poll._id);

    setForm({
      title: `${poll.title} (Copy)`,
      description: poll.description || "",

      // Set the duplicated poll to start tomorrow
      startDate: dayjs().add(1, "day").format("YYYY-MM-DD"),

      // Set the default end date to 31 days from today
      endDate: dayjs().add(31, "day").format("YYYY-MM-DD"),

      // Copy the candidates from the original poll
      candidateIds: poll.candidates.map(
        (candidate) => candidate.idolId?._id || candidate.idolId,
      ),
    });

    setOpenModal(true);
  };

  /**
   * Close the dialog and reset the form and mode states.
   */
  const handleCloseModal = () => {
    setOpenModal(false);
    setForm(emptyForm);
    setEditingId(null);
    setDuplicatingFrom(null);
  };

  /**
   * Validate and submit the poll form.
   */
  const handleSubmit = async () => {
    // Validate the poll title
    if (!form.title.trim()) {
      enqueueSnackbar("Title is required", {
        variant: "error",
      });
      return;
    }

    // Validate the date fields
    if (!form.startDate || !form.endDate) {
      enqueueSnackbar("Both start and end dates are required", {
        variant: "error",
      });
      return;
    }

    // Make sure the start date is earlier than the end date
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      enqueueSnackbar("Start date must be before end date", {
        variant: "error",
      });
      return;
    }

    // Ensure that at least one candidate has been selected
    if (form.candidateIds.length === 0) {
      enqueueSnackbar("Please select at least one candidate", {
        variant: "error",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Convert the form data into the format expected by the API
      const payload = {
        title: form.title,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
        candidates: form.candidateIds.map((id) => ({
          idolId: id,
        })),
      };

      if (editingId) {
        // Update an existing poll
        await api.put(`/polls/${editingId}`, payload);

        enqueueSnackbar("Poll updated successfully", {
          variant: "success",
        });
      } else {
        // Create a new poll or create a duplicate
        await api.post("/polls", payload);

        enqueueSnackbar(
          duplicatingFrom
            ? "Poll duplicated successfully"
            : "Poll created successfully",
          {
            variant: "success",
          },
        );
      }

      // Close the dialog and refresh the data
      handleCloseModal();
      fetchData();
    } catch (error) {
      // Display the backend error message when available
      const msg = error.response?.data?.message || "Operation failed";

      enqueueSnackbar(msg, {
        variant: "error",
      });
    } finally {
      // Reset the submitting state
      setSubmitting(false);
    }
  };

  /**
   * Delete a poll after user confirmation.
   */
  const handleDelete = async (poll) => {
    // Ask the user to confirm the delete action
    if (!window.confirm(`Delete poll "${poll.title}"?`)) {
      return;
    }

    try {
      // Delete the selected poll
      await api.delete(`/polls/${poll._id}`);

      enqueueSnackbar("Poll deleted successfully", {
        variant: "success",
      });

      // Refresh the data after deletion
      fetchData();
    } catch (error) {
      // Display the backend error message when available
      const msg = error.response?.data?.message || "Delete failed";

      enqueueSnackbar(msg, {
        variant: "error",
      });
    }
  };

  // Display a loading spinner while the initial data is being fetched
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

  /**
   * Determine the dialog title based on the current mode.
   */
  const modalTitle = editingId
    ? "Edit Poll"
    : duplicatingFrom
      ? "Duplicate Poll"
      : "Add Poll";

  return (
    <Box>
      {/* Header section containing the page title and add button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Polls ({polls.length})
        </Typography>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
        >
          Add Poll
        </Button>
      </Box>

      {/* Polls table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell align="right">Candidates</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {polls.length === 0 ? (
              // Display an empty state when there are no polls
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No polls found
                </TableCell>
              </TableRow>
            ) : (
              // Render each poll as a table row
              polls.map((poll) => (
                <TableRow key={poll._id}>
                  <TableCell sx={{ fontWeight: 500 }}>{poll.title}</TableCell>

                  <TableCell>
                    <Chip
                      label={poll.status}
                      size="small"
                      sx={{
                        ...statusStyles[poll.status],
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    {dayjs(poll.startDate).format("MMM D, YYYY")}
                  </TableCell>

                  <TableCell>
                    {dayjs(poll.endDate).format("MMM D, YYYY")}
                  </TableCell>

                  <TableCell align="right">{poll.candidates.length}</TableCell>

                  {/* Action buttons for editing, duplicating, and deleting */}
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenEdit(poll)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleOpenDuplicate(poll)}
                      title="Duplicate"
                    >
                      <ContentCopyIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(poll)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog used for adding, editing, and duplicating polls */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{modalTitle}</DialogTitle>

        <DialogContent>
          {/* Poll title input */}
          <TextField
            label="Title"
            fullWidth
            required
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            sx={{ mt: 1, mb: 2 }}
          />

          {/* Poll description input */}
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            sx={{ mb: 2 }}
          />

          {/* Start and end date inputs */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 2,
            }}
          >
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              required
              value={form.startDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  startDate: e.target.value,
                })
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            <TextField
              label="End Date"
              type="date"
              fullWidth
              required
              value={form.endDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  endDate: e.target.value,
                })
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Box>

          {/* Multiple-selection input for poll candidates */}
          <TextField
            select
            label="Candidates"
            fullWidth
            required
            value={form.candidateIds}
            onChange={(e) =>
              setForm({
                ...form,
                candidateIds:
                  typeof e.target.value === "string"
                    ? e.target.value.split(",")
                    : e.target.value,
              })
            }
            slotProps={{
              select: {
                multiple: true,

                // Convert selected idol IDs into readable idol names
                renderValue: (selected) =>
                  selected
                    .map((id) => idols.find((idol) => idol._id === id)?.name)
                    .filter(Boolean)
                    .join(", "),
              },
            }}
          >
            {idols.map((idol) => (
              <MenuItem key={idol._id} value={idol._id}>
                {idol.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>

        <DialogActions>
          {/* Close the dialog without saving the form */}
          <Button onClick={handleCloseModal}>Cancel</Button>

          {/* Submit button changes its label based on the current mode */}
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? "Saving..."
              : editingId
                ? "Update"
                : duplicatingFrom
                  ? "Create Copy"
                  : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PollsTab;
