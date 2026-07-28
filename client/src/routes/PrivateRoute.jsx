import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from 'contexts/authContext';
import { CircularProgress, Box } from '@mui/material';

export default function PrivateRoute() {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/pages/login" replace />;
}