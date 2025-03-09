import React from 'react';
import { Typography,AppBar, Toolbar,Select,MenuItem, Button, IconButton} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {

  const navigate = useNavigate();

  const loginLink = () => {
    // After a successful login, redirect to a new route
    navigate('/auth/true');
  };

  return (
    <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Wichat
          </Typography>
          <Select defaultValue="EN" variant="outlined" size="small" style={{ marginRight: 10 }}>
            <MenuItem value="EN">EN</MenuItem>
            <MenuItem value="ES">ES</MenuItem>
          </Select>
          <Button onClick={loginLink} color="inherit">Log in</Button>
        </Toolbar>
      </AppBar>
  );
};

export default NavBar;