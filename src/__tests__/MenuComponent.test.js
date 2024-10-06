import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MenuComponent from '../components/MenuComponent';
import { MContext } from '../components/MyProvider';
import AuthenticationService from '../service/AuthenticationService';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock AuthenticationService
jest.mock('../service/AuthenticationService');

describe('MenuComponent', () => {
  const mockDispatch = jest.fn(); // Mock dispatch

  const renderWithProvider = (isUserLoggedIn) => {
    return render(
      <MContext.Provider value={{ state: { isUserLoggedIn }, dispatch: mockDispatch }}>
        <Router>
          <MenuComponent />
        </Router>
      </MContext.Provider>
    );
  };

  it('should render with the drawer closed by default', () => {
    renderWithProvider(false);
    const employeeText = screen.queryByText(/Employees/i);
    expect(employeeText).not.toBeVisible();
  });

  it('should close the drawer when the close button is clicked', async () => {
    renderWithProvider(false);

    fireEvent.click(screen.getByLabelText(/open drawer/i));
    expect(screen.getByText(/Employees/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/close drawer/i));

    await waitFor(() => {
      expect(screen.queryByText(/Employees/i)).not.toBeVisible();
    });
  });

  it('should show Login button if user is not logged in', () => {
    renderWithProvider(false);

    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
  });

  it('should show Logout button if user is logged in', () => {
    renderWithProvider(true);

    expect(screen.getByText(/logout/i)).toBeInTheDocument();
    expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
  });

  it('should call AuthenticationService.logout when Logout button is clicked', () => {
    renderWithProvider(true);

    AuthenticationService.logout.mockImplementation(jest.fn());

    fireEvent.click(screen.getByText(/logout/i));

    expect(AuthenticationService.logout).toHaveBeenCalled();
  });
});