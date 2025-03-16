import React from 'react'
import { Button, Grid, Typography } from '@mui/material'

const GameComponent = ({ question, onQuestionAnswered }) => {
  const handleAnswer = (number) => {
    onQuestionAnswered(number===question.correctAnswerId); // Signal to parent to change the question
  };
  return (
    <Grid item>
        <Typography>{question.question}</Typography>
        <Grid item>
            <img src={question.image} alt='question hint' 
            style={{ width: '100%', height: '50vh', border:'solid'}}></img>
        </Grid>
        <Button onClick={()=>handleAnswer(0)}>{question.answers[0]}</Button>
        <Button onClick={()=>handleAnswer(1)}>{question.answers[1]}</Button>
        <Button onClick={()=>handleAnswer(2)}>{question.answers[2]}</Button>
        <Button onClick={()=>handleAnswer(3)}>{question.answers[3]}</Button>
    </Grid>
  )
}

export default GameComponent