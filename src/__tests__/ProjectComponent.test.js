import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ProjectComponent from '../components/ProjectComponent';
import ProjectDataService from '../service/ProjectDataService';
import EmployeeDataService from '../service/EmployeeDataService';

jest.mock('../service/ProjectDataService');
jest.mock('../service/EmployeeDataService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn()
}));

const mockProject = {
  id: 1,
  name: 'Test Project',
  description: 'Test Description',
  employees: []
};

const mockEmployees = [
  { id: 1, name: 'Employee A', position: 'Dev', department: 'IT', email: 'a@test.com' },
  { id: 2, name: 'Employee B', position: 'QA', department: 'IT', email: 'b@test.com' }
];

const TestWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('ProjectComponent', () => {
  beforeEach(() => {
    ProjectDataService.retrieveProject.mockResolvedValue({ data: mockProject });
    EmployeeDataService.retrieveAllEmployees.mockResolvedValue({ data: mockEmployees });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders project form with all fields', async () => {
    render(<ProjectComponent />, { wrapper: TestWrapper });
    
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
    });
  });

  it('displays validation errors for empty fields', async () => {
    render(<ProjectComponent />, { wrapper: TestWrapper });
    
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
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });
  });

  it('loads existing project data correctly', async () => {
    render(<ProjectComponent />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue(mockProject.name);
      expect(screen.getByRole('textbox', { name: /description/i })).toHaveValue(mockProject.description);
    });
  });

  it('displays employee select with available options', async () => {
    render(<ProjectComponent />, { wrapper: TestWrapper });
  
    const select = await screen.findByTestId('employees-select');
    expect(select).toBeInTheDocument();
    
    await waitFor(() => {
      expect(EmployeeDataService.retrieveAllEmployees).toHaveBeenCalled();
    });
  });

  it('submits form successfully for existing project', async () => {
    ProjectDataService.updateProject.mockResolvedValue({});
    
    render(<ProjectComponent />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue(mockProject.name);
    });

    const nameInput = screen.getByRole('textbox', { name: /name/i });
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Project');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(ProjectDataService.updateProject).toHaveBeenCalled();
    });
  });

  it('handles API errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    ProjectDataService.retrieveProject.mockRejectedValue(new Error('API Error'));

    render(<ProjectComponent />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });
});