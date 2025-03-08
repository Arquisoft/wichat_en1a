import React from 'react';
import {LogInOrUpPage,IndexPage} from './windows/';
import {CssBaseline} from '@mui/material/';
import {BrowserRouter as Router,Route,Routes} from 'react-router-dom';

function App() {

  return (
    <Router>
      <CssBaseline/>
      <Routes>
        <Route path='/' element={<IndexPage></IndexPage>} />
        <Route path="/login" element={<LogInOrUpPage></LogInOrUpPage>}/>
      </Routes>
    </Router>
  );
}

export default App;
