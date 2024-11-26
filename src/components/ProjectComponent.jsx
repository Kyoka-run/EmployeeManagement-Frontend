import React, { useState, useEffect } from "react";
import ProjectDataService from "../service/ProjectDataService";
import EmployeeDataService from "../service/EmployeeDataService";
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import { TextField, Button, Box, Typography, Select, MenuItem, InputLabel, FormControl, Checkbox, ListItemText } from '@mui/material';

function ProjectComponent() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const [id, setId] = useState(paramId);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);

  // Fetch all employees and project details
  useEffect(() => {
    EmployeeDataService.retrieveAllEmployees()
      .then(response => {
        setAllEmployees(response.data);
      })
      .catch(error => {
        console.error("There was an error retrieving the employees:", error);
      });

    // If id is not -1, fetch project details
    if (Number(id) !== -1) {
      ProjectDataService.retrieveProject(id)
        .then(response => {
          setName(response.data.name);
          setDescription(response.data.description);
        })
        .catch(error => {
          console.error("There was an error retrieving the project:", error);
        });
    }
  }, [id]);

  // Form validation
  const validate = (values) => {
    let errors = {};
    if (!values.name) {
      errors.name = "Name is required";
    }
    if (!values.description) {
      errors.description = "Description is required";
    }
    return errors;
  };

  const onSubmit = (values) => {
    let project = {
      id: id,
      name: values.name,
      description: values.description,
      employees: employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        position: emp.position,
        department: emp.department,
        email: emp.email
      }))
    };
    // If the project ID is -1, create a new project, otherwise update existing project
    if (Number(id) === -1) {
      ProjectDataService.createProject(project)
        .then(() => navigate('/projects', { state: { message: 'Project created successfully!' }}));
    } else {
      ProjectDataService.updateProject(id, project)
        .then(() => navigate('/projects', { state: { message: 'Project updated successfully!' }}));
    }
  };

  const handleEmployeeChange = (event) => {
    const { value } = event.target;
    setEmployees(value);
  };

  return (
    <Box sx={{ margin: 'auto', width: '50%', padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Project Form
      </Typography>
      <Formik
        initialValues={{ id, name, description }}
        onSubmit={onSubmit}
        validateOnChange={true}
        validateOnBlur={true}
        validate={validate}
        enableReinitialize={true}
      >
        {({ values, handleChange, handleSubmit, errors, touched }) => (
          <Form onSubmit={handleSubmit}>
            {/* Hidden input to maintain project ID */}
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

            {/* Description input field */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                variant="outlined"
                value={values.description}
                onChange={handleChange}
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
              />
            </Box>

            {/* Employees selection field */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="employee-select-label">Employees</InputLabel>
              <Select
                labelId="employee-select-label"
                data-testid="employees-select"
                multiple
                value={employees}
                onChange={handleEmployeeChange}
                renderValue={(selected) => selected.map((emp) => emp.name).join(', ')}
              >
                {allEmployees.map((employee) => (
                  <MenuItem key={employee.id} value={employee}>
                    <Checkbox checked={employees.some(e => e.id === employee.id)} />
                    <ListItemText primary={employee.name} />
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

export default ProjectComponent;
