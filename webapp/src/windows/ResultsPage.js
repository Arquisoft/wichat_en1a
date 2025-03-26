import { Card, CardContent, Grid, Typography } from '@mui/material'
import React from 'react'

const ResultsPage = () => {
  return (
    <Grid container>
        <Card>
            <CardContent>
                <Typography variant='h2'>Results:</Typography>
                <Typography variant='body1'>Questions answered: {sessionStorage.getItem('questionNum')}</Typography>
                <Typography variant='body1'>Questions answered correctly: {sessionStorage.getItem('score')}</Typography>
            </CardContent>
        </Card>
    </Grid>
  )
}

export default ResultsPage