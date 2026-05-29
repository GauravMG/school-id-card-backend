import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import MuiTypography from '@mui/material/Typography';
import {
  Box, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, FormControlLabel, Switch, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MainCard from 'ui-component/cards/MainCard';
import toast from 'react-hot-toast';
import {
  useGetExportSettingsQuery,
  useCreateExportSettingMutation,
  useUpdateExportSettingMutation,
  useDeleteExportSettingMutation,
} from 'store/api/exportSettingApi';

const PAGE_SIZES = ['A3', 'A4'];
const DEFAULTS = { A3: 6, A4: 4 };

function SettingDialog({ open, onClose, onSave, initial }) {
  const [pageSize, setPageSize] = useState(initial?.pageSize || 'A4');
  const [cardsPerPage, setCardsPerPage] = useState(initial?.cardsPerPage ?? DEFAULTS['A4']);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  React.useEffect(() => {
    if (open) {
      setPageSize(initial?.pageSize || 'A4');
      setCardsPerPage(initial?.cardsPerPage ?? DEFAULTS['A4']);
      setIsActive(initial?.isActive ?? true);
    }
  }, [open, initial]);

  const handleSave = () => {
    if (!cardsPerPage || cardsPerPage < 1) {
      toast.error('Cards per page must be at least 1');
      return;
    }
    onSave({ pageSize, cardsPerPage: parseInt(cardsPerPage, 10), isActive });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{initial ? 'Edit Export Setting' : 'Add Export Setting'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="Page Size"
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            fullWidth
            disabled={!!initial}
          >
            {PAGE_SIZES.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Cards Per Page"
            type="number"
            inputProps={{ min: 1 }}
            value={cardsPerPage}
            onChange={(e) => setCardsPerPage(e.target.value)}
            fullWidth
          />
          <FormControlLabel
            control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
            label="Active"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ExportSettings() {
  const { data: response, isLoading } = useGetExportSettingsQuery();
  const settings = response?.data || [];

  const [createSetting] = useCreateExportSettingMutation();
  const [updateSetting] = useUpdateExportSettingMutation();
  const [deleteSetting] = useDeleteExportSettingMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleOpen = (row = null) => {
    setEditing(row);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const handleSave = async (data) => {
    try {
      if (editing) {
        const result = await updateSetting({ id: editing.id, ...data }).unwrap();
        toast.success(result?.message || 'Setting updated');
      } else {
        const result = await createSetting(data).unwrap();
        toast.success(result?.message || 'Setting created');
      }
      handleClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save setting');
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await deleteSetting(id).unwrap();
      toast.success(result?.message || 'Setting deleted');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete setting');
    }
  };

  return (
    <MainCard title="">
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <MuiTypography variant="h4">Export Settings</MuiTypography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Add Setting
          </Button>
        </Stack>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Page Size</TableCell>
                    <TableCell>Cards Per Page</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {settings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No export settings configured.</TableCell>
                    </TableRow>
                  ) : (
                    settings.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell><strong>{row.pageSize}</strong></TableCell>
                        <TableCell>{row.cardsPerPage}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.isActive ? 'Active' : 'Inactive'}
                            color={row.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton color="primary" onClick={() => handleOpen(row)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDelete(row.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Stack>

      <SettingDialog
        open={dialogOpen}
        onClose={handleClose}
        onSave={handleSave}
        initial={editing}
      />
    </MainCard>
  );
}
