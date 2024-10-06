import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ListProjectsComponent from '../components/ListProjectsComponent';
import ProjectDataService from '../service/ProjectDataService';
import AuthenticationService from '../service/AuthenticationService';
import { BrowserRouter, useNavigate } from 'react-router-dom';

// Mock the external services
jest.mock('../service/ProjectDataService');
jest.mock('../service/AuthenticationService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('ListProjectsComponent', () => {
  // Mocked project data
  const projects = [
    {
      id: 1,
      name: 'Project A',
      description: 'Description of Project A',
      employees: [{ name: 'John Doe' }, { name: 'Jane Smith' }],
    },
    {
      id: 2,
      name: 'Project B',
      description: 'Description of Project B',
      employees: [{ name: 'Alice Brown' }],
    },
  ];

  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Mock the retrieveAllProjects method to return projects
    ProjectDataService.retrieveAllProjects.mockResolvedValue({ data: projects });

    // Mock the getUserRoles method
    AuthenticationService.getUserRoles.mockReturnValue(['ADMIN']);

    // Mock useNavigate
    useNavigate.mockReturnValue(mockNavigate);
  });

  test('should render the component and display projects', async () => {
    render(
      <BrowserRouter>
        <ListProjectsComponent />
      </BrowserRouter>
    );

    // Expect the search field to be rendered
    expect(screen.getByLabelText('Search Projects By Name')).toBeInTheDocument();

    // Wait for the projects to load and display in the DataGrid
    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.getByText('Project B')).toBeInTheDocument();
    });
  });

  test('should filter projects by name when using the search input', async () => {
    render(
      <BrowserRouter>
        <ListProjectsComponent />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.getByText('Project B')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Search Projects By Name'), {
      target: { value: 'Project A' },
    });

    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.queryByText('Project B')).not.toBeInTheDocument();
    });
  });

  test('should handle adding a new project', () => {
    render(
      <BrowserRouter>
        <ListProjectsComponent />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Add Project'));

    // Verify navigation to add project page
    expect(mockNavigate).toHaveBeenCalledWith('/projects/-1');
  });

  test('should handle deleting a project', async () => {
    // Mock the deleteProject method to simulate successful deletion
    ProjectDataService.deleteProject.mockResolvedValue({});

    render(
      <BrowserRouter>
        <ListProjectsComponent />
      </BrowserRouter>
    );

    // Wait for the projects to load into the DataGrid and ensure "Project A" and "Project B" are present
    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.getByText('Project B')).toBeInTheDocument();
    });

    // Click the delete button for Project A
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Confirm the deletion in the dialog
    fireEvent.click(screen.getByText('Confirm'));

    // Mock the project list after Project A has been deleted (simulate data re-fetching)
    ProjectDataService.retrieveAllProjects.mockResolvedValue({
      data: projects.filter(proj => proj.id !== 1), // Remove Project A from the mocked list
    });

    // Wait for the retrieveAllProjects to be called after deletion
    await waitFor(() => {
      expect(ProjectDataService.retrieveAllProjects).toHaveBeenCalled();
    });

    // Ensure that Project A has been removed from the DOM
    await waitFor(async () => {
      const projectARow = await screen.queryByText('Project A');
      expect(projectARow).toBeNull(); // Verify Project A is no longer in the DOM
    });
  });

  test('should handle updating a project', async () => {
    render(
      <BrowserRouter>
        <ListProjectsComponent />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
    });

    const updateButtons = screen.getAllByText('Update');
    fireEvent.click(updateButtons[0]);

    // Verify navigation to update project page
    expect(mockNavigate).toHaveBeenCalledWith('/projects/1');
  });

  test('should handle bulk deleting projects', async () => {
    ProjectDataService.deleteProject.mockResolvedValue({});

    render(
      <BrowserRouter>
        <ListProjectsComponent />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.getByText('Project B')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole('checkbox')[1]); // Select Project A
    fireEvent.click(screen.getAllByRole('checkbox')[2]); // Select Project B

    fireEvent.click(screen.getByText('Bulk Delete'));

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(ProjectDataService.deleteProject).toHaveBeenCalledWith(1);
      expect(ProjectDataService.deleteProject).toHaveBeenCalledWith(2);
    });

    await waitFor(() => {
      expect(screen.queryByText('Project A')).not.toBeInTheDocument();
      expect(screen.queryByText('Project B')).not.toBeInTheDocument();
    });
  });
});
