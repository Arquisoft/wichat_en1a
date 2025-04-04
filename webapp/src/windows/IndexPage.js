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
              {t("index.description")}
            </Typography>
            <Typography variant="body1" paragraph>
              {t("index.howItWorks")}
            </Typography>
            <Grid align='center'>
              <Button href="/auth/true" name="login" variant="outlined" style={{ marginRight: 10 }}>{t('login.message')}</Button>
              <Button href="/auth/false" name="signup" variant="outlined">{t('signup.message')}</Button>
            </Grid>
          </Grid>
          <Grid item md={5}>
            <img src='GameDescriptionImage.png' alt='Description of the use of wikidata, and an ai chat for the triva-style game.' 
            style={{ width: '100%', height: 'auto', border:'solid'}}></img>
          </Grid>
        </Grid>
      <AboutUsFooter></AboutUsFooter>
    </Grid>
  );
}

export default IndexPage;