import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── Template HTML ────────────────────────────────────────────────────────────
// \${...} in these strings becomes literal ${...} in the DB.
// At render time, new Function('data', ...) evaluates those expressions.

const template1Html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-body, Arial, sans-serif); }
    .card { width: 323px; height: 204px; border: 1.5px solid #e0e0e0; border-radius: 8px; overflow: hidden; background: #fff; }
    .header { background: \${data.school.brandColor}; height: 46px; display: flex; align-items: center; padding: 0 10px; gap: 8px; }
    .logo   { width: 32px; height: 32px; object-fit: contain; background: #fff; border-radius: 4px; padding: 2px; flex-shrink: 0; }
    .htxt   { flex: 1; text-align: center; }
    .hname  { color: #fff; font-size: 10.5px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.4px; font-family: var(--font-header, inherit); }
    .hlbl   { color: rgba(255,255,255,0.8); font-size: 7px; letter-spacing: 1.5px; margin-top: 1px; font-family: var(--font-header, inherit); }
    .body   { display: flex; height: 136px; padding: 8px; gap: 8px; }
    .photo  { width: 103px; height: 112px; object-fit: cover; border-radius: 5px; border: 2.5px solid \${data.school.brandColor}; flex-shrink: 0; }
    .info   { flex: 1; display: flex; flex-direction: column; gap: 3px; padding-top: 1px; }
    .sname  { font-size: 11.5px; font-weight: bold; color: \${data.school.brandColor}; border-bottom: 1.5px solid \${data.school.brandColor}33; padding-bottom: 3px; margin-bottom: 1px; font-family: var(--font-name, inherit); }
    .row    { display: flex; font-size: 8.5px; }
    .lbl    { color: #999; min-width: 44px; flex-shrink: 0; font-family: var(--font-label, inherit); }
    .val    { font-weight: 600; color: #222; }
    .foot   { background: \${data.school.brandColor}12; border-top: 1px solid \${data.school.brandColor}22; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 7.5px; color: #777; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      \${data.school.logoUrl ? '<img class="logo" src="' + data.school.logoUrl + '" />' : ''}
      <div class="htxt">
        <div class="hname fit-text">\${data.school.name}</div>
        <div class="hlbl">STUDENT IDENTITY CARD</div>
      </div>
    </div>
    <div class="body">
      <img class="photo" src="\${data.student.compositeUrl || ''}" />
      <div class="info">
        <div class="sname fit-text">\${data.student.fullName}</div>
        <div class="row"><span class="lbl">Roll No</span><span class="val fit-text">\${data.student.rollNumber}</span></div>
        <div class="row"><span class="lbl">Class</span><span class="val fit-text">\${data.student.classValue} – \${data.student.sectionValue}</span></div>
        \${data.student.admissionNumber ? '<div class="row"><span class="lbl">Adm. No</span><span class="val fit-text">' + data.student.admissionNumber + '</span></div>' : ''}
        \${data.student.dateOfBirth ? '<div class="row"><span class="lbl">D.O.B</span><span class="val fit-text">' + new Date(data.student.dateOfBirth).toLocaleDateString("en-GB") + '</span></div>' : ''}
        \${data.student.bloodGroup ? '<div class="row"><span class="lbl">Blood</span><span class="val fit-text">' + data.student.bloodGroup + '</span></div>' : ''}
        \${data.student.stream ? '<div class="row"><span class="lbl">Stream</span><span class="val fit-text">' + ({ARTS:'Arts',COMMERCE:'Commerce',SCIENCE_MEDICAL:'Science (Medical)',SCIENCE_NON_MEDICAL:'Science (Non-Medical)'})[data.student.stream] + '</span></div>' : ''}
        \${data.student.fatherName ? '<div class="row"><span class="lbl">Father</span><span class="val fit-text">' + data.student.fatherName + '</span></div>' : ''}
        \${data.student.guardianPhone ? '<div class="row"><span class="lbl">Phone</span><span class="val fit-text">' + data.student.guardianPhone + '</span></div>' : ''}
        \${data.student.commuteMode ? (function(){var i={SELF:'<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="6" cy="17" r="3.2"/><circle cx="18" cy="17" r="3.2"/><path d="M6 17l4-7h5l3 7M10 10l2-3h3"/></svg>',WITH_PARENT:'<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="8" cy="6" r="2.6"/><circle cx="17" cy="9" r="2.1"/><path d="M3 20v-2a5 5 0 015-5h0a5 5 0 015 5v2M14 20v-1.5a3.3 3.3 0 013.3-3.3h0a3.3 3.3 0 013.3 3.3V20"/></svg>',SCHOOL_TRANSPORT:'<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="5" width="18" height="12" rx="2.5"/><path d="M3 11h18M7 17v2M17 17v2"/></svg>'};var l={SELF:'Self',WITH_PARENT:'With Parent',SCHOOL_TRANSPORT:'School Transport'};return '<div class="row"><span class="lbl">Commute</span><span class="val fit-text" style="display:inline-flex;align-items:center;gap:3px;">'+i[data.student.commuteMode]+l[data.student.commuteMode]+'</span></div>';})() : ''}
      </div>
    </div>
    <div class="foot fit-text">\${data.school.phone} &nbsp;|&nbsp; \${data.school.address}</div>
  </div>
</body>
</html>`;

const template2Html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-body, Arial, sans-serif); }
    .card    { width: 323px; height: 204px; display: flex; overflow: hidden; background: #fff; border: 1.5px solid #e0e0e0; border-radius: 8px; }
    .sidebar { width: 92px; background: \${data.school.brandColor}; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; padding: 10px 6px; gap: 5px; }
    .slogo   { width: 38px; height: 38px; object-fit: contain; background: #fff; border-radius: 50%; padding: 3px; }
    .sname   { color: rgba(255,255,255,0.92); font-size: 7px; text-align: center; font-weight: bold; text-transform: uppercase; letter-spacing: 0.3px; line-height: 1.35; font-family: var(--font-header, inherit); }
    .sphoto  { width: 76px; height: 82px; object-fit: cover; border-radius: 6px; border: 2px solid rgba(255,255,255,0.45); margin-top: auto; }
    .right   { flex: 1; display: flex; flex-direction: column; padding: 10px; background: #fafafa; }
    .badge   { display: inline-block; background: \${data.school.brandColor}; color: #fff; font-size: 6.5px; padding: 1.5px 6px; border-radius: 2px; font-weight: bold; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 4px; align-self: flex-start; }
    .rname   { font-size: 12px; font-weight: bold; color: #111; border-bottom: 2px solid \${data.school.brandColor}; padding-bottom: 4px; margin-bottom: 5px; line-height: 1.2; font-family: var(--font-name, inherit); }
    .grid    { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 6px; }
    .field   { font-size: 8px; }
    .flbl    { color: #aaa; font-size: 6.5px; text-transform: uppercase; letter-spacing: 0.3px; font-family: var(--font-label, inherit); }
    .fval    { color: #1a1a1a; font-weight: 600; }
    .ffoot   { margin-top: auto; font-size: 7px; color: #bbb; border-top: 1px solid #eee; padding-top: 4px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="sidebar">
      \${data.school.logoUrl ? '<img class="slogo" src="' + data.school.logoUrl + '" />' : ''}
      <div class="sname">\${data.school.name}</div>
      <img class="sphoto" src="\${data.student.compositeUrl || ''}" />
    </div>
    <div class="right">
      <div class="badge">Identity Card</div>
      <div class="rname fit-text">\${data.student.fullName}</div>
      <div class="grid">
        <div class="field"><div class="flbl">Roll No</div><div class="fval fit-text">\${data.student.rollNumber}</div></div>
        <div class="field"><div class="flbl">Class / Sec</div><div class="fval fit-text">\${data.student.classValue} / \${data.student.sectionValue}</div></div>
        \${data.student.admissionNumber ? '<div class="field"><div class="flbl">Adm. No</div><div class="fval fit-text">' + data.student.admissionNumber + '</div></div>' : ''}
        \${data.student.bloodGroup ? '<div class="field"><div class="flbl">Blood Group</div><div class="fval fit-text">' + data.student.bloodGroup + '</div></div>' : ''}
        \${data.student.dateOfBirth ? '<div class="field"><div class="flbl">Date of Birth</div><div class="fval fit-text">' + new Date(data.student.dateOfBirth).toLocaleDateString("en-GB") + '</div></div>' : ''}
        \${data.student.stream ? '<div class="field"><div class="flbl">Stream</div><div class="fval fit-text">' + ({ARTS:'Arts',COMMERCE:'Commerce',SCIENCE_MEDICAL:'Science (Medical)',SCIENCE_NON_MEDICAL:'Science (Non-Medical)'})[data.student.stream] + '</div></div>' : ''}
        \${data.student.fatherName ? '<div class="field"><div class="flbl">Father</div><div class="fval fit-text">' + data.student.fatherName + '</div></div>' : ''}
        \${data.student.guardianPhone ? '<div class="field"><div class="flbl">Contact</div><div class="fval fit-text">' + data.student.guardianPhone + '</div></div>' : ''}
        \${data.student.commuteMode ? (function(){var i={SELF:'<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="6" cy="17" r="3.2"/><circle cx="18" cy="17" r="3.2"/><path d="M6 17l4-7h5l3 7M10 10l2-3h3"/></svg>',WITH_PARENT:'<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="8" cy="6" r="2.6"/><circle cx="17" cy="9" r="2.1"/><path d="M3 20v-2a5 5 0 015-5h0a5 5 0 015 5v2M14 20v-1.5a3.3 3.3 0 013.3-3.3h0a3.3 3.3 0 013.3 3.3V20"/></svg>',SCHOOL_TRANSPORT:'<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="5" width="18" height="12" rx="2.5"/><path d="M3 11h18M7 17v2M17 17v2"/></svg>'};var l={SELF:'Self',WITH_PARENT:'With Parent',SCHOOL_TRANSPORT:'School Transport'};return '<div class="field"><div class="flbl">Commute</div><div class="fval fit-text" style="display:inline-flex;align-items:center;gap:2px;">'+i[data.student.commuteMode]+l[data.student.commuteMode]+'</div></div>';})() : ''}
      </div>
      <div class="ffoot fit-text">\${data.school.address} | \${data.school.phone}</div>
    </div>
  </div>
</body>
</html>`;

const template3Html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-body, Arial, sans-serif); }
    .card  { width: 323px; height: 204px; overflow: hidden; background: #fff; border-radius: 8px; border: 1.5px solid #ddd; }
    .hdr   { height: 50px; background: \${data.school.brandColor}; display: flex; align-items: center; padding: 0 12px; gap: 10px; position: relative; overflow: hidden; }
    .hdr::after  { content: ''; position: absolute; right: -20px; top: -20px; width: 80px; height: 80px; background: rgba(255,255,255,0.08); border-radius: 50%; }
    .hdr::before { content: ''; position: absolute; right: 20px; bottom: -30px; width: 60px; height: 60px; background: rgba(255,255,255,0.06); border-radius: 50%; }
    .hlogo { width: 36px; height: 36px; object-fit: contain; background: #fff; border-radius: 6px; padding: 3px; flex-shrink: 0; }
    .hinfo { flex: 1; }
    .hname { color: #fff; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; font-family: var(--font-header, inherit); }
    .hsub  { color: rgba(255,255,255,0.75); font-size: 7.5px; margin-top: 1px; letter-spacing: 0.8px; font-family: var(--font-header, inherit); }
    .body  { display: flex; height: 130px; }
    .pcol  { width: 90px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: \${data.school.brandColor}0d; border-right: 1px solid \${data.school.brandColor}22; }
    .photo { width: 89px; height: 96px; object-fit: cover; border-radius: 6px; border: 2.5px solid \${data.school.brandColor}; }
    .icol  { flex: 1; padding: 8px 10px; display: flex; flex-direction: column; gap: 3.5px; }
    .iname { font-size: 12px; font-weight: bold; color: #111; border-bottom: 1.5px solid \${data.school.brandColor}; padding-bottom: 3px; margin-bottom: 1px; font-family: var(--font-name, inherit); }
    .row   { display: flex; align-items: baseline; gap: 3px; font-size: 8.5px; }
    .lbl   { color: #aaa; min-width: 44px; flex-shrink: 0; font-size: 7.5px; font-family: var(--font-label, inherit); }
    .val   { font-weight: 600; color: #222; }
    .foot  { height: 24px; background: \${data.school.brandColor}; display: flex; align-items: center; justify-content: space-between; padding: 0 10px; }
    .fid   { color: rgba(255,255,255,0.9); font-size: 8px; font-weight: bold; font-family: monospace; letter-spacing: 1px; }
    .ftel  { color: rgba(255,255,255,0.7); font-size: 7px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="hdr">
      \${data.school.logoUrl ? '<img class="hlogo" src="' + data.school.logoUrl + '" />' : ''}
      <div class="hinfo">
        <div class="hname fit-text">\${data.school.name}</div>
        <div class="hsub">STUDENT IDENTITY CARD</div>
      </div>
    </div>
    <div class="body">
      <div class="pcol">
        <img class="photo" src="\${data.student.compositeUrl || ''}" />
      </div>
      <div class="icol">
        <div class="iname fit-text">\${data.student.fullName}</div>
        <div class="row"><span class="lbl">Roll No</span><span class="val fit-text">\${data.student.rollNumber}</span></div>
        <div class="row"><span class="lbl">Class</span><span class="val fit-text">\${data.student.classValue} – \${data.student.sectionValue}</span></div>
        \${data.student.admissionNumber ? '<div class="row"><span class="lbl">Adm. No</span><span class="val fit-text">' + data.student.admissionNumber + '</span></div>' : ''}
        \${data.student.dateOfBirth ? '<div class="row"><span class="lbl">D.O.B</span><span class="val fit-text">' + new Date(data.student.dateOfBirth).toLocaleDateString("en-GB") + '</span></div>' : ''}
        \${data.student.bloodGroup ? '<div class="row"><span class="lbl">Blood</span><span class="val fit-text">' + data.student.bloodGroup + '</span></div>' : ''}
        \${data.student.stream ? '<div class="row"><span class="lbl">Stream</span><span class="val fit-text">' + ({ARTS:'Arts',COMMERCE:'Commerce',SCIENCE_MEDICAL:'Science (Medical)',SCIENCE_NON_MEDICAL:'Science (Non-Medical)'})[data.student.stream] + '</span></div>' : ''}
        \${data.student.fatherName ? '<div class="row"><span class="lbl">Father</span><span class="val fit-text">' + data.student.fatherName + '</span></div>' : ''}
        \${data.student.guardianPhone ? '<div class="row"><span class="lbl">Phone</span><span class="val fit-text">' + data.student.guardianPhone + '</span></div>' : ''}
        \${data.student.commuteMode ? (function(){var i={SELF:'<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="6" cy="17" r="3.2"/><circle cx="18" cy="17" r="3.2"/><path d="M6 17l4-7h5l3 7M10 10l2-3h3"/></svg>',WITH_PARENT:'<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="8" cy="6" r="2.6"/><circle cx="17" cy="9" r="2.1"/><path d="M3 20v-2a5 5 0 015-5h0a5 5 0 015 5v2M14 20v-1.5a3.3 3.3 0 013.3-3.3h0a3.3 3.3 0 013.3 3.3V20"/></svg>',SCHOOL_TRANSPORT:'<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="5" width="18" height="12" rx="2.5"/><path d="M3 11h18M7 17v2M17 17v2"/></svg>'};var l={SELF:'Self',WITH_PARENT:'With Parent',SCHOOL_TRANSPORT:'School Transport'};return '<div class="row"><span class="lbl">Commute</span><span class="val fit-text" style="display:inline-flex;align-items:center;gap:3px;">'+i[data.student.commuteMode]+l[data.student.commuteMode]+'</span></div>';})() : ''}
      </div>
    </div>
    <div class="foot">
      <div class="fid">ID: \${data.student.rollNumber}</div>
      <div class="ftel">\${data.school.phone}</div>
    </div>
  </div>
</body>
</html>`;

// ─── Seed ─────────────────────────────────────────────────────────────────────
async function main() {
    const passwordHash = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD || 'Admin@12345', 10);

    await prisma.user.upsert({
        where:  { email: process.env.SUPERADMIN_EMAIL || 'superadmin@yopmail.com' },
        update: {},
        create: {
            name: 'Super Admin',
            email: process.env.SUPERADMIN_EMAIL || 'superadmin@yopmail.com',
            passwordHash,
            role: UserRole.SUPERADMIN
        }
    });

    const templates = [
        {
            id: 'template-1',
            name: 'Classic',
            description: 'Traditional horizontal card: coloured header, photo left, details right, footer bar.',
            htmlContent: template1Html,
            sortOrder: 1
        },
        {
            id: 'template-2',
            name: 'Sidebar',
            description: 'Modern layout with a coloured left sidebar holding the school logo, name and photo.',
            htmlContent: template2Html,
            sortOrder: 2
        },
        {
            id: 'template-3',
            name: 'Accent Column',
            description: 'Premium design with a tinted photo column and branded header and footer strip.',
            htmlContent: template3Html,
            sortOrder: 3
        }
    ];

    for (const t of templates) {
        await prisma.cardTemplate.upsert({
            where:  { id: t.id },
            update: { name: t.name, description: t.description, htmlContent: t.htmlContent, sortOrder: t.sortOrder },
            create: t
        });
        console.log(`Seeded template: ${t.id} (${t.name})`);
    }

    console.log('Seed complete');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
