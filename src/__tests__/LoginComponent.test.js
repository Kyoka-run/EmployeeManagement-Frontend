import { render, screen, fireEvent, act } from '@testing-library/react'; 
import LoginComponent from '../components/LoginComponent'; 
import AuthenticationService from '../service/AuthenticationService';  
import { MContext } from '../components/MyProvider.jsx';  
import { MemoryRouter } from 'react-router-dom';  
import '@testing-library/jest-dom';

// Mock the withRouter higher-order component (HOC) to avoid testing route functionality
jest.mock('../components/withRouter.jsx', () => (component) => component);

// Mock the AuthenticationService functions so that they don't make real API calls during testing
jest.mock('../service/AuthenticationService', () => ({
  login: jest.fn(),  // Mock login function
  registerSuccessfulLogin: jest.fn(),  // Mock registerSuccessfulLogin function
}));

describe('LoginComponent', () => {  // Start of the test suite for the LoginComponent

  // Mock navigation function (simulates the use of history in real app)
  const mockNavigation = jest.fn();

  // Mock context that simulates the provider's context used in the real app
  const mockContext = { setIsUserLoggedIn: jest.fn() };

  // Function to render the component with required context and router for each test
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <MContext.Provider value={mockContext}>
          <LoginComponent navigation={mockNavigation} />
        </MContext.Provider>
      </MemoryRouter>
    );
  };

  // Test case 1: Ensure that the login form renders correctly
  it('should render the login form', () => {
    renderComponent();  // Render the LoginComponent
    
    // Verify if various elements of the form exist
    expect(screen.getByTestId('loginHeader')).toHaveTextContent('Login');
    expect(screen.getByTestId('username')).toBeInTheDocument();
    expect(screen.getByTestId('password')).toBeInTheDocument();
    expect(screen.getByTestId('login')).toBeInTheDocument();
  });

  // Test case 2: Simulate input changes in the username and password fields
  it('should update state on input change', () => {
    renderComponent();

    // Get the actual input elements inside the MUI TextField components
    const usernameInput = screen.getByLabelText('User Name');
    const passwordInput = screen.getByLabelText('Password');

    // Simulate typing in the username and password fields
    act(() => {
      fireEvent.change(usernameInput, { target: { value: 'testuser', name: 'username' } });
      fireEvent.change(passwordInput, { target: { value: 'password', name: 'password' } });
    });

    // Verify if the input fields contain the new values
    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password');
  });

  // Test case 3: Handle login success and check if the user is redirected properly
  it('should handle login success', async () => {
    AuthenticationService.login.mockResolvedValue({});  // Simulate successful login response
    renderComponent();

    const loginButton = screen.getByTestId('login');  // Get the login button

    // Simulate clicking the login button and wait for async state changes
    await act(async () => {
      fireEvent.click(loginButton);
    });

    // Ensure the mocked login function was called with correct arguments
    expect(AuthenticationService.login).toHaveBeenCalledWith('', '');  // Empty values for simplicity here

    // Ensure the user is marked as logged in and redirected to the /employees route
    expect(mockContext.setIsUserLoggedIn).toHaveBeenCalledWith(true);
    expect(mockNavigation).toHaveBeenCalledWith('/employees');
  });

  // Test case 4: Handle login failure and check if the proper error message appears
  it('should handle login failure', async () => {
    AuthenticationService.login.mockRejectedValue({});  // Simulate login failure
    renderComponent();

    const loginButton = screen.getByTestId('login');  // Get the login button

    // Simulate clicking the login button and wait for async state changes
    await act(async () => {
      fireEvent.click(loginButton);
    });

    // Ensure the login function was called
    expect(AuthenticationService.login).toHaveBeenCalled();

    // Ensure the user is marked as not logged in and an error message appears
    expect(mockContext.setIsUserLoggedIn).toHaveBeenCalledWith(false);
    expect(screen.getByText('Invalid Credentials')).toBeInTheDocument();  // Error message for invalid credentials
  });

  // Test case 5: Simulate the user clicking the register link and ensure they are redirected
  it('should navigate to register page on clicking register link', () => {
    renderComponent();

    const registerLink = screen.getByText(/No account\? Register here/i);  // Find the register link by its text

    act(() => {
      fireEvent.click(registerLink);  // Simulate a click on the register link
    });

    // Ensure the navigation function was called with the '/register' route
    expect(mockNavigation).toHaveBeenCalledWith('/register');
  });
});
