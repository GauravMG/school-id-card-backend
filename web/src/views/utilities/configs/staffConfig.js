export const staffColumns = [
  { id: 'name', label: 'Name', type: 'text' },
  { id: 'email', label: 'Email ID', type: 'text' },
  { id: 'role', label: 'Role', type: 'text' }
];

export const staffFields = [
  { type: 'separator', label: 'Basic Information' },
  { name: 'name', label: 'Full Name', type: 'text', required: true },
  { name: 'email', label: 'Email ID', type: 'email', required: true, disabledInEdit: true },
  { type: 'separator', label: 'Account Security', hideInEdit: true },
  { name: 'password', label: 'Password', type: 'password', required: true, hideInEdit: true },
];
