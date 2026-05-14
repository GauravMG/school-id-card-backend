import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import MuiTypography from '@mui/material/Typography';

// icons
import AddIcon from '@mui/icons-material/Add';

// project imports
import MainCard from 'ui-component/cards/MainCard';

// components
import GenericTable from './GenericTable';
import GenericFormDialog from './GenericFormDialog';
import SchoolAssetsDialog from './SchoolAssetsDialog';
import toast from 'react-hot-toast';

// ==============================|| TYPOGRAPHY (SCHOOL MANAGEMENT) ||============================== //

import { schoolColumns, schoolFields } from './configs/schoolConfig';
import {
  useGetSchoolsQuery,
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,
  useUploadSchoolAssetsMutation,
} from 'store/api/schoolApi';
import { useCreateStaffMutation } from 'store/api/staffApi';
import { useLoginAsMutation } from 'store/auth/authApi';
import { setCredentials } from 'store/auth/authSlice';
import { apiSlice } from 'store/apiSlice';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function Schools() {
  const { data: responseData, isLoading, isError } = useGetSchoolsQuery();
  const rawSchools = responseData?.data?.items || (Array.isArray(responseData?.data) ? responseData.data : []);
  
  const schools = rawSchools.map(school => ({
    ...school,
    publicLink: `${window.location.origin}/public/${school.publicSlug}`
  }));
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [createSchool] = useCreateSchoolMutation();
  const [updateSchool] = useUpdateSchoolMutation();
  const [deleteSchool] = useDeleteSchoolMutation();
  const [createStaff] = useCreateStaffMutation();
  const [uploadAssets] = useUploadSchoolAssetsMutation();
  const [loginAs] = useLoginAsMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentSchool, setCurrentSchool] = useState(null);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setCurrentSchool(null);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSave = async (formData, fileData = {}) => {
    try {
      const { staffName, staffEmail, staffPassword } = formData;

      // Filter payload to match backend schema exactly
      const allowedKeys = [
        'name',
        'contactPerson',
        'email',
        'phone',
        'address',
        'brandColor',
        'secondaryColor',
        'selectedTemplateId',
        'publicSlug',
        'isActive'
      ];

      const filteredData = Object.keys(formData)
        .filter(key => allowedKeys.includes(key))
        .reduce((obj, key) => {
          obj[key] = formData[key];
          return obj;
        }, {});

      // Auto-generate slug if not provided or for new schools
      if (!filteredData.publicSlug && filteredData.name) {
        filteredData.publicSlug = generateSlug(filteredData.name);
      }

      let schoolId;

      if (editingId !== null) {
        // Edit existing
        const result = await updateSchool({ id: editingId, ...filteredData }).unwrap();
        schoolId = editingId;
        toast.success(result?.message || 'School updated successfully!');
      } else {
        // Create new
        const schoolResult = await createSchool({
          ...filteredData,
          isActive: true
        }).unwrap();

        schoolId = schoolResult.data.id;

        // Create first staff member
        if (staffName && staffEmail && staffPassword) {
          const staffResult = await createStaff({
            schoolId,
            staff: {
              name: staffName,
              email: staffEmail,
              password: staffPassword
            }
          }).unwrap();
          toast.success(staffResult?.message || 'School and administrator created successfully!');
        } else {
          toast.success(schoolResult?.message || 'School created successfully!');
        }
      }

      // Upload uniform images if any files were selected
      const hasFiles = Object.values(fileData).some(f => f instanceof File);
      if (hasFiles && schoolId) {
        const fd = new FormData();
        if (fileData.uniformBoy instanceof File) fd.append('uniformBoy', fileData.uniformBoy);
        if (fileData.uniformGirl instanceof File) fd.append('uniformGirl', fileData.uniformGirl);
        await uploadAssets({ id: schoolId, formData: fd }).unwrap();
      }

      handleClose();
    } catch (err) {
      console.error('Failed to save school', err);
      // Handle the nested JSON string in error message if it exists
      let errorMessage = 'Failed to save school';
      if (err?.data?.message) {
        try {
          const parsed = JSON.parse(err.data.message);
          if (Array.isArray(parsed)) {
            errorMessage = parsed.map(e => e.message).join(', ');
          } else {
            errorMessage = err.data.message;
          }
        } catch (e) {
          errorMessage = err.data.message;
        }
      }
      toast.error(errorMessage);
    }
  };

  const handleEdit = (school) => {
    const firstStaff = school.users?.[0];
    setCurrentSchool({
      ...school,
      staffName: firstStaff?.name || '',
      staffEmail: firstStaff?.email || '',
      staffPassword: '',
      uniformBoy: school.uniformBoyUrl || '',
      uniformGirl: school.uniformGirlUrl || '',
    });
    setEditingId(school.id);
    handleOpen();
  };

  const handleUploadClick = (school) => {
    setCurrentSchool(school);
    setAssetDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const result = await deleteSchool(id).unwrap();
      toast.success(result?.message || 'School deleted successfully!');
    } catch (err) {
      console.error('Failed to delete school', err);
      toast.error(err?.data?.message || 'Failed to delete school');
    }
  };

  const handleLoginAs = async (school) => {
    try {
      const response = await loginAs({ schoolId: school.id }).unwrap();
      
      // Reset API state to clear cache
      dispatch(apiSlice.util.resetApiState());

      dispatch(setCredentials({ 
        user: {
          ...response.data.staff,
          school: response.data.school,
          superAdmin: response.data.superAdmin
        }, 
        token: response.data.accessToken 
      }));
      toast.success(response?.message || 'Logged in as school');
      navigate('/staff');
    } catch (err) {
      console.error('Failed to login as school', err);
      toast.error(err?.data?.message || 'Failed to login as school');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <MuiTypography color="error">Failed to load schools.</MuiTypography>;
  }

  return (
    <MainCard title="">
      <Stack spacing={3}>
        {/* Header Section */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <MuiTypography variant="h4">Manage Schools</MuiTypography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
            Add School
          </Button>
        </Stack>

        {/* Dynamic Data Table Component */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <GenericTable 
            data={schools.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)} 
            columns={schoolColumns} 
            onEdit={handleEdit} 
            onUpload={handleUploadClick} 
            onLoginAs={handleLoginAs}
            emptyMessage="No schools added yet. Click 'Add School' to get started."
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={schools.length}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        )}

        {/* Dynamic Add/Edit Dialog Component */}
        <GenericFormDialog 
          open={open} 
          onClose={handleClose} 
          onSave={handleSave} 
          title={editingId ? 'Edit School' : 'Add New School'}
          fields={schoolFields}
          initialData={currentSchool} 
        />

        <SchoolAssetsDialog 
          open={assetDialogOpen} 
          onClose={() => setAssetDialogOpen(false)} 
          school={currentSchool} 
        />
      </Stack>
    </MainCard>
  );
}
