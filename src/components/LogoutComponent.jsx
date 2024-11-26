import React from 'react';
import { Container, Box, Typography } from '@mui/material';

const LogoutComponent = () => {
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
                    You are logged out
                </Typography>
                <Typography variant="body1">
                    Thank You for Using Our Application.
                </Typography>
            </Box>
        </Container>
    );
};

export default LogoutComponent;
