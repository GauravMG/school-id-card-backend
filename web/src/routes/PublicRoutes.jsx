import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';

// public forms routing
const StudentIdForm = Loadable(lazy(() => import('views/pages/public-form/StudentIdForm')));

// ==============================|| PUBLIC ROUTING ||============================== //

const PublicRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '/public/:slug',
      element: <StudentIdForm />
    }
  ]
};

export default PublicRoutes;
