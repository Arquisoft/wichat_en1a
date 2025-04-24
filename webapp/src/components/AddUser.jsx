// src/components/AddUser.js
import React, { useState } from 'react';
import axios from 'axios';
import {Alert, Typography, TextField, Button, Snackbar } from '@mui/material';
import { useTranslation } from 'react-i18next';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const AddUser = ({callback}) => {
  const [formData, setFormData] = useState({username:'',password:'',repeatPassword:''});
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [submitButton,setSubmitButton]=useState(false);
  const [errormsg, setErrormsg] = useState('');
  const{t} = useTranslation();

  const addUser = async () => {
    try {
      await axios.post(`${apiEndpoint}/api/user/signup`, formData);
      setSignupSuccess(true);
    } catch (error) {
      setErrormsg(error.response.data.error);
      setOpenSnackbar(true);
    }
  };
  
  const handleFormChange = (e)=>{
    setFormData((prevState)=>({...prevState,[e.target.name]:e.target.value}));
  };
  const checkFields = ()=>{
    setSubmitButton(formData.username>0 && formData.password.length>0 && formData.repeatPassword>0);
  }

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
    onChange={(e)=>{checkFields();handleFormChange(e);}}
  ></TextField>
  <TextField
    name="repeatPassword"
    margin="normal"
    fullWidth
    label={t("forms.repeatPassword")}
    type="password"
    value={formData.repeatPassword}
    onChange={(e)=>{checkFields();handleFormChange(e);}}
  ></TextField>
  <Snackbar open={openSnackbar} onClose={()=>{setOpenSnackbar(false)}}>
    <Alert data-testid='errorNotification' severity='error'>{t("signup.error")+" "+errormsg}</Alert>
  </Snackbar>
  <Button sx={{margin:1}} variant="contained" disabled={submitButton} data-testid='signupButton' name='addUserButton' onClick={addUser}>
    {t("signup.message")}
  </Button>
</React.Fragment>
);

  return (
    <React.Fragment>
      {signupSuccess?(callback())
      :(signup)}
    </React.Fragment>
  );
};

export default AddUser;
