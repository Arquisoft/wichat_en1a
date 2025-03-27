import React, { useEffect, useState } from 'react'
import { Button, Grid, LinearProgress, Typography, useTheme } from '@mui/material'

const GameComponent = ({ question={
  question:"Please pass the question parameter",
  image:"no image",
  correctAnswerId:0,
  correctAnswer:"None",
  answers:{0:"None",1:"None",2:"None",3:"None"}}, onQuestionAnswered=()=>{throw new Error("No parameters passed to component")}
  ,timePerQuestion=60000 }) => {
  const [responded,setResponded] = useState(false);
  const totalTime = timePerQuestion;
  const [timeLeft, setTimeLeft] = useState(totalTime);
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
      const timer = setTimeout(() => {setTimeLeft(timeLeft - 500);}, 500);
      return () => clearTimeout(timer);
    }else{
      handleAnswer(-1);//no answer provided in time, look for next question.
    }
  });
  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center" >
      <Grid item xs={12}><Typography variant='h2' textAlign="center">{question.question}</Typography></Grid>
      
      <Grid item xs={8} component="img" flexGrow={1} src={question.image} alt="question hint image"
        sx={{maxHeight:"60vh",width:"100%",borderRadius:2,boxShadow:3, objectFit:"contain",backgroundColor:theme.palette.primary.main}}></Grid>

      <Grid item xs={12}>
        <Typography variant="body2">Time left:</Typography>
        <LinearProgress data-testid="timeLeftBar" variant="determinate" value={(timeLeft / totalTime) * 100} sx={{ height: 15}} />
      </Grid>

      <Grid item container spacing={2} sx={{ width: "80%" }}>
      {question.answers.map((answer, index) => (
      <Grid item xs={6} key={index}>
        <Button variant='contained' fullWidth color={responded?(getColor(index)):'primary'} onClick={()=>handleAnswer(index)}>
          <Typography variant="h5" data-testid={"answerButton"+index} component="h3">{answer}</Typography></Button>
      </Grid>
      ))}
      </Grid>
    </Grid>
  )
}

export default GameComponent