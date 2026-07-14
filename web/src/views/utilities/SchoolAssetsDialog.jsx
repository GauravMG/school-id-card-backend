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
import ImageAdjustDialog from 'components/ImageAdjustDialog';

export default function SchoolAssetsDialog({ open, onClose, school }) {
  const [logo, setLogo] = useState(null);
  const [uniformBoy, setUniformBoy] = useState(null);
  const [uniformGirl, setUniformGirl] = useState(null);
  const [adjustTarget, setAdjustTarget] = useState(null); // 'logo' | 'uniformBoy' | 'uniformGirl'
  const [adjustSource, setAdjustSource] = useState(null);

  const [uploadAssets, { isLoading }] = useUploadSchoolAssetsMutation();

  const SETTERS = { logo: setLogo, uniformBoy: setUniformBoy, uniformGirl: setUniformGirl };

  const handleFileChange = (e, target) => {
    const file = e.target.files[0];
    if (file) {
      setAdjustTarget(target);
      setAdjustSource(file);
    }
    e.target.value = '';
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
            <Typography variant="subtitle2" gutterBottom>School Logo{logo ? ' ✓' : ''}</Typography>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>Uniform Overlay (Boy){uniformBoy ? ' ✓' : ''}</Typography>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'uniformBoy')} />
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>Uniform Overlay (Girl){uniformGirl ? ' ✓' : ''}</Typography>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'uniformGirl')} />
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

      <ImageAdjustDialog
        open={!!adjustTarget}
        onClose={() => { setAdjustTarget(null); setAdjustSource(null); }}
        imageSrc={adjustSource}
        title={`Adjust ${adjustTarget === 'logo' ? 'Logo' : adjustTarget === 'uniformBoy' ? 'Boy Uniform' : 'Girl Uniform'}`}
        onSave={(blob) => {
          const file = new File([blob], `${adjustTarget}.png`, { type: 'image/png' });
          SETTERS[adjustTarget](file);
        }}
      />
    </Dialog>
  );
}
