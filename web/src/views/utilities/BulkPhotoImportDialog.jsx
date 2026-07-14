import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { useImportBulkPhotosMutation } from 'store/api/studentApi';
import toast from 'react-hot-toast';

const SHEET_EXTENSIONS = ['.csv', '.xlsx', '.xls'];

export default function BulkPhotoImportDialog({ open, onClose, schoolId }) {
  const [sheet, setSheet] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [result, setResult] = useState(null);
  const [importBulkPhotos, { isLoading }] = useImportBulkPhotosMutation();

  const reset = () => {
    setSheet(null);
    setPhotos([]);
    setResult(null);
  };

  const handleSheetChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!SHEET_EXTENSIONS.includes(ext)) {
      toast.error('Please select a CSV or Excel (.xlsx/.xls) roster sheet');
      e.target.value = '';
      return;
    }
    setSheet(file);
  };

  const handlePhotosChange = (e) => {
    setPhotos(Array.from(e.target.files || []));
  };

  const handleImport = async () => {
    if (!sheet) { toast.error('Please select a roster sheet'); return; }
    if (photos.length === 0) { toast.error('Please select the photo files taken for these students'); return; }

    const formData = new FormData();
    formData.append('sheet', sheet);
    photos.forEach((p) => formData.append('photos', p));

    try {
      const response = await importBulkPhotos({ schoolId, formData }).unwrap();
      setResult(response.data);
      toast.success(response?.message || 'Bulk import processed');
    } catch (err) {
      console.error('Bulk photo import failed', err);
      toast.error(err?.data?.message || 'Failed to process bulk import');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Bulk Photo Import</Typography>
        <IconButton onClick={handleClose} disabled={isLoading} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ py: 2 }}>
          <Typography variant="body2" color="textSecondary">
            For a photographer who has already shot every student: upload a roster sheet (CSV or Excel)
            with columns <b>rollNumber, firstName, lastName, gender, classValue, sectionValue, photoFileName</b>,
            then upload all the photo files. Each row&apos;s <b>photoFileName</b> must exactly match one of
            the uploaded photo file names — matched students are created/updated and their ID cards start
            generating in the background automatically.
          </Typography>

          <Box
            sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center', bgcolor: sheet ? '#f0fdf4' : '#fafafa', cursor: 'pointer' }}
            onClick={() => document.getElementById('bulk-sheet-upload').click()}
          >
            <input type="file" id="bulk-sheet-upload" accept=".csv,.xlsx,.xls" hidden onChange={handleSheetChange} />
            <CloudUploadIcon sx={{ fontSize: 36, color: sheet ? 'success.main' : 'primary.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {sheet ? sheet.name : '1. Click to select the roster sheet (CSV/Excel)'}
            </Typography>
          </Box>

          <Box
            sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center', bgcolor: photos.length ? '#f0fdf4' : '#fafafa', cursor: 'pointer' }}
            onClick={() => document.getElementById('bulk-photos-upload').click()}
          >
            <input type="file" id="bulk-photos-upload" accept="image/*" multiple hidden onChange={handlePhotosChange} />
            <CloudUploadIcon sx={{ fontSize: 36, color: photos.length ? 'success.main' : 'primary.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {photos.length ? `${photos.length} photo(s) selected` : '2. Click to select all student photo files'}
            </Typography>
          </Box>

          {result && (
            <Box>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Chip color="success" label={`Matched: ${result.matched.length}`} size="small" />
                <Chip color="warning" label={`Unmatched photo: ${result.unmatchedPhoto.length}`} size="small" />
                <Chip color="error" label={`Invalid rows: ${result.invalidRows.length}`} size="small" />
              </Stack>
              {(result.unmatchedPhoto.length > 0 || result.invalidRows.length > 0) && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Row</TableCell>
                      <TableCell>Roll No</TableCell>
                      <TableCell>Issue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.unmatchedPhoto.map((r) => (
                      <TableRow key={`u-${r.row}`}>
                        <TableCell>{r.row}</TableCell>
                        <TableCell>{r.rollNumber}</TableCell>
                        <TableCell>No uploaded photo named &quot;{r.photoFileName || '(blank)'}&quot;</TableCell>
                      </TableRow>
                    ))}
                    {result.invalidRows.map((r) => (
                      <TableRow key={`i-${r.row}`}>
                        <TableCell>{r.row}</TableCell>
                        <TableCell>—</TableCell>
                        <TableCell>{r.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>Close</Button>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={!sheet || photos.length === 0 || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
        >
          {isLoading ? 'Processing...' : 'Start Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
