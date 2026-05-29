// assets
import { IconSchool, IconUsers, IconSchoolBell, IconSettings } from '@tabler/icons-react';

// constant
const icons = {
  IconSchool,
  IconUsers,
  IconSchoolBell,
  IconSettings
};

// ==============================|| UTILITIES MENU ITEMS ||============================== //

const utilities = {
  id: 'utilities',
  title: '',
  type: 'group',
  children: [
    {
      id: 'util-school',
      title: 'Schools',
      type: 'item',
      url: '/schools',
      icon: icons.IconSchool,
      breadcrumbs: false,
      roles: ['SUPERADMIN']
    },
    {
      id: 'util-export-settings',
      title: 'Export Settings',
      type: 'item',
      url: '/export-settings',
      icon: icons.IconSettings,
      breadcrumbs: false,
      roles: ['SUPERADMIN']
    },
    {
      id: 'util-students',
      title: 'Students',
      type: 'item',
      url: '/students',
      icon: icons.IconUsers,
      breadcrumbs: false,
      roles: ['SCHOOL_STAFF']
    },
    {
      id: 'util-staff',
      title: 'Staff',
      type: 'item',
      url: '/staff',
      icon: icons.IconUsers,
      breadcrumbs: false,
      roles: ['SCHOOL_STAFF']
    }
  ]
};

export default utilities;
