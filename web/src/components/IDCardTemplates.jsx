import React from 'react';
import { Box, Typography, Stack, Grid, Divider } from '@mui/material';

export default function IDCardTemplates({ formData, templateType, color, logoUrl, schoolName }) {
  const { firstName, lastName, rollNumber, dateOfBirth, bloodGroup, emergencyPhone, photo, classValue, sectionValue } = formData;
  
  const bgColor = color || '#1e88e5'; 
  const tType = templateType || 'template1';
  const sName = schoolName || 'STUDENT ID';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };

  const formattedDOB = formatDate(dateOfBirth);

  const renderStudentAvatar = (size = 130, extraProps = {}) => {
    return (
      <Box 
        sx={{ 
          width: size, 
          height: size + 20, 
          borderRadius: extraProps.variant === 'rounded' ? 2 : '50%', 
          overflow: 'hidden', 
          position: 'relative',
          bgcolor: '#fff',
          border: '4px solid #fff',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          ...extraProps.sx
        }}
      >
        <Box 
          component="img"
          src={photo || '/assets/images/users/user-round.svg'}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
          }}
          onError={(e) => { e.target.src = '/assets/images/users/user-round.svg'; }}
        />
      </Box>
    );
  };

  const renderBackSide = () => (
    <Box 
      sx={{ 
        width: 320, 
        height: 500, 
        bgcolor: '#ffffff', 
        borderRadius: 4, 
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${bgColor}`
      }}
    >
      <Box sx={{ bgcolor: bgColor, color: 'white', py: 1.5, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5 }}>
          Terms & Conditions
        </Typography>
      </Box>
      <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>1. This card is the property of <b>{sName}</b> and must be returned upon request.</Typography>
        <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>2. If lost, report immediately to the school administration.</Typography>
        <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>3. The student must wear this ID card at all times while on school premises.</Typography>
        <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>4. This card is non-transferable and remains valid for the current academic session.</Typography>
        
        <Box sx={{ mt: 'auto', textAlign: 'center', pb: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
            Emergency Contact: {emergencyPhone || 'N/A'}
          </Typography>
          <Box sx={{ mt: 3, borderTop: '1px solid #94a3b8', pt: 1, width: '70%', mx: 'auto' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Authorized Signature</Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ bgcolor: bgColor, height: 12 }} />
    </Box>
  );

  const renderFront1 = () => (
    <Box sx={{ width: 320, height: 500, bgcolor: 'white', borderRadius: 4, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ bgcolor: bgColor, color: 'white', px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 2, height: 110, position: 'relative' }}>
        {logoUrl && (
          <Box sx={{ height: 65, width: 65, bgcolor: 'white', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0.5, boxShadow: 3, flexShrink: 0 }}>
            <Box component="img" src={logoUrl} sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          </Box>
        )}
        <Typography variant="h6" sx={{ fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.2, fontSize: '1.1rem', flexGrow: 1 }}>
          {sName}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: -6, zIndex: 2 }}>
        {renderStudentAvatar(140)}
      </Box>

      <Box sx={{ p: 3, textAlign: 'center', flexGrow: 1 }}>
        <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: 1 }}>
          {firstName} {lastName}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: bgColor, fontWeight: 700, mb: 3, letterSpacing: 2 }}>
          STUDENT
        </Typography>

        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <Grid container sx={{ textAlign: 'left', px: 2 }}>
            <Grid item xs={5}><Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Roll No:</Typography></Grid>
            <Grid item xs={7}><Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>{rollNumber}</Typography></Grid>
          </Grid>
          <Grid container sx={{ textAlign: 'left', px: 2 }}>
            <Grid item xs={5}><Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Class:</Typography></Grid>
            <Grid item xs={7}><Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>{classValue} - {sectionValue}</Typography></Grid>
          </Grid>
          <Grid container sx={{ textAlign: 'left', px: 2 }}>
            <Grid item xs={5}><Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>DOB:</Typography></Grid>
            <Grid item xs={7}><Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>{formattedDOB}</Typography></Grid>
          </Grid>
          <Grid container sx={{ textAlign: 'left', px: 2 }}>
            <Grid item xs={5}><Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Blood Group:</Typography></Grid>
            <Grid item xs={7}><Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>{bloodGroup || 'N/A'}</Typography></Grid>
          </Grid>
        </Stack>
      </Box>
      <Box sx={{ bgcolor: bgColor, height: 15 }} />
    </Box>
  );

  const getFront = () => {
    switch (tType) {
      default: return renderFront1();
    }
  };

  return (
    <Grid container spacing={4} justifyContent="center">
      <Grid item>
        <Typography variant="subtitle2" align="center" sx={{ mb: 2, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>Front Side</Typography>
        <div className="id-card-canvas id-card-front">
          {getFront()}
        </div>
      </Grid>
      <Grid item>
        <Typography variant="subtitle2" align="center" sx={{ mb: 2, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>Back Side</Typography>
        <div className="id-card-canvas id-card-back">
          {renderBackSide()}
        </div>
      </Grid>
    </Grid>
  );
}
