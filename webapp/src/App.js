import React from 'react';
import LogInOrUpPage from "./windows/LogInOrUpPage";
import IndexPage from './windows/IndexPage';
import HomePage from './windows/HomePage';
import LoggedInRoutes from './LoggedInRoutes';
import GamePage from './windows/GamePage';
import RandomRulette from './windows/RandomRoulette';
import ResultsPage from './windows/ResultsPage';
import {CssBaseline, ThemeProvider, createTheme} from '@mui/material/';
import {BrowserRouter as Router,Route,Routes} from 'react-router-dom';

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        light: 'rgb(216, 218, 211)',
        main: 'rgb(74, 74, 72)',
      },
      secondary: {
        light: 'rgb(241, 242, 235)',
        main: 'rgb(164, 194, 165)',
        dark: 'rgb(86, 98, 70)'
      }
    }
  });
  

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <CssBaseline/>
        <Routes>
          <Route path='/' element={<IndexPage></IndexPage>} />
          <Route path="/auth/:loginRequested" element={<LogInOrUpPage></LogInOrUpPage>}/>
          <Route path="/auth" element={<LogInOrUpPage></LogInOrUpPage>}/>
          <Route path="/home" element={<HomePage/>/*TODO remember to add loggedinRoutes */}/>
          <Route path="/game/basic-quiz" element={<GamePage/>/*TODO remember to add loggedinRoutes */}/>
          <Route path="/game/roulette" element={<RandomRulette/>/*TODO remember to add loggedinRoutes */}/>
          <Route path="/results" element={<ResultsPage/>/*TODO remember to add loggedinRoutes */}/>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;