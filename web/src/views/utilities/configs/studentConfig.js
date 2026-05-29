export const studentColumns = [
  { id: 'photo', label: 'Photo', type: 'student-photo' },
  { id: 'firstName', label: 'First Name', type: 'text' },
  { id: 'lastName', label: 'Last Name', type: 'text' },
  { id: 'rollNumber', label: 'Roll Number', type: 'text' },
  { id: 'classValue', label: 'Class', type: 'text' },
  { id: 'sectionValue', label: 'Section', type: 'text' },
  { id: 'status', label: "Status", type: 'text' },
];

export const MASTER_CLASSES = [
  'NURSERY', 'LKG', 'UKG',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
];

export const MASTER_SECTIONS = ['A', 'B', 'C', 'D', 'E'];

export const studentFields = [
  { name: 'firstName', label: 'First Name', type: 'text', required: true },
  { name: 'lastName', label: 'Last Name', type: 'text', required: false },
  { name: 'rollNumber', label: 'Roll Number', type: 'text', required: true },
  { name: 'admissionNumber', label: 'Admission Number', type: 'text', required: false },
  { 
    name: 'gender', 
    label: 'Gender', 
    type: 'select', 
    required: true,
    options: [
      { value: 'MALE', label: 'Male' },
      { value: 'FEMALE', label: 'Female' },
      { value: 'OTHER', label: 'Other' }
    ]
  },
  { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: false },
  { 
    name: 'classValue', 
    label: 'Class', 
    type: 'select', 
    required: true,
    options: MASTER_CLASSES.map(c => ({ value: c, label: c }))
  },
  { 
    name: 'sectionValue', 
    label: 'Section', 
    type: 'select', 
    required: true,
    options: MASTER_SECTIONS.map(s => ({ value: s, label: s }))
  },
  { type: 'separator', label: 'Contact & Other Details' },
  { name: 'fatherName', label: "Father's Name", type: 'text', required: false },
  { name: 'motherName', label: "Mother's Name", type: 'text', required: false },
  { name: 'guardianPhone', label: "Guardian Phone Number", type: 'text', required: false },
  { name: 'emergencyPhone', label: "Emergency Phone Number", type: 'text', required: false },
  { name: 'address', label: "Address", type: 'text', required: false },
  { name: 'bloodGroup', label: "Blood Group", type: 'text', required: false },
  { name: 'transportRoute', label: "Transport Route", type: 'text', required: false },
];
