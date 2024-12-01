import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectDataService from '../service/ProjectDataService';
import { Card, CardContent, Typography, CircularProgress, Box, CardActions, Button, CardMedia, Avatar } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';

function ProjectDetailsComponent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  // Fetch project details using ProjectDataService
  useEffect(() => {
    ProjectDataService.retrieveProject(id)
      .then(response => {
        setProject(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the project details!', error);
      });
  }, [id]);

  // Show loading spinner while project data is being fetched
  if (!project) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ maxWidth: 500, margin: 'auto', mt: 5, p: 2, textAlign: 'center' }}>
      {project.imageUrl ? (
        <CardMedia
          component="img"
          alt="Project Image"
          height="200"
          image={project.imageUrl}
          sx={{ maxWidth: 200, margin: 'auto' }}
        />
      ) : (
        <Avatar sx={{ width: 100, height: 100, margin: 'auto', mt: 2 }}>
          <FolderIcon fontSize="large" />
        </Avatar>
      )}
      <CardContent>
        <Typography gutterBottom variant="h4" component="div">
          {project.name}
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Description: {project.description}
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Employees: {project.employees.map(employee => employee.name).join(', ')}
        </Typography>
      </CardContent>
      <CardActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button size="large" variant="contained" color="primary" onClick={() => navigate(`/projects/${id}`)}>
          Update
        </Button>
        <Button size="large" variant="contained" color="secondary" onClick={() => navigate('/projects')}>
          Back
        </Button>
      </CardActions>
    </Card>
  );
}

export default ProjectDetailsComponent;
