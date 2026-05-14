import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Box, Typography, CardActionArea } from '@mui/material';
import { uniformOptions } from 'utils/uniforms';

export default function UniformSelectionDialog({ open, onClose, onSelect, selectedValue }) {

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Choose School Uniform</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {uniformOptions.map((uniform) => (
            <Grid item xs={6} sm={6} key={uniform.id}>
              <CardActionArea 
                onClick={() => onSelect(uniform.id)}
                sx={{ 
                  border: selectedValue === uniform.id ? '3px solid #1976d2' : '1px solid #ddd',
                  borderRadius: 2,
                  p: 1
                }}
              >
                <Box 
                  sx={{ 
                    height: 120, 
                    bgcolor: '#f5f5f5', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: 1,
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  {uniform.id !== 'none' ? (
                    <Box 
                      component="img"
                      src={uniform.image}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Box sx={{ width: 50, height: 50, border: '2px dashed #ccc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h4" color="textSecondary" sx={{ opacity: 0.5 }}>?</Typography>
                    </Box>
                  )}
                </Box>
                <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                  {uniform.name}
                </Typography>
              </CardActionArea>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
