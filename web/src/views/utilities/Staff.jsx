import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from 'store/auth/authSlice';

// material-ui
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import MuiTypography from '@mui/material/Typography';
import { CircularProgress, Box } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

// icons
import AddIcon from '@mui/icons-material/Add';

// project imports
import MainCard from 'ui-component/cards/MainCard';

// components
import GenericTable from './GenericTable';
import GenericFormDialog from './GenericFormDialog';
import toast from 'react-hot-toast';
import {
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation
} from 'store/api/staffApi';
import { useGetSchoolsQuery } from 'store/api/schoolApi';

import { staffColumns, staffFields } from './configs/staffConfig';

// ==============================|| TYPOGRAPHY (STAFF MANAGEMENT) ||============================== //

export default function Staff() {
  const currentUser = useSelector(selectCurrentUser);
  const token = useSelector((state) => state.auth.token);

  const userRole = currentUser?.role;
  const isSuperAdmin = userRole === 'SUPERADMIN';

  // ── School dropdown state (only used by SUPERADMIN) ──────────────────────
  const [selectedSchoolId, setSelectedSchoolId] = useState('');

  // ── Fetch schools list (only for SUPERADMIN) ─────────────────────────────
  const { data: schoolsData, isLoading: isSchoolsLoading } = useGetSchoolsQuery(undefined, {
    skip: !isSuperAdmin
  });
  const schools = schoolsData?.data?.items || (Array.isArray(schoolsData?.data) ? schoolsData.data : []);

  // ── Auto-select first school for Super Admin ──────────────────────────────
  React.useEffect(() => {
    if (isSuperAdmin && schools.length > 0 && !selectedSchoolId) {
      setSelectedSchoolId(schools[0].id);
    }
  }, [isSuperAdmin, schools, selectedSchoolId]);

  // ── Derive the schoolId to use for the staff API ──────────────────────────
  const staffSchoolId = React.useMemo(() => {
    if (isSuperAdmin) return selectedSchoolId; // Super admin picks from dropdown
    // Regular staff: resolve from user object / token
    if (currentUser?.schoolId) return currentUser.schoolId;
    if (currentUser?.school?.id) return currentUser.school.id;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.schoolId || payload.actingAsSchoolId || '';
      } catch {
        return '';
      }
    }
    return '';
  }, [isSuperAdmin, selectedSchoolId, currentUser, token]);

  // ── Staff API ─────────────────────────────────────────────────────────────
  const { data: staffResponse, isLoading: isStaffLoading } = useGetStaffQuery(staffSchoolId, {
    skip: !staffSchoolId
  });
  const staffList = staffResponse?.data?.items || (Array.isArray(staffResponse?.data) ? staffResponse.data : []);

  // ── Pagination ────────────────────────────────────────────────────────────
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const [createStaff] = useCreateStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();
  const [deleteStaff] = useDeleteStaffMutation();

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentStaff, setCurrentStaff] = useState(null);

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setCurrentStaff(null);
  };

  const handleSave = async (formData) => {
    try {
      const allowedKeys = ['name', 'email', 'password', 'isActive'];
      const filteredData = Object.keys(formData)
        .filter((key) => allowedKeys.includes(key))
        .reduce((obj, key) => {
          obj[key] = formData[key];
          return obj;
        }, {});

      if (editingId !== null) {
        const result = await updateStaff({
          schoolId: staffSchoolId,
          id: editingId,
          ...filteredData
        }).unwrap();
        toast.success(result?.message || 'Staff updated successfully!');
      } else {
        const result = await createStaff({
          schoolId: staffSchoolId,
          staff: filteredData
        }).unwrap();
        toast.success(result?.message || 'Staff created successfully!');
      }
      handleClose();
    } catch (err) {
      console.error('Failed to save staff', err);
      toast.error(err?.data?.message || 'Failed to save staff');
    }
  };

  const handleEdit = (staff) => {
    setCurrentStaff(staff);
    setEditingId(staff.id);
    handleOpen();
  };

  const handleDelete = async (id) => {
    try {
      const result = await deleteStaff({ schoolId: staffSchoolId, id }).unwrap();
      toast.success(result?.message || 'Staff deleted successfully!');
    } catch (err) {
      console.error('Failed to delete staff', err);
      toast.error(err?.data?.message || 'Failed to delete staff');
    }
  };

  return (
    <MainCard
      title="Manage Staff"
      secondary={
        <Stack direction="row" spacing={2} alignItems="center">
          {isSuperAdmin && (
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel id="school-select-label">Select School</InputLabel>
              <Select
                labelId="school-select-label"
                value={selectedSchoolId}
                label="Select School"
                onChange={(e) => {
                  setSelectedSchoolId(e.target.value);
                  setPage(0);
                }}
                disabled={isSchoolsLoading}
              >
                {schools.map((school) => (
                  <MenuItem key={school.id} value={school.id}>
                    {school.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            disabled={isSuperAdmin && !selectedSchoolId}
          >
            Add Staff
          </Button>
        </Stack>
      }
    >
      <Stack spacing={3}>
        {isStaffLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <GenericTable
            data={staffList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
            columns={staffColumns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage={
              isSuperAdmin && !selectedSchoolId
                ? 'Please select a school to view staff.'
                : "No staff added yet. Click 'Add Staff' to get started."
            }
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={staffList.length}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        )}

        {/* ── Add / Edit dialog ───────────────────────────────────────────── */}
        <GenericFormDialog
          open={open}
          onClose={handleClose}
          onSave={handleSave}
          title={editingId ? 'Edit Staff' : 'Add New Staff'}
          fields={staffFields}
          initialData={currentStaff}
        />
      </Stack>
    </MainCard>
  );
}
