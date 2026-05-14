import React, { useState } from 'react';
import { Box, Button, Typography, Stack, Grid } from '@mui/material';
import toast from 'react-hot-toast';

export default function StepPreview({ formData, onBack, onSubmit }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);

      toast.success(
        'Student ID Card Generated Successfully'
      );

      onSubmit();

    } catch (err) {
      console.error(err);

      toast.error(
        'Failed to complete process'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" color="primary" gutterBottom align="center">
        Preview Your ID Card
      </Typography>

      <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 4 }}>
        Please review your details. This is how your ID card will look.
        Ensure your photo is clear and all spelling is correct.
      </Typography>

      <Grid container spacing={4} justifyContent="center" direction="column" alignItems="center">
        <Grid item xs={12} sx={{ width: '100%', maxWidth: 600 }}>
          <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Data Summary
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2"><b>Name:</b> {formData.firstName} {formData.lastName}</Typography>
              <Typography variant="body2"><b>Roll No:</b> {formData.rollNumber}</Typography>
              <Typography variant="body2"><b>Class:</b> {formData.classValue} - {formData.sectionValue}</Typography>
              <Typography variant="body2"><b>DOB:</b> {formData.dateOfBirth || 'N/A'}</Typography>
              <Typography variant="body2"><b>Father:</b> {formData.fatherName || 'N/A'}</Typography>
              <Typography variant="body2"><b>Mother:</b> {formData.motherName || 'N/A'}</Typography>
            </Stack>
          </Box>
        </Grid>

        <Grid item xs={12} sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Box
            component="img"
            src={localStorage.getItem('final_card_url')}
            alt="ID Card Preview"
            sx={{ maxWidth: '100%', width: 400, borderRadius: 2, boxShadow: 4 }}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button onClick={onBack} variant="outlined">Back to Camera</Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleConfirm}
          size="large"
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Confirm & Submit'}
        </Button>
      </Box>

    </Box>
  );
}
