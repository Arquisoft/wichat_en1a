import React from 'react'
import { Grid,Card,CardContent, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

const AboutUsFooter = () => {
  const {t} = useTranslation();
  return (
    <Grid item md={12}>
      <Card variant='outlined' sx={{backgroundColor:"secondary.main"}}>
        <CardContent align='center'>
          <Typography variant="h5" gutterBottom>
            {t('about.title')}
          </Typography>
          <Typography variant='body1'>
            {t("about.message")}
          </Typography>
          <Typography variant="body1">
            {t("about.github")}<a href='https://github.com/Arquisoft/wichat_en1a'>GitHub</a>
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default AboutUsFooter