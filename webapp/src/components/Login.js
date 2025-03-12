// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { Typography, TextField, Button, Snackbar, Box, Alert } from '@mui/material';
import { Navigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [formData, setForm] = useState({username:'',password:''});
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [snackbarStatus, setSnackbar] = useState(false);
  const{t} = useTranslation();

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
    <React.Fragment>
    <Typography component="h2" variant='h3'>
      {t("login.title")}
    </Typography>
    <TextField
      margin='normal'
      fullWidth
      label={t("forms.username")}
      name="username"
      value={formData.username}
      onChange={handleFormChange}
      />
    <TextField
      margin='normal'
      fullWidth
      label={t("forms.password")}
      type="password"
      name="password"
      value={formData.password}
      onChange={handleFormChange}
      />
    <Snackbar open={snackbarStatus} onClose={()=>{setSnackbar(false)}}>
      <Alert severity='error'>Error: {t('login.error')}</Alert>
    </Snackbar>
    <Button variant='contained' data-testid='loginButton' onClick={loginUser}>
      {t('login.message')}
    </Button>
    </React.Fragment>
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
