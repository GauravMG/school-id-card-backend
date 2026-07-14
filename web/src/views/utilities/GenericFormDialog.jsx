import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import TemplateSelectionDialog from 'components/TemplateSelectionDialog';
import UniformSelectionDialog from 'components/UniformSelectionDialog';
import ImageAdjustDialog from 'components/ImageAdjustDialog';

export default function GenericFormDialog({ open, onClose, onSave, title, fields, initialData }) {
  const [formData, setFormData] = useState({});
  const [fileData, setFileData] = useState({});
  const [errors, setErrors] = useState({});
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [uniformDialogOpen, setUniformDialogOpen] = useState(false);
  const [adjustField, setAdjustField] = useState(null);
  const [adjustSource, setAdjustSource] = useState(null);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData(initialData);
      } else {
        const defaultData = {};
        fields.forEach(field => {
          if (field.type !== 'separator') {
            defaultData[field.name] = field.defaultValue || (field.type === 'color' ? '#1e88e5' : '');
          }
        });
        setFormData(defaultData);
      }
      setFileData({});
      setErrors({});
    }
  }, [open, initialData, fields]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    let tempErrors = {};
    const urlPattern = new RegExp('^(https?:\\/\\/)?'+ 
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ 
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ 
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ 
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ 
      '(\\#[-a-z\\d_]*)?$','i');
      
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    fields.forEach(field => {
      if (field.type === 'separator' || field.type === 'image-upload') return;

      const val = formData[field.name] || '';
      
      if (field.required && !val.trim()) {
        tempErrors[field.name] = `${field.label} is required`;
      } else if (field.type === 'url' && val && !urlPattern.test(val)) {
        tempErrors[field.name] = "Must be a valid URL";
      } else if (field.type === 'email' && val && !emailPattern.test(val)) {
        tempErrors[field.name] = "Must be a valid email address";
      }
    });

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formData, fileData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Box component="form" noValidate onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <Stack spacing={2}>
            {fields.map((field, index) => {
              if (field.type === 'separator') {
                if (initialData && field.hideInEdit) return null;
                return (
                  <React.Fragment key={`sep-${index}`}>
                    <Divider sx={{ mt: 2, mb: 1 }} />
                    <Typography variant="subtitle1" color="primary">{field.label}</Typography>
                  </React.Fragment>
                );
              }
              if (initialData && field.hideInEdit) return null;

              if (field.type === 'template-picker') {
                return (
                  <Box key={field.name}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>{field.label}</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Button variant="outlined" onClick={() => setTemplateDialogOpen(true)}>
                        {formData[field.name] ? 'Change Template' : 'Choose Template'}
                      </Button>
                      {formData[field.name] && (
                        <Typography variant="body2" color="primary" fontWeight="bold">
                          {formData[field.name].toUpperCase()} Selected
                        </Typography>
                      )}
                    </Stack>
                    {errors[field.name] && <Typography variant="caption" color="error">{errors[field.name]}</Typography>}
                  </Box>
                );
              }

              if (field.type === 'image-upload') {
                const currentFile = fileData[field.name];
                const currentUrl = formData[field.name];
                return (
                  <Box key={field.name}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>{field.label}</Typography>
                    {currentUrl && !currentFile && (
                      <Box sx={{ mb: 1 }}>
                        <img
                          src={currentUrl}
                          alt={field.label}
                          style={{ height: 64, objectFit: 'contain', borderRadius: 4, border: '1px solid #ddd' }}
                        />
                      </Box>
                    )}
                    {currentFile && (
                      <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 0.5 }}>
                        {currentFile.name}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button variant="outlined" size="small" component="label">
                        {currentFile ? 'Change' : currentUrl ? 'Replace Image' : 'Upload Image'}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setAdjustField(field.name);
                              setAdjustSource(file);
                            }
                            e.target.value = '';
                          }}
                        />
                      </Button>
                      {currentFile && (
                        <Button
                          size="small"
                          onClick={() => {
                            setAdjustField(field.name);
                            setAdjustSource(currentFile);
                          }}
                        >
                          Adjust
                        </Button>
                      )}
                      {currentFile && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => setFileData(prev => ({ ...prev, [field.name]: null }))}
                        >
                          Remove
                        </Button>
                      )}
                    </Stack>
                    {errors[field.name] && <Typography variant="caption" color="error">{errors[field.name]}</Typography>}
                  </Box>
                );
              }

              if (field.type === 'uniform-picker') {
                return (
                  <Box key={field.name}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>{field.label}</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Button variant="outlined" onClick={() => setUniformDialogOpen(true)}>
                        {formData[field.name] && formData[field.name] !== 'none' ? 'Change Uniform' : 'Choose Uniform'}
                      </Button>
                      {formData[field.name] && formData[field.name] !== 'none' && (
                        <Typography variant="body2" color="primary" fontWeight="bold">
                          {formData[field.name].toUpperCase()} Selected
                        </Typography>
                      )}
                    </Stack>
                    {errors[field.name] && <Typography variant="caption" color="error">{errors[field.name]}</Typography>}
                  </Box>
                );
              }

              return (
                <TextField
                  key={field.name}
                  autoFocus={index === 0}
                  margin="dense"
                  name={field.name}
                  label={field.label}
                  type={field.type === 'color' ? 'color' : field.type === 'password' ? 'password' : field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : 'text'}
                  fullWidth
                  variant="outlined"
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  error={!!errors[field.name]}
                  helperText={errors[field.name]}
                  required={field.required}
                  disabled={initialData && field.disabledInEdit}
                  placeholder={field.type === 'url' ? 'https://example.com/...' : ''}
                  InputLabelProps={(field.type === 'color' || field.type === 'date') ? { shrink: true } : {}}
                  select={field.type === 'select'}
                >
                  {field.type === 'select' && field.options && field.options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              );
            })}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>

      {/* Nested Dialogs for Custom Pickers */}
      {fields.find(f => f.type === 'template-picker') && (
        <TemplateSelectionDialog 
          open={templateDialogOpen} 
          onClose={() => setTemplateDialogOpen(false)} 
          selectedValue={formData[fields.find(f => f.type === 'template-picker').name]}
          onSelect={(val) => {
            handleChange({ target: { name: fields.find(f => f.type === 'template-picker').name, value: val } });
            setTemplateDialogOpen(false);
          }}
        />
      )}
      {fields.find(f => f.type === 'uniform-picker') && (
        <UniformSelectionDialog
          open={uniformDialogOpen}
          onClose={() => setUniformDialogOpen(false)}
          selectedValue={formData[fields.find(f => f.type === 'uniform-picker').name]}
          onSelect={(val) => {
            handleChange({ target: { name: fields.find(f => f.type === 'uniform-picker').name, value: val } });
            setUniformDialogOpen(false);
          }}
        />
      )}

      <ImageAdjustDialog
        open={!!adjustField}
        onClose={() => { setAdjustField(null); setAdjustSource(null); }}
        imageSrc={adjustSource}
        title="Adjust Uniform Image"
        onSave={(blob) => {
          const file = new File([blob], `${adjustField}.png`, { type: 'image/png' });
          setFileData(prev => ({ ...prev, [adjustField]: file }));
        }}
      />
    </Dialog>
  );
}
