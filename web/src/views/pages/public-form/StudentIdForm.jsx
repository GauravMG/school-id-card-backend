import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, Card, CardContent, Container, Step, StepLabel, Stepper, Typography, Stack } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// project components
import StepDetails from './StepDetails';
import StepCamera from './StepCamera';
import StepPreview from './StepPreview';
import { useGetPublicSchoolQuery } from 'store/api/publicApi';
import Loader from 'ui-component/Loader';

const steps = ['Personal Details', 'Capture Photo', 'Preview ID Card'];

export default function StudentIdForm() {
  const theme = useTheme();
  const { slug } = useParams();

  const { data: schoolResponse, isLoading: isSchoolLoading, error: schoolError } = useGetPublicSchoolQuery(slug);
  const school = schoolResponse?.data;

  const [activeStep, setActiveStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    rollNumber: '',
    admissionNumber: '',
    gender: 'MALE',
    dateOfBirth: '',
    classValue: '',
    sectionValue: '',
    fatherName: '',
    motherName: '',
    guardianPhone: '',
    emergencyPhone: '',
    address: '',
    bloodGroup: '',
    transportRoute: '',
    photo: null
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (['guardianPhone', 'emergencyPhone', 'rollNumber', 'admissionNumber'].includes(name)) {
      value = value.replace(/\D/g, ''); // Allow only digits
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoCapture = (photoDataUrl) => {
    setFormData((prev) => ({ ...prev, photo: photoDataUrl }));
  };

  const handleSubmit = () => {
    // Here we would typically send data to the backend API
    // For now, we just show the success screen
    setSubmitted(true);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <StepDetails formData={formData} setFormData={setFormData} handleChange={handleChange} onNext={handleNext} school={school} slug={slug} />;
      case 1:
        return <StepCamera photo={formData.photo} onCapture={handlePhotoCapture} onNext={handleNext} onBack={handleBack} studentId={formData.id}
          schoolId={school?.id} gender={formData.gender} school={school} 
          uniformBoyUrl={school?.uniformBoyFile?.publicUrl ? `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '')}${school?.uniformBoyFile?.publicUrl}` : ''}
          uniformGirlUrl={school?.uniformGirlFile?.publicUrl ? `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '')}${school?.uniformGirlFile?.publicUrl}` : ''}
        />;
      case 2:
        return <StepPreview formData={formData} onBack={handleBack} onSubmit={handleSubmit} slug={slug} school={school} />;
      default:
        return 'Unknown step';
    }
  };

  if (isSchoolLoading) return <Loader />;

  if (schoolError || !school) {
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Card elevation={4} sx={{ borderRadius: 3, textAlign: 'center', p: 4, border: '2px solid #ff1744' }}>
          <Typography variant="h2" color="error" gutterBottom>
            Invalid Link
          </Typography>
          <Typography variant="h5" sx={{ mb: 3 }}>
            The school registration link you are using is invalid or has expired.
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
            Please contact your school administration to get the correct registration link for <strong>{slug}</strong>.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.href = '/'}
          >
            Go to Homepage
          </Button>
        </Card>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Card elevation={4} sx={{ borderRadius: 3, textAlign: 'center', p: 4 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 80, mb: 2, color: school?.brandColor || 'success.main' }} />
          <Typography variant="h3" sx={{ color: school?.brandColor || 'primary.main', mb: 1 }} gutterBottom>
            Thank You!
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Your details for <strong>{school?.name}</strong> have been submitted successfully.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
            The school administration will review your details and process your physical ID card shortly.
          </Typography>
          <Button
            variant="contained"
            sx={{ bgcolor: school?.brandColor || 'primary.main', '&:hover': { bgcolor: school?.secondaryColor || school?.brandColor } }}
            onClick={() => window.location.reload()}
          >
            Submit Another Request
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card elevation={4} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          <Stack spacing={4}>
            <Box textAlign="center">
              {school?.logoFile?.publicUrl && (
                <Box component="img"
                  crossOrigin="anonymous"
                  src={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '')}${school.logoFile.publicUrl}`}
                  sx={{ height: 80, mb: 2, maxWidth: '100%', objectFit: 'contain' }}
                  alt={school.name}
                />
              )}
              <Typography variant="h2" sx={{ color: school?.brandColor || 'primary.main', mb: 1 }} gutterBottom>
                {school?.name}
              </Typography>
              <Typography variant="h4" color="textSecondary" gutterBottom>
                Student ID Registration
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Please complete all steps to generate your digital ID card.
              </Typography>
            </Box>

            <Stepper
              activeStep={activeStep}
              alternativeLabel
              sx={{
                '& .MuiStepIcon-root.Mui-active': { color: school?.brandColor },
                '& .MuiStepIcon-root.Mui-completed': { color: school?.brandColor }
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mt: 4 }}>
              {getStepContent(activeStep)}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
