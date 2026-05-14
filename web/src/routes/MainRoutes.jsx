import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from 'store/auth/authSlice';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import RoleGuard from 'ui-component/RoleGuard';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
const Schools = Loadable(lazy(() => import('views/utilities/Schools')));
const Students = Loadable(lazy(() => import('views/utilities/Students')));
const Staff = Loadable(lazy(() => import('views/utilities/Staff')));
// const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));

// sample page routing
// const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const LandingPage = () => {
  const user = useSelector(selectCurrentUser);
  if (!user) return null; // Wait for user to load in MainLayout
  return <Navigate to={user.role === 'SUPERADMIN' ? '/schools' : '/staff'} replace />;
};

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <LandingPage />
    },
    {
      path: 'schools',
      element: (
        <RoleGuard allowedRoles={['SUPERADMIN']}>
          <Schools />
        </RoleGuard>
      )
    },
    {
      path: 'staff',
      element: <Staff />
    },
    {
      path: 'students',
      element: <Students />
    }
  ]
};

export default MainRoutes;
