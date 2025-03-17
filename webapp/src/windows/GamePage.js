import React, { useEffect, useState } from 'react';
import GameComponent from '../components/GameComponent';
import { Navigate } from "react-router-dom";
import { Grid } from '@mui/material';

const GamePage = () => {
    const [questionNum,setQuestionNum] = useState(-1);
    const [score,setScore] = useState(0);

    const [questions,setQuestions] = useState(null);
    const [loadedQuestions,setLoadedQuestions] =useState(false);
    const [responded, setResponded] = useState(false);
    const [endGame, setEndGame] = useState(false);
    const fetchData = async () =>{ 
        try{
            const response = await fetch('http://localhost:8000/generate-questions');
            if(!response.ok){
                throw new Error('Network error')
            }
            const result = await response.json();
            setQuestions(result);
            setResponded(false);
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
    useEffect(() => {
        if(loadedQuestions && !responded){
            setQuestionNum(questionNum+1);
            setResponded(true);
        }
    }, [loadedQuestions, responded, questionNum]);
    
    const handleQuestionAnswered = (correct) => {
        if(correct===true){
            setScore(score+1);
        }
        if (questionNum < questions.length - 1) { // Check if there are more questions
          setQuestionNum((prev) => prev + 1);
          setResponded(true); // Keep responded true, or reset it if your logic requires
        } else {
          sessionStorage.setItem('score',score);
          sessionStorage.setItem('questionNum',questionNum);
          setEndGame(true);
        }
    };

  return (
    <Grid container>
        {loadedQuestions && questions? (
        responded ? (
            endGame?(<Navigate to="/results"/>):(
          <GameComponent question={questions[questionNum]} // Pass current question
          onQuestionAnswered={handleQuestionAnswered} // Pass callback
          />)
        ) : (
          <div>Preparing question...</div>
        )
      ) : (
        <div>Loading...</div>
      )}
    </Grid>
  )
}

export default GamePage