export const cardTemplate5 = (data: any) => `
<!doctype html>
<html>
<head>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; }
    .card {
      width: 323px;
      height: 204px;
      border: 1px solid #ccc;
      overflow: hidden;
      position: relative;
      background: white;
    }
    .header {
      background: ${data.school.brandColor};
      color: white;
      padding: 8px;
      text-align: center;
      font-size: 14px;
      font-weight: bold;
    }
    .content {
      display: flex;
      gap: 8px;
      padding: 8px;
    }
    .left img { width: 90px; height: 110px; object-fit: cover; border-radius: 6px; }
    .right { font-size: 11px; line-height: 1.4; }
    .uniform {
      position: absolute;
      bottom: 8px;
      right: 8px;
      width: 55px;
      height: 70px;
      object-fit: cover;
      opacity: 0.95;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">${data.school.name}</div>
    <div class="content">
      <div class="left">
        <img src="${data.student.photoUrl || data.student.compositeUrl || ''}" />
      </div>
      <div class="right">
        <div><strong>Name:</strong> ${data.student.fullName}</div>
        <div><strong>Roll:</strong> ${data.student.rollNumber}</div>
        <div><strong>Class:</strong> ${data.student.classValue}</div>
        <div><strong>Section:</strong> ${data.student.sectionValue}</div>
        <div><strong>Father:</strong> ${data.student.fatherName || ''}</div>
        <div><strong>Phone:</strong> ${data.student.guardianPhone || ''}</div>
      </div>
    </div>
    ${data.uniformUrl ? `<img class="uniform" src="${data.uniformUrl}" />` : ''}
  </div>
</body>
</html>
`;