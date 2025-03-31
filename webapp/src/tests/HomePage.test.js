import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n'; // Ajusta la ruta si es necesario
import HomePage from '../windows/HomePage';
import { ThemeProvider, createTheme } from '@mui/material/styles';

jest.mock('../components/NavBarSignedIn', () => () => <div data-testid="navbar" />);

// Puedes definir un theme personalizado, o usar createTheme con tus overrides
const mockTheme = createTheme({
  palette: {
    primary: {
      light: 'rgb(216, 218, 211)',
      main: 'rgb(74, 74, 72)',
    },
    secondary: {
      light: 'rgb(241, 242, 235)',
      main: 'rgb(164, 194, 165)',
      dark: 'rgb(86, 98, 70)',
    },
    accent: {
      light: 'rgb(255, 255, 255)',
      main: 'rgb(0, 0, 0)',
      logout: 'rgb(105, 14, 11)',
    },
  },
});

describe('HomePage Component', () => {
  test('renders the HomePage with game modes', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <ThemeProvider theme={mockTheme}>
            <HomePage />
          </ThemeProvider>
        </MemoryRouter>
      </I18nextProvider>
    );
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText(i18n.t('homePage.welcome'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('gameModes.basicQuiz.name'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('gameModes.expertDomain.name'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('gameModes.timeAttack.name'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('gameModes.endlessMarathon.name'))).toBeInTheDocument();
  });

  test('toggles the switch for Expert Domain mode', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <ThemeProvider theme={mockTheme}>
            <HomePage />
          </ThemeProvider>
        </MemoryRouter>
      </I18nextProvider>
    );
    
    const toggle = screen.getByRole('checkbox');
    expect(toggle).toBeInTheDocument();
    expect(toggle).not.toBeChecked();

    fireEvent.click(toggle);
    expect(toggle).toBeChecked();
  });

  test('play button links to the game page', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <ThemeProvider theme={mockTheme}>
            <HomePage />
          </ThemeProvider>
        </MemoryRouter>
      </I18nextProvider>
    );
    
    const playButtons = screen.getAllByRole('link', { name: i18n.t('homePage.play') });
    playButtons.forEach((button) => {
      expect(button).toHaveAttribute('href', expect.stringMatching(/^\/game/));
    });
  });
});
