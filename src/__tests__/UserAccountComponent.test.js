import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import UserAccountComponent from '../components/UserAccountComponent';
import AuthenticationService from '../service/AuthenticationService';

jest.mock('../service/AuthenticationService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

const mockUser = {
  id: 1,
  username: 'testuser',
  avatarUrl: null
};

describe('UserAccountComponent', () => {
  beforeEach(() => {
    sessionStorage.setItem('authenticatedUser', JSON.stringify(mockUser));
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  it('shows loading state when user is not loaded', () => {
    sessionStorage.clear();
    render(<UserAccountComponent />, { wrapper: BrowserRouter });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays user information after loading', () => {
    render(<UserAccountComponent />, { wrapper: BrowserRouter });
    expect(screen.getByText(`Welcome ${mockUser.username}`)).toBeInTheDocument();
  });

  it('displays default avatar when avatarUrl is not provided', () => {
    render(<UserAccountComponent />, { wrapper: BrowserRouter });
    expect(screen.getByTestId('PersonIcon')).toBeInTheDocument();
  });

  it('handles password update successfully', async () => {
    AuthenticationService.updatePassword.mockResolvedValue({});
    render(<UserAccountComponent />, { wrapper: BrowserRouter });

    await userEvent.type(screen.getByLabelText(/old password/i), 'oldpass');
    await userEvent.type(screen.getByLabelText(/new password/i), 'newpass');
    await userEvent.click(screen.getByText(/update password/i));

    await waitFor(() => {
      expect(screen.getByText('Password updated successfully')).toBeInTheDocument();
    });
  });

  it('handles password update error', async () => {
    AuthenticationService.updatePassword.mockRejectedValue({ 
      response: { data: 'Invalid password' } 
    });
    render(<UserAccountComponent />, { wrapper: BrowserRouter });

    await userEvent.type(screen.getByLabelText(/old password/i), 'oldpass');
    await userEvent.type(screen.getByLabelText(/new password/i), 'newpass');
    await userEvent.click(screen.getByText(/update password/i));

    await waitFor(() => {
      expect(screen.getByText(/error updating password/i)).toBeInTheDocument();
    });
  });

  it('closes snackbar when dismissed', async () => {
    AuthenticationService.updatePassword.mockResolvedValue({});
    render(<UserAccountComponent />, { wrapper: BrowserRouter });

    await userEvent.type(screen.getByLabelText(/old password/i), 'oldpass');
    await userEvent.type(screen.getByLabelText(/new password/i), 'newpass');
    await userEvent.click(screen.getByText(/update password/i));

    const closeButton = await screen.findByTitle(/close/i);
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Password updated successfully')).not.toBeInTheDocument();
    });
  });
});