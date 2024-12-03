import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import EmployeeComponent from '../components/EmployeeComponent';
import EmployeeDataService from '../service/EmployeeDataService';
import ProjectDataService from '../service/ProjectDataService';

jest.mock('../service/EmployeeDataService');
jest.mock('../service/ProjectDataService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn()
}));

const mockEmployee = {
  id: 1,
  name: 'John Doe',
  position: 'Developer',
  department: 'IT',
  email: 'john@example.com',
  projects: []
};

const mockProjects = [
  { id: 1, name: 'Project A', description: 'Description A' },
  { id: 2, name: 'Project B', description: 'Description B' }
];

const TestWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('EmployeeComponent', () => {
  beforeEach(() => {
    ProjectDataService.retrieveAllProjects.mockResolvedValue({ data: mockProjects });
    EmployeeDataService.retrieveEmployee.mockResolvedValue({ data: mockEmployee });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders employee form with all fields', async () => {
    render(<EmployeeComponent />, { wrapper: TestWrapper });
    
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /position/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /department/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    });
  });

  it('displays validation errors for empty fields', async () => {
    render(<EmployeeComponent />, { wrapper: TestWrapper });
    
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
    });

    // Clear all fields
    const inputs = screen.getAllByRole('textbox');
    for (let input of inputs) {
      await userEvent.clear(input);
    }

    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Position is required')).toBeInTheDocument();
      expect(screen.getByText('Department is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('loads existing employee data correctly', async () => {
    render(<EmployeeComponent />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue(mockEmployee.name);
      expect(screen.getByRole('textbox', { name: /position/i })).toHaveValue(mockEmployee.position);
      expect(screen.getByRole('textbox', { name: /department/i })).toHaveValue(mockEmployee.department);
      expect(screen.getByRole('textbox', { name: /email/i })).toHaveValue(mockEmployee.email);
    });
  });

  it('displays project select with available options', async () => {
    render(<EmployeeComponent />, { wrapper: TestWrapper });
  
    const select = await screen.findByTestId('projects-select');
    expect(select).toBeInTheDocument();
    
    await waitFor(() => {
      expect(ProjectDataService.retrieveAllProjects).toHaveBeenCalled();
    });
  });

  it('submits form successfully for existing employee', async () => {
    EmployeeDataService.updateEmployee.mockResolvedValue({});
    
    render(<EmployeeComponent />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue(mockEmployee.name);
    });

    const nameInput = screen.getByRole('textbox', { name: /name/i });
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Name');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(EmployeeDataService.updateEmployee).toHaveBeenCalled();
    });
  });

  it('handles API errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    EmployeeDataService.retrieveEmployee.mockRejectedValue(new Error('API Error'));

    render(<EmployeeComponent />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });
});