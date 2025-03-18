import React, { useState } from 'react'
import { Button, Card, CardContent, Grid, Typography } from '@mui/material'

const GameComponent = ({ question, onQuestionAnswered }) => {
  const [responded,setResponded] = useState(false);
  const getColor=(number)=>{
    return (number===question.correctAnswerId)?'success':'error';
  }
  const handleAnswer = (number) => {
    if(!responded){
      setResponded(true);
      onQuestionAnswered(number===question.correctAnswerId); // Signal to parent to change the question
    }
  };
  return (
    <Card md='10' variant='outlined'>
    <CardContent color='secondary'>
      <Typography variant='h2'>{question.question}</Typography>
      <Grid item>
        <img src={question.image} alt='question hint' 
        style={{borderRadius:'10', height: '70vh', border:'solid'}}></img>
      </Grid>
      <Grid item >
        <Button variant='contained' sx={{width:'40%'}}
        color={responded?(getColor(0)):'primary'} onClick={()=>handleAnswer(0)}>{question.answers[0]}</Button>
        <Button variant='contained' sx={{width:'40%'}}
        color={responded?(getColor(1)):'primary'} onClick={()=>handleAnswer(1)}>{question.answers[1]}</Button>
        <Button variant='contained' sx={{width:'40%'}}
        color={responded?(getColor(2)):'primary'} onClick={()=>handleAnswer(2)}>{question.answers[2]}</Button>
        <Button variant='contained' sx={{width:'40%'}}
        color={responded?(getColor(3)):'primary'} onClick={()=>handleAnswer(3)}>{question.answers[3]}</Button>
      </Grid>
      </CardContent>
    </Card>
  )
}

export default GameComponent