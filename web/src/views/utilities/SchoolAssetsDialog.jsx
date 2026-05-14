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
  LinearProgress
} from '@mui/material';
import { useUploadSchoolAssetsMutation } from 'store/api/schoolApi';
import toast from 'react-hot-toast';

export default function SchoolAssetsDialog({ open, onClose, school }) {
  const [logo, setLogo] = useState(null);
  const [uniformBoy, setUniformBoy] = useState(null);
  const [uniformGirl, setUniformGirl] = useState(null);
  
  const [uploadAssets, { isLoading }] = useUploadSchoolAssetsMutation();

  const handleFileChange = (e, setter) => {
    setter(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!logo && !uniformBoy && !uniformGirl) {
      toast.error('Please select at least one file to upload');
      return;
    }

    try {
      const formData = new FormData();
      if (logo) formData.append('logo', logo);
      if (uniformBoy) formData.append('uniformBoy', uniformBoy);
      if (uniformGirl) formData.append('uniformGirl', uniformGirl);

      const result = await uploadAssets({ id: school.id, formData }).unwrap();
      toast.success(result?.message || 'Assets uploaded successfully');
      onClose();
    } catch (err) {
      console.error('Upload failed', err);
      toast.error(err?.data?.message || 'Failed to upload assets');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Upload Assets for {school?.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>School Logo</Typography>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setLogo)} />
          </Box>
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>Uniform Overlay (Boy)</Typography>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setUniformBoy)} />
          </Box>
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>Uniform Overlay (Girl)</Typography>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setUniformGirl)} />
          </Box>

          {isLoading && <LinearProgress />}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button onClick={handleUpload} variant="contained" disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Upload All'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
