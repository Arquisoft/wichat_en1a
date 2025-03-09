import React from 'react';
import LogInOrUpPage from "./windows/LogInOrUpPage";
import IndexPage from './windows/IndexPage';
import {CssBaseline} from '@mui/material/';
import {BrowserRouter as Router,Route,Routes} from 'react-router-dom';

function App() {

  return (
    <Router>
      <CssBaseline/>
      <Routes>
        <Route path='/' element={<IndexPage></IndexPage>} />
        <Route path="/auth/:loginRequested" element={<LogInOrUpPage></LogInOrUpPage>}/>
        <Route path="/auth/" element={<LogInOrUpPage></LogInOrUpPage>}/>
      </Routes>
    </Router>
  );
}

export default App;
