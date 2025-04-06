import React, { useEffect, useState } from 'react';
import GameComponent from '../components/GameComponent';
import { Navigate, useLocation } from "react-router-dom";
import { Grid } from '@mui/material';
import AiChat from '../components/AiChat';
import axios from 'axios';

const GamePage = ({timePerQuestionTesting}) => {
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  const [questionNum,setQuestionNum] = useState(0);
  const [score,setScore] = useState(0);

  const [questions ,setQuestions] = useState(null);
  const [loadedQuestions, setLoadedQuestions] = useState(false);
  const [endGame, setEndGame] = useState(false);
  const [navigate, setNavigate] = useState(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const gamemode = (params.get('mode')?params.get('mode'):'basic');
  const numQuestions = (params.get('numQuestions')) ? params.get('numQuestions') : 10; // By default, 10 questions. In endless mode and time attack it is infinite
  const questionType = (params.get('questionType')) ? params.get('questionType') : 'all'; // By default, any type of questions. In expert's domain, it is a concrete topic.
  const timePerQuestion = (params.get('timePerQuestion')) ? params.get('timePerQuestion') : 60000; // By default, 60 seconds per question. In time attack mode, it is total time. In endless, infinite time.
  
  //score
  const [answersCorrect,setAnswersCorrect]=useState(0);

  const fetchData = async () =>{ 
    try{
      const response = await axios.get(`${gatewayUrl}/questions/${questionType}/${numQuestions}`);
      setQuestions(response.data);
      setLoadedQuestions(true);
    }catch(err){
      throw new Error('Network error:'+err)
    }
  }
  const saveResult = async(questionsFailed,accuracy)=>{
    let done=false;
    do{
      try{
        await axios.post(`${gatewayUrl}/saveScore`, {
          "userId":sessionStorage.getItem("sessionToken"),
          "score":score,
          "gameMode":gamemode,
          "questionsPassed":answersCorrect,
          "questionsFailed":questionsFailed,
          "accuracy":accuracy,
        });
      }catch(err){
        console.error("An error ocurred while saving your result. Trying again...");
      }
    }while(!done);
  }
  useEffect(()=>{
    if (!loadedQuestions) {
      fetchData();
    }
  });
  
  const handleQuestionAnswered = (correct) => {
      if(correct===true){
        setScore(score + 100);
        setAnswersCorrect(answersCorrect+1);
      }
      if (questionNum < questions.length - 1) { // Check if there are more questions
        setTimeout(() => {setQuestionNum((prev) => prev + 1);}, 1000);
      } else {
        setTimeout(() => setEndGame(true), 1000);
      }
  };
  useEffect(() => {
    // This will ensure sessionStorage is updated after score change
    if(endGame){
      let failed=(questionNum+1)-answersCorrect;
      let accuracy=(answersCorrect*100/(questionNum+1));
      let results = [{name:"gameMode",value:gamemode},{name:"score",value:score},{name:"questionsPassed",value:answersCorrect},{name:"questionsFailed",value:failed},{name:"accuracy",value:accuracy+"%"}];
      sessionStorage.setItem('gameResults',JSON.stringify(results));
      sessionStorage.setItem('lastGamemode',gamemode);
      sessionStorage.setItem('lastTopic',questionType);
      sessionStorage.setItem('lastQuestionNum',numQuestions);
      sessionStorage.setItem('timePerQuestion',timePerQuestion);
      saveResult(failed,accuracy);
      setNavigate(true);
    }
  }, [endGame]);
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
