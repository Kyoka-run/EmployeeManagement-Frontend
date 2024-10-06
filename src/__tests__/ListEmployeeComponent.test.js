import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ListEmployeesComponent from '../components/ListEmployeesComponent';
import EmployeeDataService from '../service/EmployeeDataService';
import AuthenticationService from '../service/AuthenticationService';
import { BrowserRouter, useNavigate } from 'react-router-dom';

// Mock the external services
jest.mock('../service/EmployeeDataService');
jest.mock('../service/AuthenticationService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('ListEmployeesComponent', () => {
  const employees = [
    {
      id: 1,
      name: 'John Doe',
      position: 'Developer',
      department: 'Engineering',
      email: 'john.doe@example.com',
      projects: [{ name: 'Project A' }, { name: 'Project B' }],
    },
    {
      id: 2,
      name: 'Jane Smith',
      position: 'Designer',
      department: 'Design',
      email: 'jane.smith@example.com',
      projects: [{ name: 'Project C' }],
    },
  ];

  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Mock the retrieveAllEmployees method to return employees
    EmployeeDataService.retrieveAllEmployees.mockResolvedValue({ data: employees });

    // Mock the getUserRoles method
    AuthenticationService.getUserRoles.mockReturnValue(['ADMIN']);

    // Mock useNavigate
    useNavigate.mockReturnValue(mockNavigate);
  });

  test('should render the component and display employees', async () => {
    render(
      <BrowserRouter>
        <ListEmployeesComponent />
      </BrowserRouter>
    );

    // Expect the search field to be rendered
    expect(screen.getByLabelText('Search Employees By Name')).toBeInTheDocument();

    // Wait for the employees to load and display in the DataGrid
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('should filter employees by name when using the search input', async () => {
    render(
      <BrowserRouter>
        <ListEmployeesComponent />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Search Employees By Name'), {
      target: { value: 'John' },
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  test('should handle adding a new employee', () => {
    render(
      <BrowserRouter>
        <ListEmployeesComponent />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Add Employee'));

    // Verify navigation to add employee page
    expect(mockNavigate).toHaveBeenCalledWith('/employees/-1');
  });

  test('should handle deleting an employee', async () => {
    // Mock the deleteEmployee method to simulate successful deletion
    EmployeeDataService.deleteEmployee.mockResolvedValue({});

    // Render the ListEmployeesComponent within a BrowserRouter
    render(
      <BrowserRouter>
        <ListEmployeesComponent />
      </BrowserRouter>
    );

    // Wait for the employees to load into the DataGrid and ensure "John Doe" and "Jane Smith" are present
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Click the delete button for John Doe
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Confirm the deletion in the dialog
    fireEvent.click(screen.getByText('Confirm'));

    // Mock the employee list after John Doe has been deleted (simulate data re-fetching)
    EmployeeDataService.retrieveAllEmployees.mockResolvedValue({
      data: employees.filter(emp => emp.id !== 1), // Remove John Doe from the mocked list
    });

    // Wait for the retrieveAllEmployees to be called after deletion
    await waitFor(() => {
      expect(EmployeeDataService.retrieveAllEmployees).toHaveBeenCalled();
    });

    // Ensure that John Doe has been removed from the DOM
    await waitFor(async () => {
      const johnDoeRow = await screen.queryByText('John Doe');
      console.log('John Doe should be deleted:', johnDoeRow); // Debug output
      expect(johnDoeRow).toBeNull(); // Verify John Doe is no longer in the DOM
    });
});

  test('should handle updating an employee', async () => {
    render(
      <BrowserRouter>
        <ListEmployeesComponent />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const updateButtons = screen.getAllByText('Update');
    fireEvent.click(updateButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/employees/1');
  });

  test('should handle bulk deleting employees', async () => {
    EmployeeDataService.deleteEmployee.mockResolvedValue({});

    render(
      <BrowserRouter>
        <ListEmployeesComponent />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole('checkbox')[1]); // Select John Doe
    fireEvent.click(screen.getAllByRole('checkbox')[2]); // Select Jane Smith

    fireEvent.click(screen.getByText('Bulk Delete'));

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(EmployeeDataService.deleteEmployee).toHaveBeenCalledWith(1);
      expect(EmployeeDataService.deleteEmployee).toHaveBeenCalledWith(2);
    });

    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });
});
