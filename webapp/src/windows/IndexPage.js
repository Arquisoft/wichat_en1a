import React, {Image} from 'react'
import NavBar from '../components/NavBar';
import { Typography,Card,CardContent,Grid,Button} from '@mui/material';
import AboutUsFooter from '../components/AboutUsFooter';

const IndexPage = () => {
  return (
    <Grid container minHeight='100vh' display='flex' flexDirection='column'>
      <NavBar></NavBar>
      <Grid container flexGrow={1} alignItems='center'>
          <Grid item flexDirection='column' margin={2} md={6}>
            <Typography variant="h5" gutterBottom>
              What is Wichat
            </Typography>
            <Typography variant="body1" paragraph>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </Typography>
            <Grid align='center'>
              <Button href="/auth/true" variant="outlined" style={{ marginRight: 10 }}>Log in</Button>
              <Button href="/auth/false" variant="outlined">Sign up</Button>
            </Grid>
          </Grid>
          <Grid item>
            <img height='100%' src='colorPalleteProposed.png' alt='Placeholder image, proposed color pallete for the ui'></img>
          </Grid>
        </Grid>
      <AboutUsFooter></AboutUsFooter>
    </Grid>
  );
}

export default IndexPage;