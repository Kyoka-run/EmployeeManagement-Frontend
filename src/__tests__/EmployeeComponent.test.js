import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import EmployeeComponent from '../components/EmployeeComponent';
import EmployeeDataService from '../service/EmployeeDataService';
import ProjectDataService from '../service/ProjectDataService';

// Mock services
jest.mock('../service/EmployeeDataService');
jest.mock('../service/ProjectDataService');

// Mock router with global params for flexible testing
const mockParams = { id: '1' };
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockParams,
  useNavigate: () => mockNavigate
}));

// Mock data
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
    // Reset mock data and responses before each test
    ProjectDataService.retrieveAllProjects.mockResolvedValue({ data: mockProjects });
    EmployeeDataService.retrieveEmployee.mockResolvedValue({ data: mockEmployee });
    mockParams.id = '1'; // Reset ID to default
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test form rendering
  it('renders employee form with all fields', async () => {
    render(<EmployeeComponent />, { wrapper: TestWrapper });
    
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /position/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /department/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    });
  });

  // Test form validation
  it('displays validation errors for empty fields', async () => {
    render(<EmployeeComponent />, { wrapper: TestWrapper });
    
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
    });

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

  // Test loading existing data
  it('loads existing employee data correctly', async () => {
    render(<EmployeeComponent />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue(mockEmployee.name);
      expect(screen.getByRole('textbox', { name: /position/i })).toHaveValue(mockEmployee.position);
      expect(screen.getByRole('textbox', { name: /department/i })).toHaveValue(mockEmployee.department);
      expect(screen.getByRole('textbox', { name: /email/i })).toHaveValue(mockEmployee.email);
    });
  });

  // Test updating employee
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

  // Test error handling
  it('handles API errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    EmployeeDataService.retrieveEmployee.mockRejectedValue(new Error('API Error'));

    render(<EmployeeComponent />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  // Test creating new employee
  it('creates new employee successfully', async () => {
    mockParams.id = '-1';
    EmployeeDataService.createEmployee.mockResolvedValue({});
    
    render(<EmployeeComponent />, { wrapper: TestWrapper });
  
    await userEvent.type(screen.getByRole('textbox', { name: /name/i }), 'New Employee');
    await userEvent.type(screen.getByRole('textbox', { name: /position/i }), 'Developer');
    await userEvent.type(screen.getByRole('textbox', { name: /department/i }), 'IT');
    await userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'new@test.com');
  
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
  
    await waitFor(() => {
      expect(EmployeeDataService.createEmployee).toHaveBeenCalled();
    });
  });

  it('fetches projects from ProjectDataService', async () => {
    render(<EmployeeComponent />, { wrapper: TestWrapper });
    
    await waitFor(() => {
      expect(ProjectDataService.retrieveAllProjects).toHaveBeenCalledTimes(1);
    });
  });

  // Test project related API error
  it('handles project API error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    ProjectDataService.retrieveAllProjects.mockRejectedValue(new Error('API Error'));
    
    render(<EmployeeComponent />, { wrapper: TestWrapper });
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('error retrieving the projects'),
        expect.any(Error)
      );
    });
    
    consoleError.mockRestore();
  });
});
