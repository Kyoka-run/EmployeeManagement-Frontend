import React, { useState } from "react";
import {
    Container,Box,Typography,TextField,Button,Alert,FormControl,InputLabel,Select,MenuItem,OutlinedInput,Chip
  } from '@mui/material';
import axios from 'axios';


const RegisterComponent = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [roles, setRoles] = useState([]);

    const handleRegister = async () => {
        if (!username.trim()) {
            setErrorMessage("Username cannot be empty.");
            setSuccessMessage('');
            return;
        }
        if (!password.trim()) {
            setErrorMessage("Password cannot be empty.");
            setSuccessMessage('');
            return;
        }
        if (!roles.length) {
            setErrorMessage("Please select at least one role.");
            setSuccessMessage('');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/register', {
                username,
                password,
                roles
            });
            setSuccessMessage("Account created successfully! You can now login.");
            setErrorMessage('');
        } catch (error) {
            setErrorMessage("Failed to register.");
            setSuccessMessage('');
        }
    };

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        setRoles(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 3,
                    border: '1px solid grey',
                    borderRadius: 2,
                    boxShadow: 3,
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Register
                </Typography>
                <div className="container">
                    {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                    {successMessage && <Alert severity="success">{successMessage}</Alert>}
                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="role-label">Role</InputLabel>
                        <Select
                            labelId="role-label"
                            multiple
                            value={roles}
                            onChange={handleChange}
                            input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} />
                                    ))}
                                </Box>
                            )}
                        >
                            <MenuItem value="ADMIN">Admin</MenuItem>
                            <MenuItem value="EMPLOYEE_MANAGER">Employee Manager</MenuItem>
                            <MenuItem value="PROJECT_MANAGER">Project Manager</MenuItem>
                            <MenuItem value="GUEST">Guest</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleRegister}
                        sx={{ mt: 2 }}
                    >
                        Confirm
                    </Button>
                </div>
            </Box>
        </Container>
    );
};

export default RegisterComponent;