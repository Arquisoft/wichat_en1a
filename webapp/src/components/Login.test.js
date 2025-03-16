import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter,Routes, Route } from 'react-router-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Login from './Login';
import '../i18n';

const mockAxios = new MockAdapter(axios);

describe('Login component', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  it('should log in successfully', async () => {
    render(<MemoryRouter>
      <Routes>
        <Route path='/' element={<Login />}/>
        <Route path='/home' element={'HomePage'}/>
      </Routes>
      </MemoryRouter>);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByTestId('loginButton');

    // Mock the axios.post request to simulate a successful response
    mockAxios.onPost('http://localhost:8000/login').reply(200, { token: 'token' });

    // Simulate user input
    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'testPassword' } });
    fireEvent.click(loginButton);

    // Verify that the user has been redirected
    await waitFor(() => {
    expect(screen.getByText(/HomePage/i)).toBeInTheDocument();
    });
  });

  it('should handle error when logging in', async () => {
    render(<MemoryRouter>
      <Routes>
        <Route path='/' element={<Login />}/>
        <Route path='/home' element={'HomePage'}/>
      </Routes>
      </MemoryRouter>);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByTestId('loginButton');

    // Mock the axios.post request to simulate an error response
    mockAxios.onPost('http://localhost:8000/login').reply(401, { error: 'Unauthorized' });

    // Simulate user input
    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'testPassword' } });

    // Trigger the login button click
    fireEvent.click(loginButton);

    // Wait for the error Snackbar to be open
    await waitFor(() => {
      expect(screen.getByTestId('errorNotification')).toBeInTheDocument();
    });
    //check it has not been redirected
    expect(window.location.pathname).not.toContain('/home')
  });
});
