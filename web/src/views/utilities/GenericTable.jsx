import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import MuiTypography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LoginIcon from '@mui/icons-material/Login';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { Box } from '@mui/material';
import UserRoundIcon from 'assets/images/users/user-round.svg';

export default function GenericTable({
  data = [],
  columns,
  onEdit,
  onDelete,
  onUpload,
  onLoginAs,
  onAdjustPhoto,
  onFonts,
  onFormFields,
  emptyMessage = "No records found.",
  page = 0,
  rowsPerPage = 20,
  totalCount = 0,
  onPageChange,
  onRowsPerPageChange,
  selectable = false,
  selectedIds = [],
  onSelectChange,
  hideEdit = false
}) {
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = data.map((n) => n.id);
      onSelectChange(allIds);
    } else {
      onSelectChange([]);
    }
  };

  const handleSelectOne = (event, id) => {
    const selectedIndex = selectedIds.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedIds, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedIds.slice(1));
    } else if (selectedIndex === selectedIds.length - 1) {
      newSelected = newSelected.concat(selectedIds.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedIds.slice(0, selectedIndex),
        selectedIds.slice(selectedIndex + 1),
      );
    }
    onSelectChange(newSelected);
  };

  const isSelected = (id) => selectedIds.indexOf(id) !== -1;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="generic table">
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedIds.length > 0 && selectedIds.length < data.length}
                    checked={data.length > 0 && selectedIds.length === data.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell key={col.id}>{col.label}</TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 2 : 1)} align="center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const isItemSelected = isSelected(row.id);
                return (
                  <TableRow 
                    key={row.id} 
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    selected={isItemSelected}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onChange={(event) => handleSelectOne(event, row.id)}
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => {
                      // Helper to get nested value
                      const getValue = (obj, path) => {
                        if (!path || !obj) return null;
                        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
                      };

                      const value = getValue(row, col.id);
                      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
                      const baseUrl = apiBaseUrl.replace(/\/api$/, '');

                      return (
                        <TableCell key={col.id}>
                          {col.type === 'color' ? (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <div style={{ width: 20, height: 20, backgroundColor: value, borderRadius: 4, border: '1px solid #ccc' }}></div>
                              <MuiTypography variant="body2">{value || 'N/A'}</MuiTypography>
                            </Stack>
                          ) : col.type === 'image' ? (
                            <Box
                              component="img"
                              src={value ? `${baseUrl}${value}` : UserRoundIcon}
                              sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover', border: '1px solid #eee' }}
                              onError={(e) => { e.target.src = UserRoundIcon; }}
                            />
                          ) : col.type === 'student-photo' ? (
                            (() => {
                              const photoUrl = row.compositeFile?.publicUrl || row.photoFile?.publicUrl;
                              if (photoUrl) {
                                return (
                                  <Box
                                    component="img"
                                    src={`${baseUrl}${photoUrl}`}
                                    sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover', border: '1px solid #eee' }}
                                    onError={(e) => { e.target.src = UserRoundIcon; }}
                                  />
                                );
                              }
                              const isFemale = row.gender === 'FEMALE';
                              return (
                                <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: isFemale ? '#fce4ec' : '#e3f2fd', borderRadius: 1, border: '1px solid #eee' }}>
                                  {isFemale
                                    ? <WomanIcon sx={{ color: '#e91e63', fontSize: 28 }} />
                                    : <ManIcon sx={{ color: '#1976d2', fontSize: 28 }} />}
                                </Box>
                              );
                            })()
                          ) : col.type === 'copy-link' ? (
                            value ? (
                              <Tooltip title="Copy Link">
                                <IconButton size="small" onClick={() => handleCopy(value)} color="secondary">
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : 'N/A'
                          ) : (
                            value || 'N/A'
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell align="right">
                      {!hideEdit && (
                        <IconButton color="primary" onClick={() => onEdit(row)}>
                          <EditIcon />
                        </IconButton>
                      )}
                      {onLoginAs && (
                        <Tooltip title="Login as School">
                          <IconButton color="secondary" onClick={() => onLoginAs(row)}>
                            <LoginIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {/* {onUpload && (
                        <Tooltip title="Upload Assets">
                          <IconButton color="secondary" onClick={() => onUpload(row)}>
                            <CloudUploadIcon />
                          </IconButton>
                        </Tooltip>
                      )} */}
                      {onAdjustPhoto && (
                        <Tooltip title="Adjust Photo">
                          <IconButton color="secondary" onClick={() => onAdjustPhoto(row)}>
                            <PhotoCameraIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onFonts && (
                        <Tooltip title="ID Card Fonts">
                          <IconButton color="secondary" onClick={() => onFonts(row)}>
                            <TextFieldsIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onFormFields && (
                        <Tooltip title="Form Fields">
                          <IconButton color="secondary" onClick={() => onFormFields(row)}>
                            <FormatListBulletedIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onDelete && (
                        <IconButton color="error" onClick={() => onDelete(row.id)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {onPageChange && (
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </Paper>
  );
}
