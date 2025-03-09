import React from 'react'
import NavBar from '../components/NavBar';
import { Typography,Grid,Button} from '@mui/material';
import AboutUsFooter from '../components/AboutUsFooter';
import { useTranslation } from 'react-i18next';

const IndexPage = () => {

  const{t} = useTranslation();

  return (
    <Grid container minHeight='100vh' display='flex' flexDirection='column'>
      <NavBar></NavBar>
      <Grid container flexGrow={1} alignItems='center'>
          <Grid item flexDirection='column' margin={2} md={6}>
            <Typography variant="h5" gutterBottom>
              {t('index.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </Typography>
            <Grid align='center'>
              <Button href="/auth/true" variant="outlined" style={{ marginRight: 10 }}>{t('login')}</Button>
              <Button href="/auth/false" variant="outlined">{t('signup')}</Button>
            </Grid>
          </Grid>
          <Grid item md={5.5}>
            <img src='colorPalleteProposed.png' alt='Placeholder image, proposed color pallete for the ui' 
            style={{ width: '100%', height: 'auto' }}></img>
          </Grid>
        </Grid>
      <AboutUsFooter></AboutUsFooter>
    </Grid>
  );
}

export default IndexPage;