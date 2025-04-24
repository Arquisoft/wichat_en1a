import React from 'react';
import { Typography, AppBar, Toolbar, Select, MenuItem, ButtonGroup, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NavBarSignedIn = () => {

  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Wichat
          <ButtonGroup color="secondary" aria-label="Medium-sized button group">
            <Button href="/home" color="inherit" sx={{
              marginLeft: 10,
              "&:hover": {
                backgroundColor: 'secondary.light',
                color: 'primary.main'
              }
            }}>{t('menu')}</Button>
            <Button href="/leaderboard" color="inherit" sx={{
              marginLeft: 10,
              "&:hover": {
                backgroundColor: 'secondary.light',
                color: 'primary.main'
              }
            }}>{t('leaderboard')}</Button>
            <Button href="/stats" color="inherit" sx={{
              marginLeft: 10,
              "&:hover": {
                backgroundColor: 'secondary.light',
                color: 'primary.main'
              }
            }}>{t('statistics')}</Button>
          </ButtonGroup>
        </Typography>
        <Select onChange={handleLanguageChange} defaultValue="EN" variant="outlined" size="small" sx={{ 
            marginRight: 10,
            color: "inherit" 
          }}>
          <MenuItem value="EN">EN</MenuItem>
          <MenuItem value="ES">ES</MenuItem>
        </Select>
        <Button onClick={handleLogout} id="logoutButton" color="inherit" sx={{
            marginLeft: 5,
            marginRight: 2,
            "&:hover": {
              color: 'accent.logout',
            }
          }}>{t('logout')}</Button>
      </Toolbar>
    </AppBar>
  )
}

export default NavBarSignedIn;
