import AuthenticationService from "../service/AuthenticationService";
import { useNavigate } from 'react-router-dom';
import { MContext } from './MyProvider.jsx';
import React, { useState, useContext } from "react";
import { Container, Box, Typography, TextField, Button, Alert } from '@mui/material';

function LoginComponent() {
    const navigate = useNavigate();
    const context = useContext(MContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [hasLoginFailed, setHasLoginFailed] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // Handle input changes
    const handleChange = (event) => {
        const { name, value } = event.target;
        if (name === "username") {
            setUsername(value);
        } else if (name === "password") {
            setPassword(value);
        }
    };

    // Handle register click
    const handleRegister = () => {
        navigate('/register');
    };

    // Handle login click
    const loginClicked = () => {
        AuthenticationService.login(username, password)
            .then(() => {
                AuthenticationService.registerSuccessfulLogin(username);
                context.setIsUserLoggedIn(true);
                navigate('/employees');
                setShowSuccessMessage(true);
                setHasLoginFailed(false);
            })
            .catch(() => {
                context.setIsUserLoggedIn(false);
                setHasLoginFailed(true);
                setShowSuccessMessage(false);
            });
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
                <Typography variant="h4" gutterBottom data-testid="loginHeader">
                    Login
                </Typography>
                <div className="container">
                    {hasLoginFailed && <Alert severity="error">Invalid Credentials</Alert>}
                    {showSuccessMessage && <Alert severity="success">Login Successful</Alert>}
                    <TextField
                        data-testid="username"
                        label="User Name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        name="username"
                        value={username}
                        onChange={handleChange}
                    />
                    <TextField
                        data-testid="password"
                        label="Password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type="password"
                        name="password"
                        value={password}
                        onChange={handleChange}
                    />
                    <Button
                        data-testid="login"
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={loginClicked}
                        sx={{ mt: 2 }}
                    >
                        Login
                    </Button>
                    <Typography
                        variant="body2"
                        color="primary"
                        sx={{ mt: 2, cursor: 'pointer', textAlign: 'center' }}
                        onClick={handleRegister}
                    >
                        No account? Register here
                    </Typography>
                </div>
            </Box>
        </Container>
    );
}

export default LoginComponent;
