import React from 'react';
import { Typography,AppBar, Toolbar,Select,MenuItem, Button, Icon} from '@mui/material';
import VideogameAsset from "@mui/icons-material/VideogameAsset"
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
    <AppBar position="static">
        <Toolbar>
          <Icon><VideogameAsset/></Icon>
          <Typography style={{ flexGrow: 1 }}>
          </Typography>
          <Select sx={{color:'secondary.light'}} onChange={handleLanguageChange} defaultValue="EN" variant='standard' size="small" style={{ marginRight: 10 }}>
            <MenuItem value="EN">EN</MenuItem>
            <MenuItem value="ES">ES</MenuItem>
          </Select>
          <Button onClick={loginLink} color="inherit">{t('login')}</Button>
        </Toolbar>
      </AppBar>
  );
};

export default NavBar;