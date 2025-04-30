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

  test('Toggles the switch for Expert Domain mode and updates UI', () => {
    renderHome();    
    const toggle = screen.getByRole('checkbox');
    expect(toggle).toBeInTheDocument();
    expect(toggle).not.toBeChecked();
    
    // Click to turn on randomization (roulette must be shown and selector must be hidden)
    fireEvent.click(toggle);
    expect(toggle).toBeChecked();
    expect(screen.getByTestId('roulette')).toBeInTheDocument();

    // Click to turn off randomization (roulette must be hidden and selector must be shown)
    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
    expect(screen.queryByTestId('roulette')).not.toBeInTheDocument();
  });

  test('Shows the topic dropdown when Expert Domain is not randomized', () => {
    renderHome();
    const topicDropdown = screen.getByLabelText('Topic');
    expect(topicDropdown).toBeInTheDocument();
    
    fireEvent.mouseDown(topicDropdown);
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
    
    fireEvent.click(screen.getByText(i18n.t('roulette.topics.science')));
    expect(topicDropdown).toHaveTextContent(i18n.t('roulette.topics.science'));
  });

  test('Disables switch after clicking roulette spin button', async () => {
    renderHome();
    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);
  
    const spinButton = screen.getByTestId('roulette');
    expect(spinButton).toBeInTheDocument();
  
    fireEvent.click(spinButton);
    expect(toggle).toBeDisabled();
  });

  test('Play button links to the correct game URL', () => {
    renderHome();
    const playButtons = screen.getAllByRole('link', { name: i18n.t('homePage.play') });
    
    playButtons.forEach((button) => {
      expect(button).toHaveAttribute('href', expect.stringMatching(/^\/game\?mode=/));
    });
  });
});
