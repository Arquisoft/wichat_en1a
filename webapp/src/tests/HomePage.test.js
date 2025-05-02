import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import HomePage from '../windows/HomePage';
import { ThemeProvider, createTheme } from '@mui/material/styles';

jest.mock('../components/NavBarSignedIn', () => () => <div data-testid="navbar" />);
jest.mock('../components/RandomRoulette', () => (props) => (
  <div
    data-testid="roulette"
    onClick={() => {
      props.onClickSpin();
      props.onSelectTopic('science');
    }}
  >
    Spin
  </div>
));

const mockTheme = createTheme({
  palette: {
    primary: { 
      main: 'rgb(74, 74, 72)' 
    },
    secondary: { 
      light: 'rgb(241, 242, 235)',
      main: 'rgb(164, 194, 165)',
      dark: 'rgb(86, 98, 70)'
    },
    accent: { 
      main: 'rgb(0, 0, 0)'
    }
  }
});

describe('HomePage Component', () => {
  const renderHome=()=>{
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <ThemeProvider theme={mockTheme}>
            <HomePage />
          </ThemeProvider>
        </MemoryRouter>
      </I18nextProvider>
    );
  }

  test('Renders the HomePage with all game modes', () => {
    renderHome();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText(i18n.t('homePage.welcome'))).toBeInTheDocument();
    
    // Check each game mode title and description
    const gameModes = [
      'gameModes.basicQuiz.name',
      'gameModes.expertDomain.name',
      'gameModes.timeAttack.name',
      'gameModes.endlessMarathon.name',
      'gameModes.custom.name'
    ];
    gameModes.forEach(mode => {
      expect(screen.getByText(i18n.t(mode))).toBeInTheDocument();
    });
  });

  test("Toggles the switches for Expert's Domain mode and Custom game mode and updates UI", () => {
    renderHome();    
    const toggles = screen.getAllByRole('checkbox');
    for (let i = 0; i < toggles.length; i++) {
      expect(toggles[i]).toBeInTheDocument();
      expect(toggles[i]).not.toBeChecked();

      // Click to turn on randomization (roulette must be shown and selector must be hidden)
      fireEvent.click(toggles[i]);
      expect(toggles[i]).toBeChecked();
      const roulettes = screen.getAllByTestId('roulette');
      
      for (let j = 0; j < roulettes.length; j++) {
        expect(roulettes[j]).toBeInTheDocument();
      }
      
      // Click to turn off randomization (roulette must be hidden and selector must be shown)
      fireEvent.click(toggles[i]);
      expect(toggles[i]).not.toBeChecked();

      for (let j = 0; j < roulettes.length; j++) {
        expect(roulettes[j]).not.toBeInTheDocument();
      }
    }
  });

  test("Shows the topic dropdown when Expert's Domain is not randomized", () => {
    renderHome();
    const topicDropdowns = screen.getAllByLabelText('Topic');
    for (let i = 0; i < topicDropdowns.length; i++) {
      expect(topicDropdowns[i]).toBeInTheDocument();
        
      fireEvent.mouseDown(topicDropdowns[i]);
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
      
      const topicTexts = screen.getAllByText(i18n.t('roulette.topics.science'))
      fireEvent.click(topicTexts[i]);
      expect(topicDropdowns[i]).toHaveTextContent(i18n.t('roulette.topics.science'));
    }
  });

  test('Disables switch after clicking roulette spin button', async () => {
    renderHome();
    const toggles = screen.getAllByRole('checkbox');
    fireEvent.click(toggles[0]);
    const spinButtons = screen.getAllByTestId('roulette');
    expect(spinButtons[0]).toBeInTheDocument();
    fireEvent.click(spinButtons[0]);
    expect(toggles[0]).toBeDisabled();
  });

  test('Play button links to the correct game URL', () => {
    renderHome();
    const playButtons = screen.getAllByRole('link', { name: i18n.t('homePage.play') });
    
    playButtons.forEach((button) => {
      expect(button).toHaveAttribute('href', expect.stringMatching(/^\/game\?mode=/));
    });
  });
});
