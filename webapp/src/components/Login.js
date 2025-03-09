// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { Typography, TextField, Button, Snackbar, InputLabel } from '@mui/material';
import { Typewriter } from "react-simple-typewriter";
import { Form, useSubmit } from 'react-router-dom';

const Login = () => {
  const [formData, setForm] = useState({username:'',password:''});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [createdAt, setCreatedAt] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  const apiKey = process.env.REACT_APP_LLM_API_KEY || 'None';

  const loginUser = async () => {
    try {
      const response = await axios.post(`${apiEndpoint}/login`, formData);
      setMessage("Welcome "+formData.username);
      // Extract data from the response
      const { createdAt: userCreatedAt } = response.data;

      setCreatedAt(userCreatedAt);
      setLoginSuccess(true);

      setOpenSnackbar(true);
    } catch (error) {
      setError(error.response.data.error);
    }
  };
  const handleFormChange = (e)=>{
    setForm({...formData,[e.target.name]:e.target.value})
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const login = (
    <div>
    <Typography component="h2" variant='h3'>
      Welcome back!
    </Typography>
    <Form onSubmit={loginUser}>
      <TextField
        fullWidth
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant='contained' type='submit'>
        Login
      </Button>
    </Form>
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
