import React from 'react'
import { Grid,Card,CardContent, Typography } from '@mui/material'

const AboutUsFooter = () => {
  return (
    <Grid item md={12}>
      <Card variant='outlined'>
        <CardContent align='center'>
          <Typography variant="h5" gutterBottom>
            About us
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