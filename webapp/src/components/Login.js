// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { Typography, TextField, Button, Snackbar, Box, Alert } from '@mui/material';
import { Navigate } from "react-router-dom";

const Login = () => {
  const [formData, setForm] = useState({username:'',password:''});
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [snackbarStatus, setSnackbar] = useState(false);

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  const apiKey = process.env.REACT_APP_LLM_API_KEY || 'None';

  const loginUser = async () => {
    try {
      const response = await axios.post(`${apiEndpoint}/login`, formData);
      // Extract data from the response
      const { token } = response.data;
      
      sessionStorage.setItem("sessionToken",token);
      setLoginSuccess(true);


    } catch (error) {
      setError(error.response.data.error);
      setSnackbar(true);
    }
  };
  const handleFormChange = (e)=>{
    setForm((prevState)=>({...prevState,[e.target.name]:e.target.value}));
  };

  const login = (
    <Box>
    <Typography component="h2" variant='h3'>
      Welcome back!
    </Typography>
    <TextField
      fullWidth
      label="Username"
      name="username"
      onChange={handleFormChange}
      />
    <TextField
      fullWidth
      label="Password"
      type="password"
      name="password"
      onChange={handleFormChange}
      />
    <Snackbar open={snackbarStatus} onClose={()=>{setSnackbar(false)}}>
      <Alert severity='error'>{error}</Alert>
    </Snackbar>
    <Button variant='contained' onClick={loginUser}>
      Login
    </Button>
    </Box>
  );
  return (
    <React.Fragment>
      {loginSuccess ? (
        <Navigate to="/home"/>
      ) : (
        login
      )}
    </React.Fragment>
  );
};

export default Login;
