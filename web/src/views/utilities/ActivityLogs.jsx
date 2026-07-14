import React, { useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  Collapse,
  IconButton,
  TablePagination,
  CircularProgress
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MainCard from 'ui-component/cards/MainCard';
import { useGetAuditLogsQuery, useGetAuditActionTypesQuery } from 'store/api/auditApi';
import { useGetSchoolsQuery } from 'store/api/schoolApi';

const PORTAL_LABEL = { SUPERADMIN: 'Superadmin Portal', SCHOOL_STAFF: 'School Portal' };
const PORTAL_COLOR = { SUPERADMIN: 'secondary', SCHOOL_STAFF: 'primary' };

function LogRow({ log }) {
  const [open, setOpen] = useState(false);
  const portal = log.actorUser?.role;

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen((v) => !v)}>
            {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
          </IconButton>
        </TableCell>
        <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
        <TableCell>
          {portal ? <Chip size="small" label={PORTAL_LABEL[portal] || portal} color={PORTAL_COLOR[portal] || 'default'} /> : '—'}
        </TableCell>
        <TableCell>{log.actorUser?.name || log.actorUser?.email || 'System / Public'}</TableCell>
        <TableCell>{log.school?.name || '—'}</TableCell>
        <TableCell>
          <Chip size="small" variant="outlined" label={log.action} />
        </TableCell>
        <TableCell>{log.entityType}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={7} sx={{ py: 0, borderBottom: open ? undefined : 'none' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2 }}>
              <Typography variant="caption" color="textSecondary" display="block">
                Entity ID: {log.entityId || '—'} · IP: {log.ipAddress || '—'}
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
                User Agent: {log.userAgent || '—'}
              </Typography>
              <Box component="pre" sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, fontSize: 12, overflowX: 'auto' }}>
                {JSON.stringify(log.metadata ?? {}, null, 2)}
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function ActivityLogs() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [portalType, setPortalType] = useState('all');
  const [schoolId, setSchoolId] = useState('all');
  const [action, setAction] = useState('all');
  const [actorEmail, setActorEmail] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: schoolsResponse } = useGetSchoolsQuery();
  const schools = schoolsResponse?.data?.items || (Array.isArray(schoolsResponse?.data) ? schoolsResponse.data : []);
  const { data: actionTypesResponse } = useGetAuditActionTypesQuery();
  const actionTypes = actionTypesResponse?.data || [];

  const { data: logsResponse, isFetching } = useGetAuditLogsQuery({
    page: page + 1,
    limit: rowsPerPage,
    ...(portalType !== 'all' && { portalType }),
    ...(schoolId !== 'all' && { schoolId }),
    ...(action !== 'all' && { action }),
    ...(actorEmail && { actorEmail }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo })
  });

  const logs = logsResponse?.data?.items || [];
  const total = logsResponse?.data?.meta?.total || 0;

  const resetPage = (setter) => (value) => {
    setter(value);
    setPage(0);
  };

  return (
    <MainCard title="">
      <Stack spacing={3}>
        <Typography variant="h4">Activity Logs</Typography>

        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <TextField
            select
            label="Portal"
            size="small"
            value={portalType}
            onChange={(e) => resetPage(setPortalType)(e.target.value)}
            sx={{ minWidth: 170 }}
          >
            <MenuItem value="all">All Portals</MenuItem>
            <MenuItem value="SUPERADMIN">Superadmin Portal</MenuItem>
            <MenuItem value="SCHOOL">School Portal</MenuItem>
          </TextField>

          <TextField
            select
            label="School"
            size="small"
            value={schoolId}
            onChange={(e) => resetPage(setSchoolId)(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All Schools</MenuItem>
            {schools.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Action / Module"
            size="small"
            value={action}
            onChange={(e) => resetPage(setAction)(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All Actions</MenuItem>
            {actionTypes.map((a) => (
              <MenuItem key={a} value={a}>{a}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="User Email Contains"
            size="small"
            value={actorEmail}
            onChange={(e) => resetPage(setActorEmail)(e.target.value)}
            sx={{ minWidth: 200 }}
          />

          <TextField
            label="From"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={dateFrom}
            onChange={(e) => resetPage(setDateFrom)(e.target.value)}
          />
          <TextField
            label="To"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={dateTo}
            onChange={(e) => resetPage(setDateTo)(e.target.value)}
          />
        </Stack>

        {isFetching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Time</TableCell>
                  <TableCell>Portal</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>School</TableCell>
                  <TableCell>Activity Type</TableCell>
                  <TableCell>Module</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                        No activity logs found for the selected filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => <LogRow key={log.id} log={log} />)
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[25, 50, 100]}
            />
          </TableContainer>
        )}
      </Stack>
    </MainCard>
  );
}
