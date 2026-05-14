import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useMeQuery } from 'store/auth/authApi';
import { selectIsAuthenticated, logout, setCredentials } from 'store/auth/authSlice';
import { useRefreshMutation } from 'store/auth/authApi';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

// project imports
import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContentStyled from './MainContentStyled';
import Customization from '../Customization';
import Loader from 'ui-component/Loader';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';

import useConfig from 'hooks/useConfig';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// ==============================|| MAIN LAYOUT ||============================== //

export default function MainLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = useSelector((state) => state.auth.token);
  const [refreshTokenTrigger] = useRefreshMutation();

  const { data: userData, error, isLoading: isMeLoading } = useMeQuery(undefined, {
    skip: !token
  });

  useEffect(() => {
    if (!isAuthenticated || (!token && !isMeLoading)) {
      navigate('/pages/login');
    }
  }, [isAuthenticated, token, navigate, isMeLoading]);

  useEffect(() => {
    if (userData) {
      dispatch(setCredentials({ user: userData.data || userData, token }));
    } else if (error) {
      console.error('Me query failed:', error);
      dispatch(logout());
      navigate('/pages/login');
    }
  }, [userData, error, dispatch, navigate, token]);

  // Automatic token refresh every 10 minutes
  useEffect(() => {
    let interval;
    if (isAuthenticated) {
      interval = setInterval(async () => {
        try {
          const result = await refreshTokenTrigger().unwrap();
          if (result.data?.accessToken) {
            dispatch(setCredentials({ 
              user: result.data.user || userData?.data, 
              token: result.data.accessToken 
            }));
          }
        } catch (err) {
          console.error('Auto-refresh failed:', err);
          dispatch(logout());
          navigate('/pages/login');
        }
      }, 10 * 60 * 1000); // 10 minutes
    }
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshTokenTrigger, dispatch, navigate, userData]);

  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const {
    state: { borderRadius, miniDrawer }
  } = useConfig();
  const { menuMaster, menuMasterLoading } = useGetMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened;

  useEffect(() => {
    handlerDrawerOpen(!miniDrawer);
  }, [miniDrawer]);

  useEffect(() => {
    downMD && handlerDrawerOpen(false);
  }, [downMD]);

  // horizontal menu-list bar : drawer

  if (menuMasterLoading || isMeLoading) return <Loader />;

  return (
    <Box sx={{ display: 'flex' }}>
      {/* header */}
      <AppBar enableColorOnDark position="fixed" color="inherit" elevation={0} sx={{ bgcolor: 'background.default' }}>
        <Toolbar sx={{ p: 2 }}>
          <Header />
        </Toolbar>
      </AppBar>

      {/* menu / drawer */}
      <Sidebar />

      {/* main content */}
      <MainContentStyled {...{ borderRadius, open: drawerOpen }}>
        <Box sx={{ ...{ px: { xs: 0 } }, minHeight: 'calc(100vh - 128px)', display: 'flex', flexDirection: 'column' }}>
          {/* breadcrumb */}
          <Breadcrumbs />
          <Outlet />
          <Footer />
        </Box>
      </MainContentStyled>
      <Customization />
    </Box>
  );
}
