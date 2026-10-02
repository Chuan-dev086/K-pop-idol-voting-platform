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
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import api from "../../services/api";

const emptyForm = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  candidateIds: [],
};

const statusStyles = {
  active: { bgcolor: "#3dcb8e", color: "#ffffff" },
  upcoming: { bgcolor: "#c06db2", color: "#ffffff" },
  ended: { bgcolor: "#b0a0b5", color: "#ffffff" },
};

const PollsTab = () => {
  const [polls, setPolls] = useState([]);
  const [idols, setIdols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const fetchData = useCallback(async () => {
    try {
      const [pollsRes, idolsRes] = await Promise.all([
        api.get("/polls"),
        api.get("/idols"),
      ]);
      setPolls(pollsRes.data.polls);
      setIdols(idolsRes.data.idols);
    } catch {
      enqueueSnackbar("Failed to load data", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpenModal(true);
  };

  const handleOpenEdit = (poll) => {
    setEditingId(poll._id);
    setForm({
      title: poll.title,
      description: poll.description || "",
      startDate: dayjs(poll.startDate).format("YYYY-MM-DD"),
      endDate: dayjs(poll.endDate).format("YYYY-MM-DD"),
      candidateIds: poll.candidates.map((c) => c.idolId?._id || c.idolId),
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      enqueueSnackbar("Title is required", { variant: "error" });
      return;
    }

    if (!form.startDate || !form.endDate) {
      enqueueSnackbar("Both start and end dates are required", {
        variant: "error",
      });
      return;
    }

    if (new Date(form.startDate) >= new Date(form.endDate)) {
      enqueueSnackbar("Start date must be before end date", {
        variant: "error",
      });
      return;
    }

    if (form.candidateIds.length === 0) {
      enqueueSnackbar("Please select at least one candidate", {
        variant: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
        candidates: form.candidateIds.map((id) => ({ idolId: id })),
      };

      if (editingId) {
        await api.put(`/polls/${editingId}`, payload);
        enqueueSnackbar("Poll updated successfully", { variant: "success" });
      } else {
        await api.post("/polls", payload);
        enqueueSnackbar("Poll created successfully", { variant: "success" });
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || "Operation failed";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (poll) => {
    if (!window.confirm(`Delete poll "${poll.title}"?`)) return;

    try {
      await api.delete(`/polls/${poll._id}`);
      enqueueSnackbar("Poll deleted successfully", { variant: "success" });
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

  return (
    <Box>
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
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No polls found
                </TableCell>
              </TableRow>
            ) : (
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
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenEdit(poll)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(poll)}
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

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editingId ? "Edit Poll" : "Add Poll"}</DialogTitle>

        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            sx={{ mt: 1, mb: 2 }}
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              required
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>

          <TextField
            select
            label="Candidates"
            fullWidth
            required
            value={form.candidateIds}
            onChange={(e) => setForm({ ...form, candidateIds: e.target.value })}
            slotProps={{
              select: {
                multiple: true,
                renderValue: (selected) =>
                  selected
                    .map((id) => idols.find((i) => i._id === id)?.name)
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
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Saving..." : editingId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PollsTab;
