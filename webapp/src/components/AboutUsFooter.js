import React from 'react'
import { Grid,Card,CardContent, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

const AboutUsFooter = () => {
  const {t} = useTranslation();
  return (
    <Grid item md={12}>
      <Card variant='outlined'>
        <CardContent align='center'>
          <Typography variant="h5" gutterBottom>
            {t('about.title')}
          </Typography>
          <Typography variant="body1">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce non malesuada massa. Sed id risus ut nunc.
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default AboutUsFooter