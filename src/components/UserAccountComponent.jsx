import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticationService from '../service/AuthenticationService';
import { Box, Card, CardContent, Typography, CircularProgress, CardActions, Button, Avatar, TextField, Snackbar, Alert } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

function UserAccountComponent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' or 'error'

  // Fetch user information from session storage
  useEffect(() => {
    const storedUser = sessionStorage.getItem('authenticatedUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Handle password update
  const handlePasswordUpdate = () => {
    const userId = user.id;
    const passwordUpdateRequest = { oldPassword, newPassword };

    AuthenticationService.updatePassword(userId, passwordUpdateRequest)
      .then(() => {
        setSnackbarMessage('Password updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch(error => {
        setSnackbarMessage('Error updating password: ' + (error.response?.data || 'Unknown error'));
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  };

  // Close the Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ maxWidth: 500, margin: 'auto', mt: 5, p: 2, textAlign: 'center' }}>
      {user.avatarUrl ? (
        <Avatar alt="User Avatar" src={user.avatarUrl} sx={{ width: 100, height: 100, margin: 'auto', mt: 2 }} />
      ) : (
        <Avatar sx={{ width: 100, height: 100, margin: 'auto', mt: 2 }}>
          <PersonIcon fontSize="large" />
        </Avatar>
      )}
      <CardContent>
        <Typography gutterBottom variant="h4" component="div">
          User Account
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Username: {user.username}
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Email: {user.email ? user.email : 'N/A'}
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Change Password
          </Typography>
          <TextField
            label="Old Password"
            type="password"
            fullWidth
            margin="normal"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Box>
      </CardContent>
      <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handlePasswordUpdate}
        >
          Update Password
        </Button>
      </CardActions>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
}

export default UserAccountComponent;
