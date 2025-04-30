import React, { useEffect, useState } from 'react'
import { Button, Grid, LinearProgress, Typography, useTheme } from '@mui/material'

const GameComponent = ({ question={
    question:"Please pass the question parameter",
    image:"no image",
    correctAnswerId:0,
    correctAnswer:"None",
    answers:["No answer","No answer","No answer","No answer"]
  }, onQuestionAnswered=()=>{console.error("No parameters passed to component")}
  ,timePerQuestion=60000 }) => {
  const [responded,setResponded] = useState(false);
  const [guess,setGuess] = useState(-1);
  const totalTime = timePerQuestion;
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const theme=useTheme();

  const getColor=(number)=>{
    if(responded && number===question.correctAnswerId){
      return 'success';
    }else if(responded && number===guess){
      return 'error';
    }else{
      return "primary";
    }
  }
  const handleAnswer = (number) => {
    if(!responded){
      setResponded(true);
      setGuess(number);
      onQuestionAnswered(number===question.correctAnswerId,timeLeft); // Signal to parent to change the question
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
      <Grid item xs={12}><Typography id="gameQuestion" variant='h2' textAlign="center">{question.question}</Typography></Grid>
      
      <Grid item xs={8} component="img" flexGrow={1} src={question.image} alt="question hint image"
        sx={{maxHeight:"50vh",
          height: "50vh",
          width:"100%",
          borderRadius:2,
          boxShadow:3, 
          objectFit:"contain",
          paddingBottom:"1rem",
          backgroundColor:theme.palette.primary.main,
          transition: 'height 0.5s ease'}}></Grid>

      <Grid item xs={12}>
        <Typography variant="body2">Time left:</Typography>
        <LinearProgress data-testid="timeLeftBar" variant="determinate" value={(timeLeft / totalTime) * 100} sx={{ height: 15}} />
      </Grid>

      <Grid item container spacing={2} sx={{ width: "80%" }}>
      {question.answers.map((answer, index) => (
      <Grid item xs={6} key={index}>
        <Button variant='contained' id={"gameAnswer"+index} fullWidth color={getColor(index)} onClick={()=>handleAnswer(index)}>
          <Typography variant="h5" data-testid={"answerButton"+index} component="h3">{answer}</Typography></Button>
      </Grid>
      ))}
      </Grid>
    </Grid>
  )
}

export default GameComponent