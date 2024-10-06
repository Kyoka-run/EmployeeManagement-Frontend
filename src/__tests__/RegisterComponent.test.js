import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import RegisterComponent from '../components/RegisterComponent';
import '@testing-library/jest-dom';

// Mock axios to avoid actual HTTP requests during tests
jest.mock('axios');

describe('RegisterComponent', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the form correctly', () => {
    render(<RegisterComponent />);

    // Check if the form elements are rendered
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirm/i)).toBeInTheDocument();
  });

  it('shows error if username is empty', async () => {
    render(<RegisterComponent />);

    // Fill in the password field
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });
    
    // Try to submit without filling username
    fireEvent.click(screen.getByText(/Confirm/i));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Username cannot be empty/i)).toBeInTheDocument();
    });
  });

  it('shows error if password is empty', async () => {
    render(<RegisterComponent />);

    // Fill in the username field
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'user1' },
    });

    // Try to submit without filling password
    fireEvent.click(screen.getByText(/Confirm/i));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Password cannot be empty/i)).toBeInTheDocument();
    });
  });

  it('shows error if no role is selected', async () => {
    render(<RegisterComponent />);

    // Fill in the username and password fields
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'user1' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });

    // Try to submit without selecting a role
    fireEvent.click(screen.getByText(/Confirm/i));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Please select at least one role/i)).toBeInTheDocument();
    });
  });

  it('shows success message on successful registration', async () => {
    axios.post.mockResolvedValueOnce({ data: {} });

    render(<RegisterComponent />);

    // Fill in the form with valid data
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'user1' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });
    fireEvent.mouseDown(screen.getByLabelText(/Role/i));
    fireEvent.click(screen.getByText(/Admin/i)); // Select the 'Admin' role

    // Click the Confirm button
    fireEvent.click(screen.getByText(/Confirm/i));

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Account created successfully/i)).toBeInTheDocument();
    });
  });

  it('shows error message on failed registration', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to register'));

    render(<RegisterComponent />);

    // Fill in the form with valid data
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'user1' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });
    fireEvent.mouseDown(screen.getByLabelText(/Role/i));
    fireEvent.click(screen.getByText(/Admin/i)); // Select the 'Admin' role

    // Click the Confirm button
    fireEvent.click(screen.getByText(/Confirm/i));

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to register/i)).toBeInTheDocument();
    });
  });
});
