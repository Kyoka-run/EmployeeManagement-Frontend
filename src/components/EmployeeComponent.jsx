import React, { useState, useEffect } from "react";
import EmployeeDataService from "../service/EmployeeDataService";
import ProjectDataService from "../service/ProjectDataService";
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import { TextField, Button, Box, Typography, Select, MenuItem, InputLabel, FormControl, Checkbox, ListItemText } from '@mui/material';

function EmployeeComponent() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const [id, setId] = useState(paramId);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);

  // Fetch all projects and employee details
  useEffect(() => {
    ProjectDataService.retrieveAllProjects()
      .then(response => {
        setAllProjects(response.data);
      })
      .catch(error => {
        console.error("There was an error retrieving the projects:", error);
      });

    // If id is not -1, fetch employee details
    if (Number(id) !== -1) {
      EmployeeDataService.retrieveEmployee(id)
        .then(response => {
          setName(response.data.name);
          setPosition(response.data.position);
          setDepartment(response.data.department);
          setEmail(response.data.email);
        })
        .catch(error => {
          console.error("There was an error retrieving the employee:", error);
        });
    }
  }, [id]);

  // Form validation
  const validate = (values) => {
    let errors = {};
    if (!values.name) {
      errors.name = "Name is required";
    }
    if (!values.position) {
      errors.position = "Position is required";
    }
    if (!values.department) {
      errors.department = "Department is required";
    }
    if (!values.email) {
      errors.email = "Email is required";
    }
    return errors;
  };

  const onSubmit = (values) => {
    let employee = {
      id: id,
      name: values.name,
      position: values.position,
      department: values.department,
      email: values.email,
      projects: projects.map(proj => ({
        id: proj.id,
        name: proj.name,
        description: proj.description
      }))
    };
    // If the employee ID is -1, create a new employee, otherwise update existing employee
    if (Number(id) === -1) {
      EmployeeDataService.createEmployee(employee)
        .then(() => navigate('/employees', { state: { message: 'Employee created successfully!' }}));
    } else {
      EmployeeDataService.updateEmployee(id, employee)
        .then(() => navigate('/employees', { state: { message: 'Employee updated successfully!' }}));
    }
  };

  const handleProjectChange = (event) => {
    const { value } = event.target;
    setProjects(value);
  };  

  return (
    <Box sx={{ margin: 'auto', width: '50%', padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Employee Form
      </Typography>
      <Formik
        initialValues={{ id, name, position, department, email }}
        onSubmit={onSubmit}
        validateOnChange={true}
        validateOnBlur={true}
        validate={validate}
        enableReinitialize={true}
      >
        {({ values, handleChange, handleSubmit, errors, touched }) => (
          <Form onSubmit={handleSubmit}>
            {/* Hidden input to maintain employee ID */}
            <input
              type="hidden"
              name="id"
              value={values.id}
            />

            {/* Name input field */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                variant="outlined"
                value={values.name}
                onChange={handleChange}
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />
            </Box>

            {/* Position input field */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Position"
                name="position"
                variant="outlined"
                value={values.position}
                onChange={handleChange}
                error={touched.position && Boolean(errors.position)}
                helperText={touched.position && errors.position}
              />
            </Box>

            {/* Department input field */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                variant="outlined"
                value={values.department}
                onChange={handleChange}
                error={touched.department && Boolean(errors.department)}
                helperText={touched.department && errors.department}
              />
            </Box>

            {/* Email input field */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                variant="outlined"
                value={values.email}
                onChange={handleChange}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />
            </Box>
            
            {/* Projects selection field */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="project-select-label">Projects</InputLabel>
              <Select
                data-testid="projects-select"
                multiple
                value={projects}
                onChange={handleProjectChange}
                renderValue={(selected) => selected.map((proj) => proj.name).join(', ')}
              >
                {allProjects.map((project) => (
                  <MenuItem key={project.id} value={project} data-testid={`project-item-${project.id}`}>
                    <Checkbox checked={projects.some(p => p.id === project.id)} />
                    <ListItemText primary={project.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Save button */}
            <Button variant="contained" color="primary" type="submit">
              Save
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
}

export default EmployeeComponent;