import React, { useEffect, useState } from 'react';
import GameComponent from '../components/GameComponent';
import { Navigate } from "react-router-dom";
import { Grid } from '@mui/material';

const GamePage = () => {
  const gatewayUrl = process.env.GATEWAY_SERVICE_URL || 'http://localhost:8000';
  const [questionNum,setQuestionNum] = useState(0);
  const [score,setScore] = useState(0);

  const [questions,setQuestions] = useState(null);
  const [loadedQuestions,setLoadedQuestions] =useState(false);
  const [endGame, setEndGame] = useState(false);
  const fetchData = async () =>{ 
    try{
        const response = await fetch(gatewayUrl+'/generate-questions?type=city&numQuestions=20');
        if(!response.ok){
            throw new Error('Network error')
        }
        const result = await response.json();
        setQuestions(result);
        setLoadedQuestions(true);
    }catch(err){
        console.error('Error fetching questions: ',err);
    }
  }
  useEffect(()=>{
      if (!loadedQuestions) {
          fetchData();
      }
  }, [loadedQuestions]);
  
  const handleQuestionAnswered = (correct) => {
    console.log("change question")
      if(correct===true){
        setScore(score+1);
      }
      if (questionNum < questions.length - 1) { // Check if there are more questions
        setTimeout(() => {setQuestionNum((prev) => prev + 1);}, 1000);
      } else {
        sessionStorage.setItem('score',score);
        sessionStorage.setItem('questionNum',questionNum+1);
        setEndGame(true);
      }
  };

  return (
    <Grid container minHeight='100vh' alignContent='center'>
        {loadedQuestions && questions? (
            endGame?(<Navigate to="/results"/>):(
          <GameComponent key={questionNum} question={questions[questionNum]} // Pass current question
          onQuestionAnswered={handleQuestionAnswered} // Pass callback
          />)
      ) : (
        <div>Loading...</div>
      )}
    </Grid>
  )
}

export default GamePage