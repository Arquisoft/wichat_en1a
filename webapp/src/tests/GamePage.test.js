import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import i18n from '../i18n'; 
import GamePage from '../windows/GamePage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockAxios = new MockAdapter(axios);

describe('Game Page', () => {
    const questions=[{"question":"¿De qué país es esta bandera?","image":"http://commons.wikimedia.org/wiki/Special:FilePath/Flag%20of%20Croatia.svg","correctAnswer":"Bandera de Croacia","correctAnswerId":1,"type":"flag","answers":["Bandera de los Países Bajos","Bandera de Croacia","bandera de Luxemburgo","Bandera de Polonia"]},{"question":"¿De qué Paiz es esta bandera?","image":"http://commons.wikimedia.org/wiki/Special:FilePath/Flag%20of%20Luxembourg.svg","correctAnswer":"bandera de Luxemburgo","correctAnswerId":0,"type":"flag","answers":["bandera de Luxemburgo","Bandera de Burkina Faso","Bandera de Marruecos","bandera de Chipre"]}]
    beforeEach(() => {
      sessionStorage.clear();
      mockAxios.reset();
      mockAxios.onGet('http://localhost:8000/questions/all/10').reply(200, questions);
    });

    const renderGameComp=()=>{
      render(
        <I18nextProvider i18n={i18n}>
          <MemoryRouter>
          <Routes>
            <Route path='/' element={<GamePage/>}/>
            <Route path='/results' element={'Results page'}/>
          </Routes>
          </MemoryRouter>
        </I18nextProvider>
      );
    }

    test('renders the question component', async () => {
      renderGameComp();
      
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      },{timeout: 3000});
      expect(screen.getByText(questions[0].question)).toBeInTheDocument();
      expect(screen.getByAltText('question hint image')).toBeInTheDocument();
      expect(screen.getByTestId('timeLeftBar')).toBeInTheDocument();
      expect(screen.getByTestId('answerButton0')).toBeInTheDocument();
      expect(screen.getByTestId('answerButton1')).toBeInTheDocument();
      expect(screen.getByTestId('answerButton2')).toBeInTheDocument();
      expect(screen.getByTestId('answerButton3')).toBeInTheDocument();
  });

  test('pushing the correct answers triggers the next question to be asked and finish the game correctly', async () => {
    renderGameComp();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    },{timeout: 3000});
    expect(screen.getByText(questions[0].question)).toBeInTheDocument();
    const buttonQuestion1 = screen.getByTestId('answerButton1');//click correct answer
    expect(buttonQuestion1).toBeInTheDocument();
    
    fireEvent.click(buttonQuestion1);
    //changed question
    
    await waitFor(() => {
    expect(screen.getByText(questions[1].question)).toBeInTheDocument();
    },{timeout: 3000});
    const buttonQuestion2 = screen.getByTestId('answerButton0');//click correct answer
    expect(buttonQuestion2).toBeInTheDocument();
    fireEvent.click(buttonQuestion2);

    expect(screen.getByText(/Results page/i)).toBeInTheDocument();
    expect(sessionStorage.getItem("score")).toEqual("200");
    expect(sessionStorage.getItem("questionNum")).toEqual("2");
  });

  test('timeout triggers callback method', async () => {
    render(
    <I18nextProvider i18n={i18n}>
    <MemoryRouter>
    <Routes>
      <Route path='/' element={<GamePage timePerQuestionTesting={2} />}/>
      <Route path='/results' element={'Results page'}/>
    </Routes>
    </MemoryRouter>
    </I18nextProvider>
    );
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    },{timeout: 3000});
    expect(screen.getByText(questions[0].question)).toBeInTheDocument();
    await waitFor(()=>{expect(screen.getByText(questions[1].question)).toBeInTheDocument()},{timeout: 3000})
    await waitFor(()=>{expect(screen.queryByText(questions[1].question)).not.toBeInTheDocument()},{timeout: 3000})

    await waitFor(()=>{expect(screen.getByText(/Results page/i)).toBeInTheDocument()});
    expect(sessionStorage.getItem("score")).toEqual("0");
    expect(sessionStorage.getItem("questionNum")).toEqual("2");
  });
});
