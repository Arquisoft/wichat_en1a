import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '../i18n';
import ResultsPage from '../windows/ResultsPage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

describe('Results page', () => {
    
    let session = {};
    beforeEach(() => {
        window.sessionStorage = {
            setItem: (key, value) => {session[key] = JSON.stringify(value);},
            getItem: (key) => session[key] || null,
            removeItem: jest.fn(),
            clear: () => {session = {};}
        };
    });
    afterAll(()=>{jest.restoreAllMocks();});

  it('should show no stats if accessed without any game completed', async () => {
    render(<MemoryRouter>
        <Routes>
          <Route path='/' element={<ResultsPage/>}/>
          <Route path='/game' element={'game'}/>
        </Routes>
        </MemoryRouter>);
    
    expect(screen.queryByTestId("statsTable")).toBeNull();
    expect(screen.queryByTestId("playAgainButton")).toBeNull();
  });

  it('should show the stats of the last played game this session', async () => {
    const stats = [{"name":"stat1","value":"value1"},{"name":"stat2","value":"value2"}] 
    window.sessionStorage.setItem("gameResults",JSON.stringify(stats));
    render(<MemoryRouter>
          <Routes>
            <Route path='/' element={<ResultsPage/>}/>
            <Route path='/game' element={'game'}/>
          </Routes>
          </MemoryRouter>);
    
    await waitFor(() => {expect(screen.getByTestId("statsTable")).toBeInTheDocument();});
    expect(screen.getByTestId("playAgainButton")).toBeInTheDocument();
    await waitFor(()=>{expect(screen.getByTestId(stats[0].name)).toBeInTheDocument()});
    await waitFor(()=>{expect(screen.getByTestId(stats[0].value)).toBeInTheDocument()});
    fireEvent.click(screen.getByTestId("playAgainButton"));
    await waitFor(() => {
        expect(screen.getByText("game")).toBeInTheDocument();
    });
  });
});
