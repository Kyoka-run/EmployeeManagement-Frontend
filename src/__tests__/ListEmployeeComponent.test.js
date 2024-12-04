import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ListEmployeesComponent from '../components/ListEmployeesComponent';
import { BrowserRouter } from 'react-router-dom';
import EmployeeDataService from '../service/EmployeeDataService';
import AuthenticationService from '../service/AuthenticationService';

jest.mock('../service/EmployeeDataService');
jest.mock('../service/AuthenticationService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null, pathname: '/employees' })
}));

const mockEmployees = [
  { id: 1, name: 'John Doe', position: 'Developer', department: 'IT', email: 'john@test.com', projects: [{ name: 'Project A' }] },
  { id: 2, name: 'Jane Doe', position: 'Manager', department: 'HR', email: 'jane@test.com', projects: [{ name: 'Project B' }] }
];

describe('ListEmployeesComponent', () => {
  beforeEach(() => {
    EmployeeDataService.retrieveAllEmployees.mockResolvedValue({ data: mockEmployees });
    AuthenticationService.getUserRoles.mockReturnValue(['ADMIN']);
  });

  it('loads and displays employees', async () => {
    render(<ListEmployeesComponent />, { wrapper: BrowserRouter });
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });

  it('filters employees by name', async () => {
    render(<ListEmployeesComponent />, { wrapper: BrowserRouter });
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText(/search employees by name/i);
    await userEvent.type(searchInput, 'John');

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
  });

  it('handles employee deletion', async () => {
    EmployeeDataService.deleteEmployee.mockResolvedValue({});
    render(<ListEmployeesComponent />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const deleteButtons = await screen.findAllByText('Delete');
    await userEvent.click(deleteButtons[0]);

    const dialog = screen.getByRole('dialog');
    const confirmButton = within(dialog).getByText('Confirm');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(EmployeeDataService.deleteEmployee).toHaveBeenCalled();
    });
  });

  it('handles bulk deletion', async () => {
    EmployeeDataService.deleteEmployee.mockResolvedValue({});
    render(<ListEmployeesComponent />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const checkbox = screen.getAllByRole('checkbox')[1];
    await userEvent.click(checkbox);

    await waitFor(() => {
      const bulkDeleteButton = screen.getByText(/bulk delete/i);
      expect(bulkDeleteButton).not.toBeDisabled();
    });

    await userEvent.click(screen.getByText(/bulk delete/i));
    await userEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(EmployeeDataService.deleteEmployee).toHaveBeenCalled();
    });
  });

  it('navigates to add employee page', async () => {
    render(<ListEmployeesComponent />, { wrapper: BrowserRouter });
    
    const addButton = screen.getByText(/add employee/i);
    await userEvent.click(addButton);

    expect(mockNavigate).toHaveBeenCalledWith('/employees/-1');
  });

  it('disables actions for non-admin users', async () => {
    AuthenticationService.getUserRoles.mockReturnValue(['USER']);
    render(<ListEmployeesComponent />, { wrapper: BrowserRouter });

    await waitFor(() => {
      const addButton = screen.getByText(/add employee/i);
      expect(addButton).toBeDisabled();
      
      const updateButtons = screen.getAllByText('Update');
      expect(updateButtons[0]).toBeDisabled();
      
      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons[0]).toBeDisabled();
    });
  });

  it('shows error snackbar on API failure', async () => {
    EmployeeDataService.retrieveAllEmployees.mockRejectedValue(new Error('API Error'));
    render(<ListEmployeesComponent />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText(/failed to retrieve data/i)).toBeInTheDocument();
    });
  });

  it('handles dialog cancellation', async () => {
    render(<ListEmployeesComponent />, { wrapper: BrowserRouter });
  
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  
    const deleteButtons = await screen.findAllByText('Delete');
    await userEvent.click(deleteButtons[0]);
  
    await userEvent.click(screen.getByText('Cancel'));
    
    await waitFor(() => {
      expect(screen.queryByText('Are you sure you want to delete')).not.toBeInTheDocument();
    });
  });
  
  it('handles bulk delete dialog cancellation', async () => {
    render(<ListEmployeesComponent />, { wrapper: BrowserRouter });
   
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
   
    const checkbox = screen.getAllByRole('checkbox')[1];
    await userEvent.click(checkbox);
   
    await userEvent.click(screen.getByText('Bulk Delete'));
    
    await waitFor(() => {
      expect(screen.getByText('Confirm Bulk Delete')).toBeInTheDocument();
    });
   
    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);
   
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
  
  it('handles employee deletion failure', async () => {
    EmployeeDataService.deleteEmployee.mockRejectedValue(new Error('Delete failed'));
    render(<ListEmployeesComponent />, { wrapper: BrowserRouter });
  
    const deleteButton = (await screen.findAllByText('Delete'))[0];
    await userEvent.click(deleteButton);
    await userEvent.click(screen.getByText('Confirm'));
  
    await waitFor(() => {
      expect(screen.getByText(/failed to delete employee/i)).toBeInTheDocument();
    });
  });
  
  it('handles bulk deletion failure', async () => {
    EmployeeDataService.deleteEmployee.mockRejectedValue(new Error('Delete failed'));
    render(<ListEmployeesComponent />, { wrapper: BrowserRouter });
   
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
   
    const checkbox = screen.getAllByRole('checkbox')[1];
    await userEvent.click(checkbox);
   
    await waitFor(() => {
      expect(screen.getByText('Bulk Delete')).not.toBeDisabled();
    });
    
    await userEvent.click(screen.getByText('Bulk Delete'));
    await userEvent.click(screen.getByText('Confirm'));
   
    await waitFor(() => {
      expect(screen.getByText(/failed to delete selected/i)).toBeInTheDocument();
    });
  });
  
  it('handles search text clearing', async () => {
    render(<ListEmployeesComponent />, { wrapper: BrowserRouter });
  
    const searchInput = screen.getByLabelText(/search employees by name/i);
    await userEvent.type(searchInput, 'John');
    await userEvent.clear(searchInput);
  
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
  
  it('closes snackbar when clicking close', async () => {
    EmployeeDataService.retrieveAllEmployees.mockRejectedValue(new Error('API Error'));
    render(<ListEmployeesComponent />, { wrapper: BrowserRouter });
  
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  
    await userEvent.click(screen.getByLabelText('Close'));
  
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});