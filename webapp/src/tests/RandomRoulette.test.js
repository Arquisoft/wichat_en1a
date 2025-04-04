import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import Roulette from '../components/RandomRoulette';

describe('Roulette component', () => {
  beforeAll(() => {
    if (!window.crypto) {
      Object.defineProperty(window, 'crypto', {
        value: {
          getRandomValues: jest.fn((array) => {
            array[0] = 0; // Always returns 0 for predictability
            return array;
          }),
        },
      });
    }
  });

  beforeEach(() => {
    // We are going to use fake timers for the timeout in the spin of the roulette component
    jest.useFakeTimers();
    // Overriding crypto.getRandomValues to return a fixed value (0) so calculations are predictable and can be tested
    jest.spyOn(window.crypto, 'getRandomValues').mockImplementation((array) => {
      array[0] = 0; // Mock implementation that always return 0
      return array;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('Renders the spin button and all topics', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Roulette onSelectTopic={jest.fn()} onClickSpin={jest.fn()} />
      </I18nextProvider>
    );
    
    // Checking that the spin button is rendered with the correct label
    expect(screen.getByRole('button', { name: i18n.t('roulette.spin') })).toBeInTheDocument();
    
    // Checking that each topic is rendered on the wheel
    expect(screen.getByText(i18n.t('roulette.topics.flags'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('roulette.topics.science'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('roulette.topics.cities'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('roulette.topics.sports'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('roulette.topics.celebrities'))).toBeInTheDocument();
  });

  // Async test to check that the roulette spins and selects a topic after a delay
  test('Clicking spin disables the button and eventually calls onSelectTopic', async () => {
    const onSelectTopicMock = jest.fn();
    const onClickSpinMock = jest.fn();
    
    render(
      <I18nextProvider i18n={i18n}>
        <Roulette onSelectTopic={onSelectTopicMock} onClickSpin={onClickSpinMock} />
      </I18nextProvider>
    );
    
    const spinButton = screen.getByRole('button', { name: i18n.t('roulette.spin') });
    expect(spinButton).toBeEnabled();
    fireEvent.click(spinButton);

    expect(onClickSpinMock).toHaveBeenCalled();
    // The button should be disabled after clicking
    expect(spinButton).toBeDisabled();
    
    // Advances the timers by 3000ms to simulate the spin duration
    jest.advanceTimersByTime(3000);
    
    // Waits for the asynchronous update triggered by setTimeout
    // Another option would be using act() from react-testing-library, but it is deprecated
    await waitFor(() => {
        // Our mock example returns 0 for secureRandom, so the calculated winning index will be 0.
        // This means that the selected topic will be the lowercase version of the first topic (flags).
        const expectedTopic = i18n.t('roulette.topics.flags').toLowerCase();
        expect(onSelectTopicMock).toHaveBeenCalledWith(expectedTopic);    
        expect(screen.getByText(new RegExp(i18n.t('roulette.topic'), 'i'))).toBeInTheDocument();
    });
});

  test('Does not trigger spin if already spinning', () => {
    const onSelectTopicMock = jest.fn();
    const onClickSpinMock = jest.fn();
    
    render(
      <I18nextProvider i18n={i18n}>
        <Roulette onSelectTopic={onSelectTopicMock} onClickSpin={onClickSpinMock} />
      </I18nextProvider>
    );
    
    const spinButton = screen.getByRole('button', { name: i18n.t('roulette.spin') });
    fireEvent.click(spinButton);
    fireEvent.click(spinButton);
    // Ensure onClickSpin is only called once
    expect(onClickSpinMock).toHaveBeenCalledTimes(1);
  });
});
