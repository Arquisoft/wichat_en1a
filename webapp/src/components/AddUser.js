// src/components/AddUser.js
import React, { useState } from 'react';
import axios from 'axios';
import {Alert, Typography, TextField, Button, Snackbar } from '@mui/material';
import { Navigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const AddUser = () => {
  const [formData, setFormData] = useState({username:'',password:'',repeatPassword:''});
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [matchingPasswords,setMatchingPasswords]=useState(false);
  const [submitButton,setSubmitButton]=useState(false);
  const{t} = useTranslation();

  const addUser = async () => {
    try {
      const response = await axios.post(`${apiEndpoint}/adduser`, formData);
      const {token}=response.data;
      sessionStorage.setItem("sessionToken",token);
      setSignupSuccess(true);
    } catch (error) {
      setOpenSnackbar(true);
    }
  };
  
  const handleFormChange = (e)=>{
    setFormData((prevState)=>({...prevState,[e.target.name]:e.target.value}));
  };
  const checkFields = ()=>{
    setSubmitButton(formData.username>0 && formData.password.length>0 && formData.repeatPassword>0);
  }
  const checkPasswords = ()=>{
    setMatchingPasswords(formData.password == formData.repeatPassword);
  };

  const signup = (
  <React.Fragment>
  <Typography component="h2" variant="h3">{t("signup.title")}</Typography>
  <TextField
    name="username"
    margin="normal"
    fullWidth
    label={t("forms.username")}
    value={formData.username}
    onChange={(e)=>{checkFields();handleFormChange(e);}}
  ></TextField>
  <TextField
    name="password"
    margin="normal"
    fullWidth
    label={t("forms.password")}
    type="password"
    value={formData.password}
    onChange={(e)=>{checkFields();handleFormChange(e);checkPasswords()}}
  ></TextField>
  <TextField
    name="repeatPassword"
    margin="normal"
    fullWidth
    label={t("forms.repeatPassword")}
    type="password"
    value={formData.repeatPassword}
    onChange={(e)=>{checkFields();handleFormChange(e);checkPasswords()}}
  ></TextField>
  <Snackbar open={openSnackbar} onClose={()=>{setOpenSnackbar(false)}}>
    <Alert data-testid='errorNotification' severity='error'>{t("signup.error")}</Alert>
  </Snackbar>
  <Button variant="contained" data-testid='signupButton' onClick={addUser}>
    {t("signup.message")}
  </Button>
</React.Fragment>
);

  return (
    <React.Fragment>
      {signupSuccess?(<Navigate to="/home"/>)
      :(signup)}
    </React.Fragment>
  );
};

export default AddUser;
