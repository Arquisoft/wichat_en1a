import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import AiBuddy from '../components/AiBuddy';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n'; // Make sure your i18n setup is exported from here

const mockAxios = new MockAdapter(axios);

describe('AiBuddy component', () => {
  const mockAnswer = "Here's a helpful thought!";
  const answerCommented = "Why is the sky blue?";

  beforeEach(() => {
    mockAxios.reset();
  });

  it('should display the "thinking" text initially and then show the AI response', async () => {
    mockAxios
      .onPost('http://localhost:8000/api/aiBuddy')
      .reply(200, { answer: mockAnswer });

    render(
      <I18nextProvider i18n={i18n}>
        <AiBuddy answerCommented={answerCommented} />
      </I18nextProvider>
    );

    // Check initial loading text
    expect(screen.getByText("Let me see...")).toBeInTheDocument();

    // Wait for the AI's answer to appear
    await waitFor(() => {
      expect(screen.getByText(mockAnswer)).toBeInTheDocument();
    });
  });

  it('should display fallback message on API error', async () => {
    mockAxios
      .onPost('http://localhost:8000/api/aiBuddy')
      .networkError();

    render(
      <I18nextProvider i18n={i18n}>
        <AiBuddy answerCommented={answerCommented} />
      </I18nextProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("I really can't think of anything.")).toBeInTheDocument();
    });
  });
});
