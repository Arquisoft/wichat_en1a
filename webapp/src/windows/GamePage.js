import React, { useEffect, useState } from 'react';
import GameComponent from '../components/GameComponent';
import { Navigate, useLocation } from "react-router-dom";
import { Grid } from '@mui/material';
import AiChat from '../components/AiChat';
import axios from 'axios';

const GamePage = ({timePerQuestionTesting}) => {
  const gatewayUrl = process.env.GATEWAY_SERVICE_URL || 'http://localhost:8000';
  const [questionNum,setQuestionNum] = useState(0);
  const [score,setScore] = useState(0);

  const [questions,setQuestions] = useState(null);
  const [loadedQuestions,setLoadedQuestions] =useState(false);
  const [endGame, setEndGame] = useState(false);
  const [navigate, setNavigate] = useState(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const mode = params.get('mode') || 'basic-quiz'; // Default game mode is 'basic-quiz' if not provided
  const numQuestions = (params.get('numQuestions'))?params.get('numQuestions'):10;  
  const questionType = (params.get('questionType'))?params.get('questionType'):'flag';  
  const timePerQuestion = (params.get('timePerQuestion'))?params.get('timePerQuestion'):60000;  

  const fetchData = async () =>{ 
    try{
      const response = await axios.get(`${gatewayUrl}/generate-questions?type=${questionType}&numQuestions=${numQuestions}`);
      setQuestions(response.data);
      setLoadedQuestions(true);
    }catch(err){
      throw new Error('Network error:'+err)
    }
  }
  useEffect(()=>{
      if (!loadedQuestions) {
          fetchData();
      }
  });
  
  const handleQuestionAnswered = (correct) => {
      if(correct===true){
        setScore(score + 100);
      }
      if (questionNum < questions.length - 1) { // Check if there are more questions
        setTimeout(() => {setQuestionNum((prev) => prev + 1);}, 1000);
      } else {
        setEndGame(true);
      }
  };
  useEffect(() => {
    // This will ensure sessionStorage is updated after score change
    if(endGame){
      sessionStorage.setItem('score',score);
      sessionStorage.setItem('questionNum',questionNum+1);
      setNavigate(true);
    }
  }, [endGame,score,questionNum]);
  return (
    <React.Fragment>
    {loadedQuestions && questions? (navigate?(<Navigate to="/results"/>):(
    <Grid container spacing={2} justifyContent="center">
      <Grid item><AiChat key={questionNum} question={questions[questionNum]}/></Grid>
      <Grid item md={10}>
        <GameComponent key={questionNum} question={questions[questionNum]} // Pass current question
        onQuestionAnswered={handleQuestionAnswered} // Pass callback
        timePerQuestion={timePerQuestionTesting?timePerQuestionTesting:timePerQuestion}
        />
      </Grid>
    </Grid>)
    ) : (
      <div>Loading...</div>
    )}
    </React.Fragment>
  )
}

export default GamePage