// material-ui
import { useTheme } from '@mui/material/styles';

// project imports

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

// ==============================|| LOGO SVG ||============================== //

export default function Logo() {
  return (
    <img src="/assets/Student-id-card-logo.png" alt="Student ID Card" style={{ width: 'auto', height: '45px', objectFit: 'contain' }} />
  );
}
