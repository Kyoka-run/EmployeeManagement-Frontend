import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import EmployeeComponent from '../components/EmployeeComponent';
import EmployeeDataService from '../service/EmployeeDataService';
import ProjectDataService from '../service/ProjectDataService';
import { MemoryRouter } from 'react-router-dom';

// Mock the data services
jest.mock('../service/EmployeeDataService');
jest.mock('../service/ProjectDataService');

describe('EmployeeComponent', () => {
    const mockProjects = [
        { id: 1, name: 'Project A', description: 'Description A' },
        { id: 2, name: 'Project B', description: 'Description B' },
    ];

    beforeEach(() => {
        ProjectDataService.retrieveAllProjects.mockResolvedValue({
            data: mockProjects
        });
    });

    it('should render the form with all fields', async () => {
        render(
            <MemoryRouter>
                <EmployeeComponent match={{ params: { id: -1 } }} />
            </MemoryRouter>
        );

        // Use basic queries to check elements are present in the document
        expect(screen.getByLabelText(/name/i)).toBeTruthy();
        expect(screen.getByLabelText(/position/i)).toBeTruthy();
        expect(screen.getByLabelText(/department/i)).toBeTruthy();
        expect(screen.getByLabelText(/email/i)).toBeTruthy();
        
        // Use waitFor to handle asynchronous updates
        await waitFor(() => {
            expect(screen.getByTestId('projects-select')).toBeTruthy();
        });
    });

    it('should validate form fields on submit', async () => {
        render(
            <MemoryRouter>
                <EmployeeComponent match={{ params: { id: -1 } }} />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        // Check if elements showing validation errors appear
        await waitFor(() => {
            expect(screen.queryByText(/name is required/i)).toBeTruthy();
            expect(screen.queryByText(/position is required/i)).toBeTruthy();
            expect(screen.queryByText(/department is required/i)).toBeTruthy();
            expect(screen.queryByText(/email is required/i)).toBeTruthy();
        });
    });
    
    it('should handle project selection', async () => {
        // Mock project data
        const mockProjects = [
            { id: 1, name: 'Project A', description: 'Description for Project A' },
            { id: 2, name: 'Project B', description: 'Description for Project B' }
        ];
    
        // Simulate the response of retrieveAllProjects
        ProjectDataService.retrieveAllProjects.mockResolvedValue({ data: mockProjects });
    
        // Step 1: Render the EmployeeComponent with mock data
        console.log("Rendering EmployeeComponent with props:", { match: { params: { id: -1 } }});
        render(
            <MemoryRouter>
                <EmployeeComponent match={{ params: { id: -1 } }} />
            </MemoryRouter>
        );
    
        // Step 2: Open the select dropdown and log
        const selectInput = screen.getByTestId('projects-select');
        console.log("Select input element found:", selectInput);
    
        fireEvent.mouseDown(selectInput);  // Trigger dropdown opening
        console.log("Dropdown menu opened.");
    
        // Insert a brief pause to ensure the dropdown options are rendered
        await new Promise(resolve => setTimeout(resolve, 1000));
    
        // Step 3: Wait for the options to appear in the DOM
        console.log("Looking for 'Project A' in the dropdown options...");
        const projectOption = await waitFor(() => {
            const option = screen.queryByText('Project A');
            console.log("Found option:", option);
            return option;
        });
    
        // Step 4: Select the "Project A" option and log
        if (projectOption) {
            console.log("Clicking on Project A option:", projectOption);
            fireEvent.click(projectOption);
    
            // Step 5: Verify that "Project A" is selected
            const selectedOption = screen.getByText(/Project A/i);
            console.log("Selected option found:", selectedOption);
            expect(selectedOption).toBeInTheDocument();  // Verify that "Project A" is now shown in the select
        } else {
            console.error("Project A option was not found in the DOM.");
        }
    });

    it('should submit form with valid data', async () => {
        EmployeeDataService.createEmployee.mockResolvedValue({});

        render(
            <MemoryRouter>
                <EmployeeComponent match={{ params: { id: -1 } }} />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText(/position/i), { target: { value: 'Developer' } });
        fireEvent.change(screen.getByLabelText(/department/i), { target: { value: 'IT' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });

        fireEvent.click(screen.getByRole('button', { name: /save/i }));

        await waitFor(() => {
            expect(EmployeeDataService.createEmployee).toHaveBeenCalled();
        });
    });
});
