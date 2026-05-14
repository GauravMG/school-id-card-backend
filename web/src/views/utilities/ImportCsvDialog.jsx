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
  IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { useImportStudentsCsvMutation } from 'store/api/studentApi';
import toast from 'react-hot-toast';

export default function ImportCsvDialog({ open, onClose, schoolId }) {
  const [file, setFile] = useState(null);
  const [importStudentsCsv, { isLoading }] = useImportStudentsCsvMutation();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid CSV file');
      e.target.value = null;
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('csv', file);

    try {
      const result = await importStudentsCsv({ schoolId, formData }).unwrap();
      toast.success(result?.message || 'Students imported successfully!');
      onClose();
      setFile(null);
    } catch (err) {
      console.error('Import failed', err);
      toast.error(err?.data?.message || 'Failed to import students');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Import Students CSV</Typography>
        <IconButton onClick={onClose} disabled={isLoading} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Stack spacing={3} sx={{ py: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Upload a CSV file containing student details. Ensure the columns match the required format (Roll Number, First Name, Last Name, Class, Section, etc.).
          </Typography>
          
          <Box 
            sx={{ 
              border: '2px dashed #ccc', 
              borderRadius: 2, 
              p: 4, 
              textAlign: 'center',
              bgcolor: file ? '#f0fdf4' : '#fafafa',
              cursor: 'pointer',
              '&:hover': { bgcolor: '#f1f5f9' }
            }}
            onClick={() => document.getElementById('csv-upload').click()}
          >
            <input 
              type="file" 
              id="csv-upload" 
              accept=".csv" 
              hidden 
              onChange={handleFileChange}
            />
            <CloudUploadIcon sx={{ fontSize: 48, color: file ? 'success.main' : 'primary.main', mb: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {file ? file.name : 'Click to select CSV file'}
            </Typography>
            {file && (
              <Typography variant="caption" display="block" color="textSecondary">
                {(file.size / 1024).toFixed(2)} KB
              </Typography>
            )}
          </Box>

          <Box sx={{ p: 2, bgcolor: '#fff4e5', borderRadius: 1 }}>
            <Typography variant="caption" color="#663c00" sx={{ display: 'block', fontWeight: 700, mb: 0.5 }}>
              Important Note:
            </Typography>
            <Typography variant="caption" color="#663c00">
              The first row should be the header. Existing roll numbers will be skipped or updated depending on system settings.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleImport} 
          disabled={!file || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
        >
          {isLoading ? 'Importing...' : 'Start Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
