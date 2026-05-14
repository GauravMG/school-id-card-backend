import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

// third party
import * as yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';
import { useLoginMutation } from 'store/auth/authApi';
import { setCredentials } from 'store/auth/authSlice';
import { apiSlice } from 'store/apiSlice';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// validation schema
const validationSchema = yup.object().shape({
  email: yup.string().email('Must be a valid email').max(255).required('Email is required'),
  password: yup.string().max(255).required('Password is required')
});

// ===============================|| JWT - LOGIN ||=============================== //

export default function AuthLogin() {
  const [checked, setChecked] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading, error }] = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const onSubmit = async (data) => {
    try {
      const response = await login(data).unwrap();
      
      // Reset API state to clear cache (e.g. from previous user)
      dispatch(apiSlice.util.resetApiState());

      dispatch(setCredentials({ 
        user: response?.data?.user, 
        token: response?.data?.accessToken,
        refreshToken: response?.data?.refreshToken
      }));
      toast.success(response?.message || 'Successfully logged in!');
      navigate('/'); 
    } catch (err) {
      console.error('Failed to login', err);
      toast.error(err?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="error">{error?.data?.message || 'Login failed. Please check your credentials.'}</Alert>
        </Box>
      )}

      <CustomFormControl fullWidth error={Boolean(errors.email)}>
        <InputLabel htmlFor="outlined-adornment-email-login">Email Address / Username</InputLabel>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <OutlinedInput {...field} id="outlined-adornment-email-login" type="email" />
          )}
        />
        {errors.email && (
          <FormHelperText error id="standard-weight-helper-text-email-login">
            {errors.email.message}
          </FormHelperText>
        )}
      </CustomFormControl>

      <CustomFormControl fullWidth error={Boolean(errors.password)}>
        <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <OutlinedInput
              {...field}
              id="outlined-adornment-password-login"
              type={showPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    size="large"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
          )}
        />
        {errors.password && (
          <FormHelperText error id="standard-weight-helper-text-password-login">
            {errors.password.message}
          </FormHelperText>
        )}
      </CustomFormControl>

      <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Grid>
          <FormControlLabel
            control={<Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" color="primary" />}
            label="Keep me logged in"
          />
        </Grid>
        {/* <Grid>
          <Typography variant="subtitle1" component={Link} to="#!" sx={{ textDecoration: 'none', color: 'secondary.main' }}>
            Forgot Password?
          </Typography>
        </Grid> */}
      </Grid>
      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button disabled={isLoading} color="secondary" fullWidth size="large" type="submit" variant="contained">
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
        </AnimateButton>
      </Box>
    </form>
  );
}
