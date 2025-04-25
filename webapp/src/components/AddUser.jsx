// src/components/AddUser.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {Alert, Typography, TextField, Button, Snackbar } from '@mui/material';
import { useTranslation } from 'react-i18next';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const AddUser = ({callback}) => {
  const [formData, setFormData] = useState({username:'',password:'',repeatPassword:''});
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [submitButton,setSubmitButton]=useState(false);
  const [errorCode, setErrorCode] = useState('');
  const{t} = useTranslation();

  const addUser = async () => {
    try {
      await axios.post(`${apiEndpoint}/api/user/signup`, formData);
      setSignupSuccess(true);
    } catch (error) {
      console.log(error);
      setErrorCode(error.response.data.errorCode);
      setOpenSnackbar(true);
    }
  };
  
  useEffect(() => {
    const { username, password, repeatPassword } = formData;
    setSubmitButton(username.length > 0 && password.length > 0 && repeatPassword.length > 0);
  }, [formData]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
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
    onChange={(e)=>{handleFormChange(e);}}
  ></TextField>
  <TextField
    name="password"
    margin="normal"
    fullWidth
    label={t("forms.password")}
    type="password"
    value={formData.password}
    onChange={(e)=>{handleFormChange(e);}}
  ></TextField>
  <TextField
    name="repeatPassword"
    margin="normal"
    fullWidth
    label={t("forms.repeatPassword")}
    type="password"
    value={formData.repeatPassword}
    onChange={(e)=>{handleFormChange(e)}}
  ></TextField>
  <Snackbar open={openSnackbar} onClose={()=>{setOpenSnackbar(false)}} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
    <Alert data-testid='errorNotification' severity='error'>{t("signup.error")+" "+t(errorCode)}</Alert>
  </Snackbar>
  <Button sx={{margin:1}} variant="contained" disabled={!submitButton} data-testid='signupButton' name='addUserButton' onClick={addUser}>
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
