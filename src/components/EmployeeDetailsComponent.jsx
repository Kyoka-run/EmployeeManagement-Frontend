import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeDataService from '../service/EmployeeDataService';
import { Card, CardContent, Typography, CircularProgress, Box, CardActions, Button, CardMedia, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

function EmployeeDetailsComponent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);

  // Fetch employee details
  useEffect(() => {
    EmployeeDataService.retrieveEmployee(id)
      .then(response => {
        setEmployee(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the employee details!', error);
      });
  }, [id]);

  // Show loading spinner while employee data is being fetched
  if (!employee) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ maxWidth: 500, margin: 'auto', mt: 5, p: 2, textAlign: 'center' }}>
      {employee.avatarUrl ? (
        <CardMedia
          component="img"
          alt="Employee Avatar"
          height="200"
          image={employee.avatarUrl}
          sx={{ maxWidth: 150, margin: 'auto' }}
        />
      ) : (
        <Avatar sx={{ width: 100, height: 100, margin: 'auto', mt: 2 }}>
          <PersonIcon fontSize="large" />
        </Avatar>
      )}
      <CardContent>
        <Typography gutterBottom variant="h4" component="div">
          {employee.name}
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Position: {employee.position}
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Email: {employee.email}
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Projects: {employee.projects.map(project => project.name).join(', ')}
        </Typography>
      </CardContent>
      <CardActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button size="large" variant="contained" color="primary" onClick={() => navigate(`/employees/${id}`)}>
          Update
        </Button>
        <Button size="large" variant="contained" color="secondary" onClick={() => navigate('/employees')}>
          Back
        </Button>
      </CardActions>
    </Card>
  );
}

export default EmployeeDetailsComponent;
