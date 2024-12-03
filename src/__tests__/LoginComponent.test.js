import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import LoginComponent from '../components/LoginComponent';
import AuthenticationService from '../service/AuthenticationService';
import { MContext } from '../components/MyProvider';

jest.mock('../service/AuthenticationService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

const mockContext = {
  setIsUserLoggedIn: jest.fn(),
  setUser: jest.fn()
};

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <MContext.Provider value={mockContext}>
      {children}
    </MContext.Provider>
  </BrowserRouter>
);

describe('LoginComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    render(<LoginComponent />, { wrapper: TestWrapper });
    expect(screen.getByTestId('loginHeader')).toHaveTextContent('Login');
    expect(screen.getByLabelText(/user name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const loginResponse = { data: { userId: 1, token: 'token123' } };
    AuthenticationService.login.mockResolvedValue(loginResponse);
    
    render(<LoginComponent />, { wrapper: TestWrapper });

    const usernameInput = screen.getByLabelText(/user name/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(AuthenticationService.login).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockContext.setIsUserLoggedIn).toHaveBeenCalledWith(true);
      expect(mockContext.setUser).toHaveBeenCalledWith({ id: 1, username: 'testuser' });
    });
  });

  it('handles failed login', async () => {
    AuthenticationService.login.mockRejectedValue(new Error('Invalid credentials'));
    
    render(<LoginComponent />, { wrapper: TestWrapper });

    const usernameInput = screen.getByLabelText(/user name/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await userEvent.type(usernameInput, 'wronguser');
    await userEvent.type(passwordInput, 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i);
      expect(mockContext.setIsUserLoggedIn).toHaveBeenCalledWith(false);
    });
  });

  it('navigates to register page', async () => {
    const navigateMock = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => navigateMock);

    render(<LoginComponent />, { wrapper: TestWrapper });
    await userEvent.click(screen.getByText(/no account\? register here/i));

    expect(navigateMock).toHaveBeenCalledWith('/register');
  });
});