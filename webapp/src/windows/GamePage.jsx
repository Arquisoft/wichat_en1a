import React, { useCallback, useEffect, useState } from 'react';
import GameComponent from '../components/GameComponent';
import { Navigate, useLocation } from "react-router-dom";
import { Grid } from '@mui/material';
import AiChat from '../components/AiChat';
import axios from 'axios';
import AiBuddy from '../components/AiBuddy';

const GamePage = ({timePerQuestionTesting}) => {
  const gatewayUrl = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  const [questionNum,setQuestionNum] = useState(0);
  const [score,setScore] = useState(0);
  const [questionTimeTakenSum,setQuestionTimeTakenSum] = useState(0);
  const [aiBuddyOptionCommented,setAiBuddyOptionCommented]= useState("");

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

  const selectAiBuddyAnswer=(question)=>{
    const isCorrect = Math.random() < 0.5;
    if (isCorrect) return question.answers[question.correctAnswerId];
  
    let wrong;
    do {
      wrong = Math.floor(Math.random() * question.answers.length);
    } while (wrong === question.correctAnswerId);

    return question.answers[wrong];
  }

  const fetchData = useCallback(async () =>{ 
    try{
      const response = await axios.get(`${gatewayUrl}/api/questions/${questionType}/${numQuestions}`);
      setQuestions(response.data);
      setAiBuddyOptionCommented(selectAiBuddyAnswer(response.data[0]));
      setLoadedQuestions(true);
    }catch(err){
      throw new Error('Network error:'+err)
    }
  },[gatewayUrl,numQuestions,questionType]);
  const saveResult = useCallback(async(questionsFailed,accuracy,meanTimeToAnswer)=>{
    let done=false;
    do{
      try{
        await axios.post(`${gatewayUrl}/api/saveScore`, {
          "userId":sessionStorage.getItem("loggedInUser"),
          "score":score,
          "gameMode":gamemode,
          "questionsPassed":answersCorrect,
          "questionsFailed":questionsFailed,
          "accuracy":accuracy,
          "meanTimeToAnswer":meanTimeToAnswer,
        });
        done=true;
      }catch(err){
        console.error("An error ocurred while saving your result. Trying again...");
      }
    }while(!done);
  },[score, gamemode, answersCorrect,gatewayUrl]);
  
  useEffect(()=>{
    if (!loadedQuestions) {
      fetchData();
    }
  },[loadedQuestions,fetchData]);
  
  const handleQuestionAnswered = (correct,timeLeft) => {
      if(correct===true){
        setScore(score + Math.floor(1000*timeLeft/timePerQuestion));
        setAnswersCorrect(answersCorrect+1);
      }
      setQuestionTimeTakenSum(questionTimeTakenSum+(timePerQuestion-timeLeft)/1000);//change to seconds
      setAiBuddyOptionCommented(selectAiBuddyAnswer(questions[questionNum]));
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
      let meanTimeToAnswer=(questionTimeTakenSum/numQuestions).toFixed(2);
      let results = [{name:"gameMode",value:gamemode},{name:"score",value:score},{name:"questionsPassed",value:answersCorrect},{name:"questionsFailed",value:failed},{name:"accuracy",value:accuracy+"%"},{name:"meanTimeToAnswer",value:meanTimeToAnswer}];
      sessionStorage.setItem('gameResults',JSON.stringify(results));
      sessionStorage.setItem('lastGamemode',gamemode);
      sessionStorage.setItem('lastTopic',questionType);
      sessionStorage.setItem('lastQuestionNum',numQuestions);
      sessionStorage.setItem('timePerQuestion',timePerQuestion);
      saveResult(failed,accuracy,meanTimeToAnswer);
      setNavigate(true);
    }
  }, [endGame,answersCorrect, gamemode, numQuestions, questionNum, questionType, saveResult, score, timePerQuestion,questionTimeTakenSum]);
  return (
    <React.Fragment>
    {loadedQuestions && questions? (navigate?(<Navigate to="/results"/>):(
    <Grid container spacing={2} justifyContent="center">
      <Grid item><AiChat key={questionNum} question={questions[questionNum]}/></Grid>
      <Grid item xs={12} md={2} alignContent='center' justifyContent='center'>
        <AiBuddy key={questionNum} answerCommented={aiBuddyOptionCommented} />
      </Grid>
      <Grid item xs={12} md={9}>
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
