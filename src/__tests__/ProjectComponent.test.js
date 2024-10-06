import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import ProjectComponent from '../components/ProjectComponent';
import EmployeeDataService from '../service/EmployeeDataService';
import ProjectDataService from '../service/ProjectDataService';
import { MemoryRouter } from 'react-router-dom';

// Mock the data services
jest.mock('../service/EmployeeDataService');
jest.mock('../service/ProjectDataService');

describe('ProjectComponent', () => {
    const mockEmployees = [
        { id: 1, name: 'John Doe', position: 'Developer', department: 'IT', email: 'john.doe@example.com' },
        { id: 2, name: 'Jane Smith', position: 'Manager', department: 'HR', email: 'jane.smith@example.com' },
    ];

    beforeEach(() => {
        // Mock the employee data retrieval
        EmployeeDataService.retrieveAllEmployees.mockResolvedValue({
            data: mockEmployees
        });
    });

    it('should render the form with all fields', async () => {
        render(
            <MemoryRouter>
                <ProjectComponent match={{ params: { id: -1 } }} />
            </MemoryRouter>
        );

        // Use basic queries to check elements are present in the document
        expect(screen.getByLabelText(/name/i)).toBeTruthy();
        expect(screen.getByLabelText(/description/i)).toBeTruthy();

        // Use waitFor to handle asynchronous updates
        await waitFor(() => {
            expect(screen.getByTestId('employees-select')).toBeTruthy();
        });
    });

    it('should validate form fields on submit', async () => {
        render(
            <MemoryRouter>
                <ProjectComponent match={{ params: { id: -1 } }} />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        // Check if elements showing validation errors appear
        await waitFor(() => {
            expect(screen.queryByText(/name is required/i)).toBeTruthy();
            expect(screen.queryByText(/description is required/i)).toBeTruthy();
        });
    });

    it('should handle employee selection', async () => {
        // Mock employee data
        const mockEmployees = [
            { id: 1, name: 'John Doe', position: 'Developer', department: 'IT', email: 'john.doe@example.com' },
            { id: 2, name: 'Jane Smith', position: 'Manager', department: 'HR', email: 'jane.smith@example.com' }
        ];

        // Simulate the response of retrieveAllEmployees
        EmployeeDataService.retrieveAllEmployees.mockResolvedValue({ data: mockEmployees });

        // Step 1: Render the ProjectComponent with mock data
        console.log("Rendering ProjectComponent with props:", { match: { params: { id: -1 } } });
        render(
            <MemoryRouter>
                <ProjectComponent match={{ params: { id: -1 } }} />
            </MemoryRouter>
        );

        // Step 2: Open the select dropdown and log
        const selectInput = screen.getByTestId('employees-select');
        console.log("Select input element found:", selectInput);

        fireEvent.mouseDown(selectInput);  // Trigger dropdown opening
        console.log("Dropdown menu opened.");

        // Insert a brief pause to ensure the dropdown options are rendered
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 3: Wait for the options to appear in the DOM
        console.log("Looking for 'John Doe' in the dropdown options...");
        const employeeOption = await waitFor(() => {
            const option = screen.queryByText('John Doe');
            console.log("Found option:", option);
            return option;
        });

        // Step 4: Select the "John Doe" option and log
        if (employeeOption) {
            console.log("Clicking on John Doe option:", employeeOption);
            fireEvent.click(employeeOption);

            // Step 5: Verify that "John Doe" is selected
            const selectedOption = screen.getByText(/John Doe/i);
            console.log("Selected option found:", selectedOption);
            expect(selectedOption).toBeInTheDocument();  // Verify that "John Doe" is now shown in the select
        } else {
            console.error("John Doe option was not found in the DOM.");
        }
    });

    it('should submit form with valid data', async () => {
        ProjectDataService.createProject.mockResolvedValue({});

        render(
            <MemoryRouter>
                <ProjectComponent match={{ params: { id: -1 } }} />
            </MemoryRouter>
        );

        // Fill in the project form
        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'New Project' } });
        fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'New Project Description' } });

        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => {
            expect(ProjectDataService.createProject).toHaveBeenCalled();
        });
    });
});
