import React, { useState } from 'react'
import { Grid, Typography } from '@mui/material'

const GameComponent = () => {
    const question = sessionStorage.getItem('question');
  return (
    <Grid item>
        <Typography>{question.question}</Typography>
        <Grid item>
            <img src={question.image} alt='question hint' 
            style={{ width: '100%', height: 'auto', border:'solid'}}></img>
        </Grid>
    </Grid>
  )
}

export default GameComponent