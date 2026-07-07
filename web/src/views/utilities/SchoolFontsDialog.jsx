import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  MenuItem,
  TextField,
  LinearProgress
} from '@mui/material';
import toast from 'react-hot-toast';
import { useGetSchoolFontsQuery, useUpdateSchoolFontsMutation } from 'store/api/schoolApi';

const SLOT_LABELS = {
  HEADER: 'Header (school name banner)',
  NAME: 'Student Name',
  LABEL: 'Field Labels (Roll No, Class, ...)',
  BODY: 'Body Text (default)'
};

export default function SchoolFontsDialog({ open, onClose, school }) {
  const schoolId = school?.id;
  const { data: response, isFetching } = useGetSchoolFontsQuery(schoolId, { skip: !open || !schoolId });
  const [updateFonts, { isLoading: isSaving }] = useUpdateSchoolFontsMutation();

  const catalog = response?.data?.catalog || [];
  const [fonts, setFonts] = useState({ HEADER: 'system', NAME: 'system', LABEL: 'system', BODY: 'system' });

  useEffect(() => {
    if (response?.data?.fonts) setFonts(response.data.fonts);
  }, [response]);

  const handleSave = async () => {
    try {
      const result = await updateFonts({ schoolId, ...fonts }).unwrap();
      toast.success(result?.message || 'Fonts updated successfully');
      onClose();
    } catch (err) {
      console.error('Failed to update fonts', err);
      toast.error(err?.data?.message || 'Failed to update fonts');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Fonts — {school?.name}</DialogTitle>
      <DialogContent>
        {isFetching && <LinearProgress sx={{ mb: 2 }} />}
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Choose a font for each type of text on this school&apos;s ID cards.
        </Typography>
        <Stack spacing={2.5}>
          {Object.keys(SLOT_LABELS).map((slot) => (
            <TextField
              key={slot}
              select
              label={SLOT_LABELS[slot]}
              value={fonts[slot] || 'system'}
              onChange={(e) => setFonts((prev) => ({ ...prev, [slot]: e.target.value }))}
              fullWidth
            >
              {catalog.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving || isFetching}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
