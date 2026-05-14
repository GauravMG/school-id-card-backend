// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useReturnToAdminMutation } from 'store/auth/authApi';
import { selectCurrentUser, selectCurrentToken, setCredentials } from 'store/auth/authSlice';
import { apiSlice } from 'store/apiSlice';
import toast from 'react-hot-toast';

// project imports
import LogoSection from '../LogoSection';
import SearchSection from './SearchSection';
import ProfileSection from './ProfileSection';
import NotificationSection from './NotificationSection';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// assets
import { IconMenu2, IconArrowLeft } from '@tabler/icons-react';
import React from 'react';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

export default function Header() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const [returnToAdminApi, { isLoading }] = useReturnToAdminMutation();

  const isImpersonating = React.useMemo(() => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return !!payload.originalSuperAdminId;
    } catch (e) {
      return false;
    }
  }, [token]);

  const handleReturnToAdmin = async () => {
    try {
      const response = await returnToAdminApi().unwrap();

      // Reset API state
      dispatch(apiSlice.util.resetApiState());

      dispatch(setCredentials({
        user: response.data.user,
        token: response.data.accessToken
      }));
      toast.success(response?.message || 'Returned to admin');
      navigate('/schools');
    } catch (err) {
      console.error('Return to admin failed:', err);
      toast.error(err?.data?.message || 'Return to admin failed');
    }
  };

  return (
    <>
      {/* logo & toggler button */}
      <Box sx={{ width: downMD ? 'auto' : 228, display: 'flex' }}>
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box>
        <Avatar
          variant="rounded"
          sx={{
            ...theme.typography.commonAvatar,
            ...theme.typography.mediumAvatar,
            overflow: 'hidden',
            transition: 'all .2s ease-in-out',
            color: theme.vars.palette.secondary.dark,
            background: theme.vars.palette.secondary.light,
            '&:hover': {
              color: theme.vars.palette.secondary.light,
              background: theme.vars.palette.secondary.dark
            }
          }}
          onClick={() => handlerDrawerOpen(!drawerOpen)}
        >
          <IconMenu2 stroke={1.5} size="20px" />
        </Avatar>
      </Box>

      {/* header search */}
      {/* <SearchSection /> */}
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ flexGrow: 1 }} />

      {/* notification */}
      {/* <NotificationSection /> */}

      {/* return to super admin button */}
      {isImpersonating && (
        <Button
          variant="contained"
          color="error"
          size="small"
          startIcon={<IconArrowLeft size="16px" />}
          onClick={handleReturnToAdmin}
          disabled={isLoading}
          sx={{
            mx: 2,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            px: 2,
            height: '34px',
            bgcolor: theme.palette?.error?.main || '#f44336',
            '&:hover': {
              bgcolor: theme.palette?.error?.dark || '#d32f2f'
            }
          }}
        >
          Return to Admin
        </Button>
      )}

      {/* profile */}
      <ProfileSection />
    </>
  );
}
