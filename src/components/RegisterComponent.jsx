import React, { useState } from "react";
import { Container, Box, Typography, TextField, Button, Alert } from '@mui/material';
import axios from 'axios';

const RegisterComponent = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

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

        try {
            const response = await axios.post('http://localhost:8080/api/register', {
                username,
                password,
            });
            setSuccessMessage("Account created successfully! You can now login.");
            setErrorMessage('');
        } catch (error) {
            setErrorMessage("Failed to register. Username may already be taken.");
            setSuccessMessage('');
        }
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
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleRegister}
                        sx={{ mt: 2 }}
                    >
                        Register
                    </Button>
                </div>
            </Box>
        </Container>
    );
};

export default RegisterComponent;
