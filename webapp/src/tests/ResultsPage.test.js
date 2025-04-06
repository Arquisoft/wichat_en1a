import React from 'react';
import { render, screen } from '@testing-library/react';
import '../i18n';
import ResultsPage from '../windows/ResultsPage';

describe('Results page', () => {
    

  it('should show no stats if accessed without any game completed', async () => {
    render(<ResultsPage/>);
      
    jest.spyOn(sessionStorage, 'getItem').mockReturnValue(null);

    
    expect(screen.queryByTestId("statsTable")).toBeNull();
    expect(screen.queryByTestId("playAgainButton")).toBeNull();
  });

  it('should show the stats of the last played game this session', async () => {
    render(<ResultsPage/>);
    
    const stats = [{name:"stat1",value:"value1"}] 
    jest.spyOn(sessionStorage, 'getItem').mockReturnValue(stats);

    expect(screen.getByTestId("statsTable")).toBeInTheDocument();
    expect(screen.getByTestId("playAgainButton")).toBeInTheDocument();
    expect(screen.getByText(stats[0].name)).toBeInTheDocument();
    expect(screen.getByTestId(stats[0].value)).toBeInTheDocument();

  });
});
