// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { Typography, TextField, Button, Snackbar } from '@mui/material';
import { Typewriter } from "react-simple-typewriter";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [createdAt, setCreatedAt] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  const apiKey = process.env.REACT_APP_LLM_API_KEY || 'None';

  const loginUser = async () => {
    try {
      const response = await axios.post(`${apiEndpoint}/login`, { username, password });
      setMessage("Welcome "+username);
      // Extract data from the response
      const { createdAt: userCreatedAt } = response.data;

      setCreatedAt(userCreatedAt);
      setLoginSuccess(true);

      setOpenSnackbar(true);
    } catch (error) {
      setError(error.response.data.error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const login = (
    <div>
    <Typography component="h1" variant="h5">
      Welcome back!
    </Typography>

    <TextField
      margin="normal"
      fullWidth
      label="Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
    />
    <TextField
      margin="normal"
      fullWidth
      label="Password"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
    <Button variant='contained' onClick={loginUser}>
      Login
    </Button>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} message="Login successful" />
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} message={`Error: ${error}`} />
      )}
    </div>
  );
  return (
    <React.Fragment>
      {loginSuccess ? (
        <div>
          <Typewriter
            words={[message]} // Pass your message as an array of strings
            cursor
            cursorStyle="|"
            typeSpeed={50} // Typing speed in ms
          />
          <Typography component="p" variant="body1" sx={{ textAlign: 'center', marginTop: 2 }}>
            Your account was created on {new Date(createdAt).toLocaleDateString()}.
          </Typography>
        </div>
      ) : (
        login
      )}
      </React.Fragment>
  );
};

export default Login;
