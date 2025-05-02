import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Leaderboard from '../windows/Leaderboard';
import i18n from '../i18n';
import '@testing-library/jest-dom/extend-expect';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mocks:
global.fetch = jest.fn();

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    clear: jest.fn(() => { store = {}; }),
    removeItem: jest.fn((key) => { delete store[key]; }),
  };
})();

Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

jest.mock('../components/NavBarSignedIn', () => () => <div data-testid="navbar" />);

const customTheme = createTheme({
  palette: {
    secondary: {
      dark: '#000000',
      main: '#ffffff',
    },
  },
});

// Tests:
describe('Leaderboard Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ leaderboard: [] }),
    });

    render(
      <ThemeProvider theme={customTheme}>
        <Leaderboard />
      </ThemeProvider>
    );
  });

  test('renders error message when fetch fails', async () => {
    fetch.mockImplementation(() => Promise.reject(new Error('Fetch failed')));

    render(
      <ThemeProvider theme={customTheme}>
        <Leaderboard />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/error: Fetch failed/i)).toBeInTheDocument();
    });
  });

  test('renders leaderboard data correctly and highlights the logged-in player', async () => {
    const token = 'dummyValidToken';
    window.sessionStorage.getItem.mockReturnValue(token);
    const { jwtDecode } = require('jwt-decode');
    jwtDecode.mockReturnValue({ userId: 'user1' });

    // Prepare dummy responses for each game mode
    const gameModes = ['basicQuiz', 'expertDomain', 'timeAttack', 'endlessMarathon', 'custom'];
    const gameTitles = [
        i18n.t('gameModes.basicQuiz.name'),
        i18n.t('gameModes.expertDomain.name'),
        i18n.t('gameModes.timeAttack.name'),
        i18n.t('gameModes.endlessMarathon.name'),
        i18n.t('gameModes.custom.name')
    ];
    
    const responses = gameModes.map(mode => ({
      leaderboard: [
        { userId: 'Player 1', score: 100 },
        { userId: 'Logged In Player', score: 150 },
      ],
    }));

    fetch.mockImplementation((url) => {
      const mode = url.split('/').pop();
      const index = gameModes.indexOf(mode);
      return Promise.resolve({
        ok: true,
        json: async () => responses[index],
      });
    });

    render(
      <ThemeProvider theme={customTheme}>
        <Leaderboard />
      </ThemeProvider>
    );

    // Wait for the leaderboard sections to be rendered (only basicQuiz should be visible at first)
    await waitFor(() => {
      gameTitles.forEach((mode) => {
        expect(screen.getByText(mode)).toBeInTheDocument();
      });
    });
    expect(screen.getByTestId('navbar')).toBeInTheDocument();

    // Validate that leaderboard items appear
    const playerOneItems = screen.getAllByText('1. Player 1');
    expect(playerOneItems.length).toBe(gameModes.length);
    const loggedInItems = screen.getAllByText('2. Logged In Player');
    expect(loggedInItems.length).toBe(gameModes.length);
  });
});
