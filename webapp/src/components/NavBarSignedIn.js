import React from 'react';
import { Typography, AppBar, Toolbar, Select, MenuItem, ButtonGroup, Button } from '@mui/material';
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
          <ButtonGroup color="secondary" aria-label="Medium-sized button group">
            <Button href="/home" color="inherit" sx={{
              marginLeft: 10,
              "&:hover": {
                backgroundColor: 'secondary.light'
              }
            }}>{t('menu')}</Button>
            <Button href="/leaderboard" color="inherit" sx={{
              marginLeft: 10,
              "&:hover": {
                backgroundColor: 'secondary.light'
              }
            }}>{t('leaderboard')}</Button>
            <Button href="/stats" color="inherit" sx={{
              marginLeft: 10,
              "&:hover": {
                backgroundColor: 'secondary.light'
              }
            }}>{t('statistics')}</Button>
          </ButtonGroup>
        </Typography>
        <Select onChange={handleLanguageChange} defaultValue="EN" variant="outlined" size="small" style={{ marginRight: 10 }}>
          <MenuItem value="EN">EN</MenuItem>
          <MenuItem value="ES">ES</MenuItem>
        </Select>
        <Button onClick={indexLink} color="inherit" sx={{
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
