import { render, screen } from '@testing-library/react';
import App from './App';
import { useTranslation } from 'react-i18next';


test('renders welcome message', () => {
  render(<App />);
  const{t} = useTranslation();
  const welcomeMessage = screen.getByText(t('index.title'));
  expect(welcomeMessage).toBeInTheDocument();
});


