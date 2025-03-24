import React, { useEffect, useState } from 'react';
import GameComponent from '../components/GameComponent';
import { Navigate } from "react-router-dom";
import { Grid } from '@mui/material';
import AiChat from '../components/AiChat';

const GamePage = ({ numQuestions,questionType,timePerQuestion }) => {
    const [questionNum,setQuestionNum] = useState(0);
    const [score,setScore] = useState(0);

    const [questions,setQuestions] = useState(null);
    const [loadedQuestions,setLoadedQuestions] =useState(false);
    const [endGame, setEndGame] = useState(false);
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT||'http://localhost:8000'

    const fetchData = async () =>{ 
        try{
            const response = await fetch(apiEndpoint+'/generate-questions?type='+questionType+'&numQuestions='+numQuestions);
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
    });
    
    const handleQuestionAnswered = (correct) => {
        if(correct===true){
          setScore(score+100);
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
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}><AiChat></AiChat></Grid>
      <Grid item xs={12} md={9}>
        {loadedQuestions && questions? (
            endGame?(<Navigate to="/results"/>):(
          <GameComponent key={questionNum} question={questions[questionNum]} // Pass current question
          onQuestionAnswered={handleQuestionAnswered} // Pass callback
          timePerQuestion={timePerQuestion}
          />)
      ) : (
        <div>Loading...</div>
      )}</Grid>
    </Grid>
  )
}
GamePage.defaultProps ={
  numQuestions:20,
  questionType:'flag',
  timePerQuestion:60,
};

export default GamePage