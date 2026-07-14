import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  TextField,
  Typography,
  LinearProgress
} from '@mui/material';
import toast from 'react-hot-toast';
import { useGetSchoolFormFieldsQuery, useUpdateSchoolFormFieldsMutation } from 'store/api/schoolApi';

export default function SchoolFormFieldsDialog({ open, onClose, schoolId, schoolName }) {
  const { data: response, isFetching } = useGetSchoolFormFieldsQuery(schoolId, { skip: !open || !schoolId });
  const [updateFields, { isLoading: isSaving }] = useUpdateSchoolFormFieldsMutation();
  const [fields, setFields] = useState([]);

  useEffect(() => {
    if (response?.data) setFields(response.data);
  }, [response]);

  const patchField = (fieldKey, patch) => {
    setFields((prev) => prev.map((f) => (f.fieldKey === fieldKey ? { ...f, ...patch } : f)));
  };

  const handleSave = async () => {
    try {
      const payload = fields
        .filter((f) => !f.locked)
        .map(({ fieldKey, label, isVisible, isRequired, sortOrder }) => ({ fieldKey, label, isVisible, isRequired, sortOrder }));
      const result = await updateFields({ schoolId, fields: payload }).unwrap();
      toast.success(result?.message || 'Form fields updated successfully');
      onClose();
    } catch (err) {
      console.error('Failed to update form fields', err);
      toast.error(err?.data?.message || 'Failed to update form fields');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Form Fields — {schoolName}</DialogTitle>
      <DialogContent>
        {isFetching && <LinearProgress sx={{ mb: 2 }} />}
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Choose which fields appear on the public link and school portal for this school, whether
          each is required, and customize its label. Core identity fields are always shown.
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Field</TableCell>
              <TableCell align="center">Visible</TableCell>
              <TableCell align="center">Required</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.fieldKey}>
                <TableCell>
                  <TextField
                    variant="standard"
                    value={field.label}
                    disabled={field.locked}
                    onChange={(e) => patchField(field.fieldKey, { label: e.target.value })}
                    fullWidth
                  />
                </TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={field.isVisible}
                    disabled={field.locked}
                    onChange={(e) => patchField(field.fieldKey, { isVisible: e.target.checked })}
                  />
                </TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={field.isRequired}
                    disabled={field.locked || !field.isVisible}
                    onChange={(e) => patchField(field.fieldKey, { isRequired: e.target.checked })}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
