import React from 'react';
import { Typography,AppBar, Toolbar,Select,MenuItem, Button, IconButton} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NavBar = () => {

  const navigate = useNavigate();
  const { i18n,t } = useTranslation();

  const loginLink = () => {
    navigate('/auth/true');
  };

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Wichat
          </Typography>
          <Select onChange={handleLanguageChange} defaultValue="EN" variant="outlined" size="small" style={{ marginRight: 10 }}>
            <MenuItem value="EN">EN</MenuItem>
            <MenuItem value="ES">ES</MenuItem>
          </Select>
          <Button onClick={loginLink} color="inherit">{t('login')}</Button>
        </Toolbar>
      </AppBar>
  );
};

export default NavBar;