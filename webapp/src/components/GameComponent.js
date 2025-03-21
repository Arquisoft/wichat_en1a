import React, { useEffect, useState } from 'react'
import { Button, Grid, LinearProgress, Typography, useTheme } from '@mui/material'

const GameComponent = ({ question, onQuestionAnswered }) => {
  const [responded,setResponded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const totalTime = 60;
  const theme=useTheme();

  const getColor=(number)=>{
    return (number===question.correctAnswerId)?'success':'error';
  }
  const handleAnswer = (number) => {
    if(!responded){
      setResponded(true);
      onQuestionAnswered(number===question.correctAnswerId); // Signal to parent to change the question
    }
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }else{
      handleAnswer(-1);//no answer provided in time, look for next question.
    }
  });
  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{height:"100vh"}}>
      <Grid item xs={12}><Typography variant='h2' textAlign="center">{question.question}</Typography></Grid>
      
      <Grid item xs={12} sm={8} component="img" src={question.image} alt="question hint" 
        sx={{maxHeight:500,width:"100%",borderRadius:2,boxShadow:3, objectFit:"contain",backgroundColor:theme.palette.primary.main}}></Grid>

      <Grid item xs={12}>
        <Typography variant="body2">Time left:</Typography>
        <LinearProgress variant="determinate" value={(timeLeft / totalTime) * 100} sx={{ height: 15}} />
      </Grid>

      <Grid item container spacing={2} sx={{ width: "80%" }}>
      {question.answers.map((answer, index) => (
      <Grid item xs={6} key={index}>
        <Button variant='contained' fullWidth color={responded?(getColor(index)):'primary'} onClick={()=>handleAnswer(index)}>
          <Typography variant="h5" component="h3">{answer}</Typography></Button>
      </Grid>
      ))}
      </Grid>
    </Grid>
  )
}

export default GameComponent