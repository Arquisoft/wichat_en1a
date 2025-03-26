import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import AddUser from './AddUser';
import '../i18n';

const mockAxios = new MockAdapter(axios);

describe('AddUser component', () => {
  let signedUp=false;
  const callbackFunction=()=>{
    signedUp=true
  }
  beforeEach(() => {
    mockAxios.reset();
    signedUp=false;
  });

  it('should add user successfully', async () => {
    render(<MemoryRouter>
          <Routes>
            <Route path='/' element={<AddUser callback={callbackFunction}/>}/>
            <Route path='/home' element={'HomePage'}/>
          </Routes>
          </MemoryRouter>);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const repeatPasswordInput = screen.getByLabelText('Repeat password');
    const signupButton = screen.getByTestId('signupButton');

    // Mock the axios.post request to simulate a successful response
    mockAxios.onPost('http://localhost:8000/adduser').reply(200,{});

    // Simulate user input
    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'testPassword' } });
    fireEvent.change(repeatPasswordInput, { target: { value: 'testPassword' } });

    // Trigger the add user button click
    fireEvent.click(signupButton);

    // Wait for the Snackbar to be open
    await waitFor(() => {
      expect(signedUp).toBeTruthy();
    });
  });

  it('should handle error when adding user', async () => {
    render(<MemoryRouter>
      <Routes>
        <Route path='/' element={<AddUser callback={callbackFunction}/>}/>
        <Route path='/home' element={'HomePage'}/>
      </Routes>
      </MemoryRouter>);

    const usernameInput = screen.getByLabelText('Username');
    const passwordInput = screen.getByLabelText('Password');
    const repeatPasswordInput = screen.getByLabelText('Repeat password');
    const signupButton = screen.getByTestId('signupButton');

    // Mock the axios.post request to simulate an error response
    mockAxios.onPost('http://localhost:8000/adduser').reply(500, { error: 'Internal Server Error' });

    // Simulate user input
    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'testPassword' } });
    fireEvent.change(repeatPasswordInput, { target: { value: 'test' } });

    // Trigger the add user button click
    fireEvent.click(signupButton);

    // Wait for the error Snackbar to be open
    await waitFor(() => {
        expect(screen.getByText(/An error ocurred during singup, please try again./i)).toBeInTheDocument();
    });
    
    expect(signedUp).toBeFalsy();
  });
});
