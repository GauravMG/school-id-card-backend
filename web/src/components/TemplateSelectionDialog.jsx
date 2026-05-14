import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Grid, 
  Box, 
  Typography, 
  CardActionArea,
  CircularProgress
} from '@mui/material';
import { useGetTemplatesQuery } from 'store/api/schoolApi';

export default function TemplateSelectionDialog({ open, onClose, onSelect, selectedValue }) {
  const { data: templatesResponse, isLoading, isError } = useGetTemplatesQuery();
  const templates = templatesResponse?.data || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4">Choose ID Card Template</Typography>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="error">Failed to load templates. Please try again later.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {templates.map((template, i) => {
              // Handle both string array and object array responses
              const templateId = typeof template === 'string' ? template : template.id;
              const templateName = typeof template === 'string' 
                ? template.replace('template-', 'Template ') 
                : template.name || `Template ${i + 1}`;

              return (
                <Grid item xs={12} sm={6} md={4} key={templateId}>
                  <CardActionArea 
                    onClick={() => onSelect(templateId)}
                    sx={{ 
                      border: selectedValue === templateId ? '3px solid #1e88e5' : '1px solid #e2e8f0',
                      borderRadius: 3,
                      p: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#1e88e5',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        height: 180, 
                        bgcolor: '#f8fafc', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRadius: 2,
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      {/* Miniature ID Card Preview */}
                      <Box 
                        sx={{ 
                          width: 100, 
                          height: 150, 
                          bgcolor: 'white', 
                          borderRadius: 2, 
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          overflow: 'hidden',
                          border: '1px solid #f1f5f9'
                        }}
                      >
                        <Box sx={{ height: 40, bgcolor: `hsl(${i * 45}, 70%, 55%)`, position: 'relative' }}>
                           <Box sx={{ width: 15, height: 15, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.3)', m: 0.5 }} />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: -2 }}>
                          <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#e2e8f0', border: '3px solid white' }} />
                        </Box>
                        <Box sx={{ flexGrow: 1, p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.8, mt: 0.5 }}>
                          <Box sx={{ width: '80%', height: 6, bgcolor: '#475569', borderRadius: 1 }} />
                          <Box sx={{ width: '60%', height: 5, bgcolor: '#94a3b8', borderRadius: 1 }} />
                          <Box sx={{ width: '90%', height: 4, bgcolor: '#f1f5f9', borderRadius: 1, mt: 1 }} />
                          <Box sx={{ width: '90%', height: 4, bgcolor: '#f1f5f9', borderRadius: 1 }} />
                          <Box sx={{ width: '90%', height: 4, bgcolor: '#f1f5f9', borderRadius: 1 }} />
                        </Box>
                      </Box>
                      
                      {selectedValue === templateId && (
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            bgcolor: '#1e88e5', 
                            color: 'white', 
                            borderRadius: '50%', 
                            width: 24, 
                            height: 24, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 'bold'
                          }}
                        >
                          ✓
                        </Box>
                      )}
                    </Box>
                    <Typography 
                      variant="subtitle1" 
                      align="center" 
                      sx={{ 
                        mt: 1.5, 
                        fontWeight: selectedValue === templateId ? 800 : 500,
                        color: selectedValue === templateId ? 'primary.main' : 'text.primary'
                      }}
                    >
                      {templateName}
                    </Typography>
                  </CardActionArea>
                </Grid>
              );
            })}
          </Grid>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, bgcolor: '#f8fafc' }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
