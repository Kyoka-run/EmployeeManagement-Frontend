import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import EmployeeDetailsComponent from '../components/EmployeeDetailsComponent';
import EmployeeDataService from '../service/EmployeeDataService';

jest.mock('../service/EmployeeDataService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn()
}));

const mockEmployee = {
  id: 1,
  name: 'John Doe',
  position: 'Developer',
  email: 'john@example.com',
  projects: [
    { id: 1, name: 'Project A' },
    { id: 2, name: 'Project B' }
  ]
};

describe('EmployeeDetailsComponent', () => {
  beforeEach(() => {
    EmployeeDataService.retrieveEmployee.mockResolvedValue({ data: mockEmployee });
  });

  it('shows loading state initially', () => {
    render(<EmployeeDetailsComponent />, { wrapper: BrowserRouter });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays employee details after loading', async () => {
    render(<EmployeeDetailsComponent />, { wrapper: BrowserRouter });
    
    await waitFor(() => {
      expect(screen.getByText(mockEmployee.name)).toBeInTheDocument();
      expect(screen.getByText(`Position: ${mockEmployee.position}`)).toBeInTheDocument();
      expect(screen.getByText(`Email: ${mockEmployee.email}`)).toBeInTheDocument();
      expect(screen.getByText(/Project A, Project B/)).toBeInTheDocument();
    });
  });

  it('displays default avatar when avatarUrl is not provided', async () => {
    render(<EmployeeDetailsComponent />, { wrapper: BrowserRouter });
    
    await waitFor(() => {
      expect(screen.getByTestId('PersonIcon')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    EmployeeDataService.retrieveEmployee.mockRejectedValue(new Error('API Error'));

    render(<EmployeeDetailsComponent />, { wrapper: BrowserRouter });
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });
    
    consoleError.mockRestore();
  });
});