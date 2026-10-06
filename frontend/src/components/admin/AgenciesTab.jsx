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

// set the form become empty form
const emptyForm = {
  name: "",
  country: "",
  foundedYear: "",
};

// list the dropdown value
const COUNTRIES = ["South Korea", "United States", "Japan", "China", "Other"];

const AgenciesTab = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  // there is a function for fetch data it will run at the time when page first open
  // useCallback is to memorize the state and prevent rerendering again
  // this function fetch the data from backend
  const fetchData = useCallback(async () => {
    try {
      const res = await api.get("/agencies");
      setAgencies(res.data.agencies);
    } catch {
      enqueueSnackbar("Failed to load agencies", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  // call the fetch data function
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // add agencies function when click the add button will open the form and clear the form input set the editngId become null to know that it is add
  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpenModal(true);
  };

  // if user click edit button will set editngId become the id send in and get the info to put in edit form and open the form
  // if have agency value then use it if don't have just leave it empty
  //  || means OR operator
  const handleOpenEdit = (agency) => {
    setEditingId(agency._id);
    setForm({
      name: agency.name,
      country: agency.country || "",
      foundedYear: agency.foundedYear || "",
    });
    setOpenModal(true);
  };

  // when close the form will empty the form and editngId
  const handleCloseModal = () => {
    setOpenModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  // the validation function when form is submit
  const handleSubmit = async () => {
    // name is required
    if (!form.name.trim()) {
      enqueueSnackbar("Name is required", { variant: "error" });
      return;
    }

    // founded year range
    if (form.foundedYear) {
      // get the current year
      const currentYear = new Date().getFullYear();
      // convert the input value to integer/number in the base-10 format
      const year = parseInt(form.foundedYear, 10);

      // check the year value with check if it is number or not and the range must between 1900 and current year if everything is OK then it will return
      if (isNaN(year) || year < 1900 || year > currentYear) {
        enqueueSnackbar(`Year must be between 1900 and ${currentYear}`, {
          variant: "error",
        });
        return;
      }
    }

    // when pass the validation will disabled the submit button
    setSubmitting(true);
    try {
      // the payload is the data will send to backend
      // will convert the foundedyear from string to number
      const payload = {
        name: form.name,
        country: form.country,
        foundedYear: form.foundedYear
          ? parseInt(form.foundedYear, 10)
          : undefined,
      };

      // if have editngId will run api.put request and update agency if not will create agency
      if (editingId) {
        await api.put(`/agencies/${editingId}`, payload);
        enqueueSnackbar("Agency updated successfully", { variant: "success" });
      } else {
        await api.post("/agencies", payload);
        enqueueSnackbar("Agency created successfully", { variant: "success" });
      }

      // when successfully create or updated will close the form and directly get the data from backend
      handleCloseModal();
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || "Operation failed";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // delete agency function will pop out alert let user confirm the delete if user click cancel will return and stop the delete function 
  const handleDelete = async (agency) => {
    if (!window.confirm(`Delete "${agency.name}"?`)) return;

    // if user click confirm will run api.delete to delete the agency in  backend 
    try {
      await api.delete(`/agencies/${agency._id}`);
      enqueueSnackbar("Agency deleted successfully", { variant: "success" });
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || "Delete failed";
      enqueueSnackbar(msg, { variant: "error" });
    }
  };
// the loading UI 
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
          Agencies ({agencies.length})
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
        >
          Add Agency
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Country</TableCell>
              <TableCell align="right">Founded Year</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agencies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No agencies found
                </TableCell>
              </TableRow>
            ) : (
              agencies.map((agency) => (
                <TableRow key={agency._id}>
                  <TableCell sx={{ fontWeight: 500 }}>{agency.name}</TableCell>
                  <TableCell>{agency.country || "—"}</TableCell>
                  <TableCell align="right">
                    {agency.foundedYear || "—"}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenEdit(agency)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(agency)}
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
        <DialogTitle>{editingId ? "Edit Agency" : "Add Agency"}</DialogTitle>

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
            label="Country"
            fullWidth
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            sx={{ mb: 2 }}
          >
            {COUNTRIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Founded Year"
            type="number"
            fullWidth
            value={form.foundedYear}
            onChange={(e) => setForm({ ...form, foundedYear: e.target.value })}
            slotProps={{
              htmlInput: {
                min: 1900,
                max: new Date().getFullYear(),
              },
            }}
            helperText={`Between 1900 and ${new Date().getFullYear()}`}
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

export default AgenciesTab;
