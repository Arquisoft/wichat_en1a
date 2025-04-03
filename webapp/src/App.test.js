import { render, screen } from '@testing-library/react';
import App from './App';
import {I18nextProvider} from 'react-i18next';
import i18n from './i18n';

test('renders welcome message', () => {
  render(
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>);
  const welcomeMessage = screen.getByText("What is Wichat");
  expect(welcomeMessage).toBeInTheDocument();
});
