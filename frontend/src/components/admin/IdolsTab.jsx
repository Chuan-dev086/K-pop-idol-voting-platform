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
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";
import api from "../../services/api";

const emptyForm = {
  name: "",
  category: "",
  agencyId: "",
  avatarUrl: "",
};

const IdolsTab = () => {
  const [idols, setIdols] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const fetchData = useCallback(async () => {
    try {
      const [idolsRes, agenciesRes] = await Promise.all([
        api.get("/idols"),
        api.get("/agencies"),
      ]);
      setIdols(idolsRes.data.idols);
      setAgencies(agenciesRes.data.agencies);
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

  const handleOpenEdit = (idol) => {
    setEditingId(idol._id);
    setForm({
      name: idol.name,
      category: idol.category,
      agencyId: idol.agencyId?._id || "",
      avatarUrl: idol.avatarUrl || "",
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.agencyId) {
      enqueueSnackbar("Please fill in all required fields", {
        variant: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/idols/${editingId}`, form);
        enqueueSnackbar("Idol updated successfully", { variant: "success" });
      } else {
        await api.post("/idols", form);
        enqueueSnackbar("Idol created successfully", { variant: "success" });
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

  const handleDelete = async (idol) => {
    if (!window.confirm(`Delete "${idol.name}"?`)) return;

    try {
      await api.delete(`/idols/${idol._id}`);
      enqueueSnackbar("Idol deleted successfully", { variant: "success" });
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
          Idols ({idols.length})
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
        >
          Add Idol
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Agency</TableCell>
              <TableCell align="right">Total Votes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {idols.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No idols found
                </TableCell>
              </TableRow>
            ) : (
              idols.map((idol) => (
                <TableRow key={idol._id}>
                  <TableCell sx={{ fontWeight: 500 }}>{idol.name}</TableCell>
                  <TableCell>{idol.category}</TableCell>
                  <TableCell>{idol.agencyId?.name || "—"}</TableCell>
                  <TableCell align="right">{idol.totalVotes}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenEdit(idol)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(idol)}
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
        <DialogTitle>{editingId ? "Edit Idol" : "Add Idol"}</DialogTitle>

        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            sx={{ mt: 1, mb: 2 }}
          />

          <TextField
            select
            label="Category"
            fullWidth
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="Boy Group">Boy Group</MenuItem>
            <MenuItem value="Girl Group">Girl Group</MenuItem>
            <MenuItem value="Soloist">Soloist</MenuItem>
          </TextField>

          <TextField
            select
            label="Agency"
            fullWidth
            required
            value={form.agencyId}
            onChange={(e) => setForm({ ...form, agencyId: e.target.value })}
            sx={{ mb: 2 }}
          >
            {agencies.map((agency) => (
              <MenuItem key={agency._id} value={agency._id}>
                {agency.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Avatar URL"
            fullWidth
            value={form.avatarUrl}
            onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
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
            {submitting ? "Saving..." : editingId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IdolsTab;
