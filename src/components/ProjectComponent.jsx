import React, { Component } from "react";
import ProjectDataService from "../service/ProjectDataService";
import EmployeeDataService from "../service/EmployeeDataService";
import withRouter from './withRouter';
import { Formik, Form } from 'formik';
import { TextField, Button, Box, Typography, Select, MenuItem, InputLabel, FormControl, Checkbox, ListItemText } from '@mui/material'; 

class ProjectComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.match.params.id,
            name: "",
            description: "",
            employees: [], 
            allEmployees: [] 
        }
        this.onSubmit = this.onSubmit.bind(this);
        this.validate = this.validate.bind(this);
        this.handleEmployeeChange = this.handleEmployeeChange.bind(this);
    }

    componentDidMount() {
        EmployeeDataService.retrieveAllEmployees()
            .then(response => {
                this.setState({ allEmployees: response.data });
            })
            .catch(error => {
                console.error("There was an error retrieving the employees:", error);
            });
        if (Number(this.state.id) === -1) {
            return;
        }

        // Retrieve the existing project to update
        ProjectDataService.retrieveProject(this.state.id)
           .then(response => 
                this.setState({
                name: response.data.name,
                description: response.data.description,
                }))
            .catch(error => {
                console.error("There was an error retrieving the project:", error);
            });
    }

    validate(values) {
        let errors = {};
        if (!values.name) {
            errors.name = "Name is required";
        }
        if (!values.description) {
            errors.description = "Description is required";
        }
        return errors;
    }

    onSubmit(values) {
        let project = {
            id: this.state.id,
            name: values.name,
            description: values.description,
            employees: this.state.employees.map(emp => ({
                id: emp.id,
                name: emp.name,
                position: emp.position,
                department: emp.department,
                email: emp.email
            }))
        }
        if (Number(this.state.id) === -1) {
            ProjectDataService.createProject(project)
               .then(() => this.props.navigation('/projects', { state: { message: 'Project created successfully!' }}));
        } else {
            ProjectDataService.updateProject(this.state.id, project)
               .then(() => this.props.navigation('/projects', { state: { message: 'Project updated successfully!' }}));
        }
    }
    
    handleEmployeeChange(event) {
        const { value } = event.target;
        this.setState({
            employees: typeof value === 'string' ? value.split(',').map(id => this.state.allEmployees.find(emp => emp.id.toString() === id)) : value.map(employee => ({
                id: employee.id,
                name: employee.name,
                position: employee.position,
                department: employee.department,
                email: employee.email
            })),
        });
    }
    
    render() {
        let { id, name, description, employees, allEmployees } = this.state;
        return (
            <Box sx={{ margin: 'auto', width: '50%', padding: '20px' }}>
                <Typography variant="h4" gutterBottom>
                    Project Form
                </Typography>
                <Formik
                    initialValues={{ id, name, description }}
                    onSubmit={this.onSubmit}
                    validateOnChange={true}
                    validateOnBlur={true}
                    validate={this.validate}
                    enableReinitialize={true}
                >
                    {({ values, handleChange, handleSubmit, errors, touched }) => (
                        <Form onSubmit={handleSubmit}>
                            <input
                                type="hidden"
                                name="id"
                                value={values.id}
                            />

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
                            
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="employee-select-label">Employees</InputLabel>
                                <Select
                                    labelId="employee-select-label"
                                    data-testid="employees-select"
                                    multiple
                                    value={employees.map(emp => emp.id)}    
                                    onChange={this.handleEmployeeChange}
                                    renderValue={(selected) => selected.map((emp) => emp.name).join(', ')}
                                >
                                {allEmployees.map((employee) => (
                                    <MenuItem key={employee.id} value={employee.id}>
                                        <Checkbox checked={employees.some(e => e.id === employee.id)} />    
                                        <ListItemText primary={employee.name} />
                                    </MenuItem> 
                                ))}
                                </Select>
                            </FormControl>


                            <Button variant="contained" color="primary" type="submit">
                                Save
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Box>
        );
    }
}

export default withRouter(ProjectComponent);
