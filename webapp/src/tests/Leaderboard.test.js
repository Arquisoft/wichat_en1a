import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Leaderboard from '../windows/Leaderboard';
import '@testing-library/jest-dom/extend-expect';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mocks:
global.fetch = jest.fn();

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

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
    window.localStorage.getItem.mockReturnValue(token);
    const { jwtDecode } = require('jwt-decode');
    jwtDecode.mockReturnValue({ userId: 'user1' });

    // Prepare dummy responses for each game mode
    const gameModes = ['basicQuiz', 'expertDomain', 'timeAttack', 'endlessMarathon'];
    const gameTitles = [
        'gameModes.basicQuiz.name',
        'gameModes.expertDomain.name',
        'gameModes.timeAttack.name',
        'gameModes.endlessMarathon.name'
    ];
    
    const responses = gameModes.map(mode => ({
      leaderboard: [
        { id: mode + '1', name: 'Player 1', score: 100 },
        { id: 'user1', name: 'Logged In Player', score: 150 },
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

    // Wait for the leaderboard sections to be rendered
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
    loggedInItems.forEach(item => {
        expect(item.closest('.list-item')).toHaveClass('highlighted');
    });
  });
});
