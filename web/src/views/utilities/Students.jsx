import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from 'store/auth/authSlice';

// material-ui
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import MuiTypography from '@mui/material/Typography';
import { Tabs, Tab, CircularProgress, Box, TextField, MenuItem } from '@mui/material';

// icons
import AddIcon from '@mui/icons-material/Add';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';

// project imports
import MainCard from 'ui-component/cards/MainCard';

// components
import GenericTable from './GenericTable';
import GenericFormDialog from './GenericFormDialog';
import GenerateIDDialog from './GenerateIDDialog';
import ImportCsvDialog from './ImportCsvDialog';
import toast from 'react-hot-toast';
import { useGetSchoolsQuery, useGetSchoolQuery } from 'store/api/schoolApi';
import {
  useGetStudentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation
} from 'store/api/studentApi';

// ==============================|| TYPOGRAPHY (STUDENTS MANAGEMENT) ||============================== //

import { studentColumns, studentFields, MASTER_CLASSES, MASTER_SECTIONS } from './configs/studentConfig';

export default function Students() {
  const currentUser = useSelector(selectCurrentUser);
  const { data: schoolsResponse } = useGetSchoolsQuery(undefined, {
    skip: currentUser?.role !== 'SUPERADMIN'
  });
  const schools = schoolsResponse?.data?.items || (Array.isArray(schoolsResponse?.data) ? schoolsResponse.data : []);

  const [selectedSchoolId, setSelectedSchoolId] = useState(currentUser?.schoolId || '');

  // Auto-select first school if none selected (e.g. for Super Admin)
  React.useEffect(() => {
    if (schools.length > 0 && !selectedSchoolId) {
      setSelectedSchoolId(schools[0].id);
    }
  }, [schools, selectedSchoolId]);

  const [tabValue, setTabValue] = useState(0); // 0: Pending, 1: Completed

  const [classFilter, setClassFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const SHOW_IMPORT_CSV = true;
  const SHOW_ADD_STUDENT = false;
  const SHOW_EDIT_STUDENT = false;

  const handleDownloadCsvTemplate = () => {
    const headers = [
      'rollNumber', 'firstName', 'lastName', 'gender',
      'classValue', 'sectionValue', 'fatherName', 'motherName',
      'guardianPhone', 'admissionNumber', 'address'
    ];
    const csv = headers.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const { data: studentsResponse, isLoading: isStudentsLoading } = useGetStudentsQuery({
    schoolId: selectedSchoolId,
    page: page + 1,
    limit: rowsPerPage,
    classValue: classFilter === 'all' ? undefined : classFilter,
    sectionValue: sectionFilter === 'all' ? undefined : sectionFilter,
    isDetailsCompleted: tabValue === 1 ? 'true' : 'false'
  }, {
    skip: !selectedSchoolId,
    refetchOnMountOrArgChange: true
  });

  const { data: schoolDetailsResponse } = useGetSchoolQuery(selectedSchoolId, {
    skip: !selectedSchoolId
  });
  const schoolDetails = schoolDetailsResponse?.data;

  const studentData = studentsResponse?.data?.items || (Array.isArray(studentsResponse?.data) ? studentsResponse.data : []);
  const totalCount = studentsResponse?.data?.meta?.total || 0;

  const [createStudent] = useCreateStudentMutation();
  const [updateStudent] = useUpdateStudentMutation();
  const [deleteStudent] = useDeleteStudentMutation();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
    setSelectedStudentIds([]); // Clear selection when tab changes
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setCurrentStudent(null);
  };

  const handleSave = async (formData) => {
    try {
      const allowedKeys = [
        'firstName',
        'lastName',
        'rollNumber',
        'admissionNumber',
        'gender',
        'dateOfBirth',
        'classValue',
        'sectionValue',
        'fatherName',
        'motherName',
        'guardianPhone',
        'emergencyPhone',
        'address',
        'bloodGroup',
        'transportRoute'
      ];

      const filteredData = Object.keys(formData)
        .filter((key) => allowedKeys.includes(key))
        .reduce((obj, key) => {
          obj[key] = formData[key];
          return obj;
        }, {});

      if (editingId !== null) {
        const result = await updateStudent({
          schoolId: selectedSchoolId,
          id: editingId,
          ...filteredData
        }).unwrap();
        toast.success(result?.message || 'Student updated successfully!');
      } else {
        const result = await createStudent({
          schoolId: selectedSchoolId,
          student: filteredData
        }).unwrap();
        toast.success(result?.message || 'Student created successfully!');
      }
      handleClose();
    } catch (err) {
      console.error('Failed to save student', err);
      toast.error(err?.data?.message || 'Failed to save student');
    }
  };

  const handleEdit = (student) => {
    setCurrentStudent(student);
    setEditingId(student.id);
    handleOpen();
  };

  const handleDelete = async (id) => {
    try {
      const result = await deleteStudent({ schoolId: selectedSchoolId, id }).unwrap();
      toast.success(result?.message || 'Student deleted successfully!');
    } catch (err) {
      console.error('Failed to delete student', err);
      toast.error(err?.data?.message || 'Failed to delete student');
    }
  };

  const selectedStudents = studentData.filter(s => selectedStudentIds.includes(s.id));

  return (
    <MainCard title="">
      <Stack spacing={3}>
        {/* School Selector and Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <MuiTypography variant="h4">Manage Students</MuiTypography>
          </Stack>
          <Stack direction="row" spacing={2}>
            {tabValue === 1 && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<PictureAsPdfIcon />}
                onClick={() => {
                  if (selectedStudentIds.length === 0) {
                    toast.error('Please select students first to export ID cards');
                    return;
                  }
                  setGenerateDialogOpen(true);
                }}
              >
                Export ID Cards
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadCsvTemplate}
            >
              CSV Template
            </Button>
            {SHOW_IMPORT_CSV && (
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => setImportDialogOpen(true)}
                disabled={!selectedSchoolId}
              >
                Import CSV
              </Button>
            )}
            {SHOW_ADD_STUDENT && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpen}
                disabled={!selectedSchoolId}
              >
                Add Student
              </Button>
            )}
          </Stack>
        </Stack>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="student status tabs">
            <Tab label="Pending Process" />
            <Tab label="Completed" />
          </Tabs>
        </Box>

        {/* Filters Section */}
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            select
            label="Filter by Class"
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Classes</MenuItem>
            {MASTER_CLASSES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Filter by Section"
            value={sectionFilter}
            onChange={(e) => {
              setSectionFilter(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Sections</MenuItem>
            {MASTER_SECTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                Section {s}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Dynamic Data Table Component */}
        {isStudentsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <GenericTable
            data={studentData}
            columns={studentColumns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            hideEdit={!SHOW_EDIT_STUDENT}
            emptyMessage="No students found in this category."
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            selectable={tabValue === 1}
            selectedIds={selectedStudentIds}
            onSelectChange={setSelectedStudentIds}
          />
        )}

        {/* Dynamic Add/Edit Dialog Component */}
        <GenericFormDialog
          open={open}
          onClose={handleClose}
          onSave={handleSave}
          title={editingId ? 'Edit Student' : 'Add New Student'}
          fields={studentFields}
          initialData={currentStudent}
        />

        {/* PDF Generation Dialog */}
        {generateDialogOpen && (
          <GenerateIDDialog
            open={generateDialogOpen}
            onClose={() => setGenerateDialogOpen(false)}
            students={selectedStudents}
            school={schoolDetails}
          />
        )}

        {/* Import CSV Dialog */}
        <ImportCsvDialog
          open={importDialogOpen}
          onClose={() => setImportDialogOpen(false)}
          schoolId={selectedSchoolId}
        />
      </Stack>
    </MainCard>
  );
}
