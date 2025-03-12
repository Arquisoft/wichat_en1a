import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n'; // Adjust path if necessary
import HomePage from '../windows/HomePage';

jest.mock('../components/NavBarSignedIn', () => () => <div data-testid="navbar" />);

describe('HomePage Component', () => {
  test('renders the HomePage with game modes', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <HomePage />
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
          <HomePage />
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
          <HomePage />
        </MemoryRouter>
      </I18nextProvider>
    );
    
    const playButtons = screen.getAllByRole('link', { name: i18n.t('homePage.play') });
    playButtons.forEach((button) => {
      expect(button).toHaveAttribute('href', '/game');
    });
  });
});
