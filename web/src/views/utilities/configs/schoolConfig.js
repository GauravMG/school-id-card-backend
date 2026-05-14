export const schoolColumns = [
  { id: 'name', label: 'School Name', type: 'text' },
  { id: 'contactPerson', label: 'Contact Person', type: 'text' },
  { id: 'email', label: 'School Email', type: 'text' },
  { id: 'publicSlug', label: 'Public Slug', type: 'text' },
  { id: 'publicLink', label: 'Public Link', type: 'copy-link' },
];

export const schoolFields = [
  { name: 'name', label: 'School Name', type: 'text', required: true },
  { name: 'contactPerson', label: 'Contact Person', type: 'text', required: true },
  { name: 'email', label: 'School Email', type: 'email', required: true, disabledInEdit: true },
  { name: 'phone', label: 'Phone Number', type: 'text', required: true },
  { name: 'address', label: 'Address', type: 'text', required: true },
  { name: 'brandColor', label: 'Brand Color', type: 'color', required: true, defaultValue: '#1e88e5' },
  { name: 'secondaryColor', label: 'Secondary Color', type: 'color', required: false, defaultValue: '#e11d48' },
  {
    name: 'selectedTemplateId',
    label: 'ID Card Template',
    type: 'template-picker',
    required: true,
  },
  { name: 'uniformBoy', label: 'Boy Uniform Image', type: 'image-upload', required: false },
  { name: 'uniformGirl', label: 'Girl Uniform Image', type: 'image-upload', required: false },
  { type: 'separator', label: 'First Staff Member Details (For New Schools)', hideInEdit: true },
  { name: 'staffName', label: 'Admin Name', type: 'text', required: false },
  { name: 'staffEmail', label: 'Admin Email', type: 'email', required: false, disabledInEdit: true },
  { name: 'staffPassword', label: 'Admin Password', type: 'password', required: false, hideInEdit: true },
];
