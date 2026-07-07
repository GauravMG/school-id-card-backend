import React, { useState, useEffect, useMemo } from 'react';
import { Grid, TextField, Button, Box, Divider, Typography, MenuItem, CircularProgress, InputAdornment, Card, CardContent, Stack } from '@mui/material';
// import { useGetPublicStudentQuery } from 'store/api/publicApi';
import {
  useGetPublicStudentQuery,
  useGetPublicFormFieldsQuery,
  useSubmitStudentDetailsMutation
} from 'store/api/publicApi';
import toast from 'react-hot-toast';

export default function StepDetails({ formData, setFormData, handleChange, onNext, school, slug }) {
  const [errors, setErrors] = useState({});

  const [submitStudent] =
    useSubmitStudentDetailsMutation();

  const [loading, setLoading] =
    useState(false);
  // Auto-fetch student details when Roll Number, Class, and Section are filled
  const { data: studentResult, isFetching } = useGetPublicStudentQuery(
    {
      slug: slug,
      rollNumber: formData.rollNumber,
      classValue: formData.classValue,
      sectionValue: formData.sectionValue
    },
    {
      skip: !formData.rollNumber || !formData.classValue || !formData.sectionValue || !slug
    }
  );

  // Per-school field customization (item 7) — a school can hide, require, or
  // relabel any non-core field. Core identity fields (firstName, rollNumber,
  // gender, classValue, sectionValue) are always shown/required server-side.
  const { data: fieldsResult } = useGetPublicFormFieldsQuery(slug, { skip: !slug });
  const fieldConfig = useMemo(() => {
    const map = {};
    (fieldsResult?.data || []).forEach((f) => { map[f.fieldKey] = f; });
    return map;
  }, [fieldsResult]);
  const isFieldVisible = (key) => fieldConfig[key]?.isVisible !== false;
  const isFieldRequired = (key) => !!fieldConfig[key]?.isRequired;
  const fieldLabel = (key, fallback) => fieldConfig[key]?.label || fallback;

  useEffect(() => {
    if (studentResult?.success && studentResult?.data) {
      const student = studentResult.data;
      setFormData(prev => ({
        ...prev,
        firstName: student.firstName || prev.firstName,
        lastName: student.lastName || prev.lastName,
        admissionNumber: student.admissionNumber || prev.admissionNumber,
        gender: student.gender || prev.gender,
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : prev.dateOfBirth,
        fatherName: student.fatherName || prev.fatherName,
        motherName: student.motherName || prev.motherName,
        guardianPhone: student.guardianPhone || prev.guardianPhone,
        emergencyPhone: student.emergencyPhone || prev.emergencyPhone,
        address: student.address || prev.address,
        bloodGroup: student.bloodGroup || prev.bloodGroup,
        transportRoute: student.transportRoute || prev.transportRoute,
        stream: student.stream || prev.stream,
        commuteMode: student.commuteMode || prev.commuteMode,
        // Preserve existing photo if any, but usually we capture a new one in this flow
      }));
      toast.success('Record found! Details have been pre-filled.');
    }
  }, [studentResult, setFormData]);

  const isSeniorClass = ['11', '12'].includes(formData.classValue);

  const OPTIONAL_FIELD_KEYS = [
    'lastName', 'admissionNumber', 'dateOfBirth', 'bloodGroup', 'fatherName',
    'motherName', 'guardianPhone', 'emergencyPhone', 'address', 'transportRoute', 'commuteMode'
  ];

  const validate = () => {
    let tempErrors = {};
    if (!formData.firstName) tempErrors.firstName = 'First Name is required';
    if (!formData.rollNumber) tempErrors.rollNumber = 'Roll Number is required';
    if (!formData.classValue) tempErrors.classValue = 'Class is required';
    if (!formData.sectionValue) tempErrors.sectionValue = 'Section is required';
    if (!formData.gender) tempErrors.gender = 'Gender is required';
    if (isSeniorClass && isFieldVisible('stream') && !formData.stream) tempErrors.stream = 'Stream is required for Class 11 & 12';

    OPTIONAL_FIELD_KEYS.forEach((key) => {
      if (isFieldVisible(key) && isFieldRequired(key) && !formData[key]) {
        tempErrors[key] = `${fieldLabel(key, key)} is required`;
      }
    });

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        rollNumber: formData.rollNumber,
        admissionNumber: formData.admissionNumber,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        classValue: formData.classValue,
        sectionValue: formData.sectionValue,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        guardianPhone: formData.guardianPhone,
        emergencyPhone: formData.emergencyPhone,
        address: formData.address,
        bloodGroup: formData.bloodGroup,
        transportRoute: formData.transportRoute,
        stream: formData.stream || null,
        commuteMode: formData.commuteMode || null
      };

      // FIRST API TRIGGER
      const result = await submitStudent({
        slug,
        studentData: payload
      }).unwrap();

      console.log(
        'STUDENT CREATE RESPONSE',
        result
      );

      const createdStudent =
        result?.data || result;

      // save created student id
      setFormData(prev => ({
        ...prev,
        id: createdStudent?.id
      }));

      toast.success(
        'Student details saved successfully'
      );

      // move next step
      onNext();

    } catch (err) {
      console.error(err);

      toast.error(
        err?.data?.message ||
        err.message ||
        'Failed to save student'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" noValidate>
      <Card sx={{ bgcolor: '#f1f5f9', mb: 4, borderRadius: 3, border: '1px solid', borderColor: '#cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" color="primary" sx={{ mb: 1, fontWeight: 700 }}>
            1. Student Identification
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
            Please fill these 3 fields first to auto-fill your existing record.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="rollNumber"
                label="Roll Number *"
                fullWidth
                value={formData.rollNumber}
                onChange={handleChange}
                error={!!errors.rollNumber}
                helperText={errors.rollNumber}
                placeholder="e.g. 683"
                InputProps={{
                  endAdornment: isFetching ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null
                }}
              />
            </Grid>
            {isFieldVisible('admissionNumber') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="admissionNumber"
                  label={fieldLabel('admissionNumber', 'Admission Number') + (isFieldRequired('admissionNumber') ? ' *' : '')}
                  fullWidth
                  value={formData.admissionNumber}
                  onChange={handleChange}
                  error={!!errors.admissionNumber}
                  helperText={errors.admissionNumber}
                  placeholder="Enter Admission No."
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="classValue"
                label="Class *"
                fullWidth
                value={formData.classValue}
                onChange={handleChange}
                error={!!errors.classValue}
                sx={{ minWidth: 180 }}
              >
                {['NURSERY', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((c) => (
                  <MenuItem key={c} value={c}>
                    {isNaN(c) ? c : `Class ${c}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="sectionValue"
                label="Section *"
                fullWidth
                value={formData.sectionValue}
                onChange={handleChange}
                error={!!errors.sectionValue}
                sx={{ minWidth: 180 }}
              >
                {['A', 'B', 'C', 'D', 'E'].map((s) => (
                  <MenuItem key={s} value={s}>
                    Section {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Stack spacing={4} sx={{ px: 1 }}>
        <Box>
          <Typography variant="h5" color="primary" sx={{ mb: 3, fontWeight: 700 }}>
            2. Personal Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                label="First Name *"
                fullWidth
                value={formData.firstName}
                onChange={handleChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            {isFieldVisible('lastName') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="lastName"
                  label={fieldLabel('lastName', 'Last Name') + (isFieldRequired('lastName') ? ' *' : '')}
                  fullWidth
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="gender"
                label="Gender *"
                fullWidth
                value={formData.gender}
                onChange={handleChange}
                error={!!errors.gender}
              >
                <MenuItem value="MALE">Male</MenuItem>
                <MenuItem value="FEMALE">Female</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>
            </Grid>
            {isFieldVisible('dateOfBirth') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="dateOfBirth"
                  label={fieldLabel('dateOfBirth', 'Date of Birth') + (isFieldRequired('dateOfBirth') ? ' *' : '')}
                  fullWidth
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth}
                />
              </Grid>
            )}
            {isFieldVisible('bloodGroup') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="bloodGroup"
                  label={fieldLabel('bloodGroup', 'Blood Group') + (isFieldRequired('bloodGroup') ? ' *' : '')}
                  fullWidth
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  error={!!errors.bloodGroup}
                  helperText={errors.bloodGroup}
                  placeholder="e.g. A+"
                />
              </Grid>
            )}
            {isSeniorClass && isFieldVisible('stream') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  name="stream"
                  label="Stream *"
                  fullWidth
                  value={formData.stream}
                  onChange={handleChange}
                  error={!!errors.stream}
                  helperText={errors.stream}
                >
                  <MenuItem value="ARTS">Arts</MenuItem>
                  <MenuItem value="COMMERCE">Commerce</MenuItem>
                  <MenuItem value="SCIENCE_MEDICAL">Science (Medical)</MenuItem>
                  <MenuItem value="SCIENCE_NON_MEDICAL">Science (Non-Medical)</MenuItem>
                </TextField>
              </Grid>
            )}
          </Grid>
        </Box>

        <Divider sx={{ '&::before, &::after': { borderColor: 'primary.light' } }}>
          <Typography variant="h5" color="primary" sx={{ px: 2, fontWeight: 700 }}>
            3. Parent & Contact Details
          </Typography>
        </Divider>

        <Box>
          <Grid container spacing={3}>
            {isFieldVisible('fatherName') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="fatherName"
                  label={fieldLabel('fatherName', "Father's Name") + (isFieldRequired('fatherName') ? ' *' : '')}
                  fullWidth
                  value={formData.fatherName}
                  onChange={handleChange}
                  error={!!errors.fatherName}
                  helperText={errors.fatherName}
                />
              </Grid>
            )}
            {isFieldVisible('motherName') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="motherName"
                  label={fieldLabel('motherName', "Mother's Name") + (isFieldRequired('motherName') ? ' *' : '')}
                  fullWidth
                  value={formData.motherName}
                  onChange={handleChange}
                  error={!!errors.motherName}
                  helperText={errors.motherName}
                />
              </Grid>
            )}
            {isFieldVisible('guardianPhone') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="guardianPhone"
                  label={fieldLabel('guardianPhone', 'Guardian Phone') + (isFieldRequired('guardianPhone') ? ' *' : '')}
                  fullWidth
                  value={formData.guardianPhone}
                  onChange={handleChange}
                  error={!!errors.guardianPhone}
                  helperText={errors.guardianPhone}
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
            )}
            {isFieldVisible('emergencyPhone') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="emergencyPhone"
                  label={fieldLabel('emergencyPhone', 'Emergency Contact') + (isFieldRequired('emergencyPhone') ? ' *' : '')}
                  fullWidth
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  error={!!errors.emergencyPhone}
                  helperText={errors.emergencyPhone}
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
            )}
            {isFieldVisible('address') && (
              <Grid item xs={12}>
                <TextField
                  name="address"
                  label={fieldLabel('address', 'Home Address') + (isFieldRequired('address') ? ' *' : '')}
                  fullWidth
                  multiline
                  minRows={2}
                  value={formData.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  helperText={errors.address}
                />
              </Grid>
            )}
            {isFieldVisible('transportRoute') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="transportRoute"
                  label={fieldLabel('transportRoute', 'Transport Route / Bus No.') + (isFieldRequired('transportRoute') ? ' *' : '')}
                  fullWidth
                  value={formData.transportRoute}
                  onChange={handleChange}
                  error={!!errors.transportRoute}
                  helperText={errors.transportRoute}
                />
              </Grid>
            )}
            {isFieldVisible('commuteMode') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  name="commuteMode"
                  label={fieldLabel('commuteMode', 'How does the student commute?') + (isFieldRequired('commuteMode') ? ' *' : '')}
                  fullWidth
                  value={formData.commuteMode}
                  onChange={handleChange}
                  error={!!errors.commuteMode}
                  helperText={errors.commuteMode}
                >
                  <MenuItem value="SELF">Self (Cycle/Walk)</MenuItem>
                  <MenuItem value="WITH_PARENT">With Parent</MenuItem>
                  <MenuItem value="SCHOOL_TRANSPORT">School Transport</MenuItem>
                </TextField>
              </Grid>
            )}
          </Grid>
        </Box>
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 6, pb: 4 }}>
        <Button
          variant="contained"
          onClick={handleContinue}
          size="large"
          disabled={loading}
          sx={{
            px: 10,
            py: 2,
            fontSize: '1.2rem',
            fontWeight: 700,
            borderRadius: 3,
            bgcolor:
              school?.brandColor ||
              'primary.main',
            '&:hover': {
              bgcolor:
                school?.secondaryColor ||
                school?.brandColor ||
                'primary.dark'
            },
            boxShadow:
              '0 6px 20px 0 rgba(0,0,0,0.15)'
          }}
        >
          {loading
            ? 'Saving Details...'
            : 'Continue to Photo'}
        </Button>
      </Box>
    </Box>
  );
}
