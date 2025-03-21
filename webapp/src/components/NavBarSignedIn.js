import React from 'react';
import { Typography, AppBar, Toolbar, Select, MenuItem, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NavBarSignedIn = () => {

  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const indexLink = () => {
    navigate('/');
  };

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <AppBar position="static" color="default">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Wichat
          <Button href="/home" color="inherit" sx={{
            marginLeft: 10,
            "&:hover": {
              backgroundColor: "rgb(227, 235, 217)"
            }
          }}>{t('menu')}</Button>
          <Button href="/leaderboard" color="inherit" sx={{
            marginLeft: 10,
            "&:hover": {
              backgroundColor: "rgb(227, 235, 217)"
            }
          }}>{t('leaderboard')}</Button>
          <Button href="/stats" color="inherit" sx={{
            marginLeft: 10,
            "&:hover": {
              backgroundColor: "rgb(227, 235, 217)"
            }
          }}>{t('statistics')}</Button>
        </Typography>
        <Select onChange={handleLanguageChange} defaultValue="EN" variant="outlined" size="small" style={{ marginRight: 10 }}>
          <MenuItem value="EN">EN</MenuItem>
          <MenuItem value="ES">ES</MenuItem>
        </Select>
        <Button onClick={indexLink} color="inherit" sx={{
            marginLeft: 5,
            marginRight: 2,
            "&:hover": {
              color: "rgb(105, 14, 11)"
            }
          }}>{t('logout')}</Button>
      </Toolbar>
    </AppBar>
  )
}

export default NavBarSignedIn;
