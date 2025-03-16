import React, { useState } from 'react';
import GameComponent from '../components/GameComponent';
import { Grid } from '@mui/material';

const GamePage = () => {
    const [questionNum,setQuestionNum] = useState(-1);

    const [questions,setQuestions] = useState(null);
    const [loadedQuestions,setLoadedQuestions] =useState(false);
    const fetchData = async () =>{ 
        try{

            const response = await fetch('http://localhost:8004/generate-questions');
            if(!response.ok){
                throw new Error('Network error')
            }
            const result = await response.json();
            sessionStorage.setItem('responded',false);
            console.log(sessionStorage.getItem('responded'));
            setQuestions(result);
        }catch(err){
            console.log('Error fetching questions');
        }finally{
            setLoadedQuestions(true);
        }
    }
    if(loadedQuestions===false){
        fetchData();
    }else{
        console.log("fethced");
        if(sessionStorage.getItem('responded')=='false'){
            setQuestionNum(questionNum+1);
            sessionStorage.setItem('responded',true);
            sessionStorage.setItem('question',questions[questionNum]);
        }
    }
    

  return (
    <Grid container>
        {(sessionStorage.getItem('responded')=='true')?(<GameComponent></GameComponent>):(<div>loading...</div>)}
    </Grid>
  )
}

export default GamePage