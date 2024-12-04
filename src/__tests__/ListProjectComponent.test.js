import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ListProjectsComponent from '../components/ListProjectsComponent';
import { BrowserRouter } from 'react-router-dom';
import ProjectDataService from '../service/ProjectDataService';
import AuthenticationService from '../service/AuthenticationService';

jest.mock('../service/ProjectDataService');
jest.mock('../service/AuthenticationService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null, pathname: '/projects' })
}));

const mockProjects = [
  { id: 1, name: 'Project A', description: 'Description A', employees: [{ name: 'John' }] },
  { id: 2, name: 'Project B', description: 'Description B', employees: [{ name: 'Jane' }] }
];

describe('ListProjectsComponent', () => {
  beforeEach(() => {
    ProjectDataService.retrieveAllProjects.mockResolvedValue({ data: mockProjects });
    AuthenticationService.getUserRoles.mockReturnValue(['ADMIN']);
  });

  it('loads and displays projects', async () => {
    render(<ListProjectsComponent />, { wrapper: BrowserRouter });
    
    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.getByText('Project B')).toBeInTheDocument();
    });
  });

  it('filters projects by name', async () => {
    render(<ListProjectsComponent />, { wrapper: BrowserRouter });
    
    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText(/search projects by name/i);
    await userEvent.type(searchInput, 'Project A');

    expect(screen.getByText('Project A')).toBeInTheDocument();
    expect(screen.queryByText('Project B')).not.toBeInTheDocument();
  });

  it('handles project deletion', async () => {
    ProjectDataService.deleteProject.mockResolvedValue({});
    render(<ListProjectsComponent />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
    });

    const deleteButtons = await screen.findAllByText('Delete');
    await userEvent.click(deleteButtons[0]);

    const dialog = screen.getByRole('dialog');
    const confirmButton = within(dialog).getByText('Confirm');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(ProjectDataService.deleteProject).toHaveBeenCalled();
    });
  });

  it('handles bulk deletion', async () => {
    ProjectDataService.deleteProject.mockResolvedValue({});
    render(<ListProjectsComponent />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
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
      expect(ProjectDataService.deleteProject).toHaveBeenCalled();
    });
  });

  it('navigates to add project page', async () => {
    render(<ListProjectsComponent />, { wrapper: BrowserRouter });
    
    const addButton = screen.getByText(/add project/i);
    await userEvent.click(addButton);

    expect(mockNavigate).toHaveBeenCalledWith('/projects/-1');
  });

  it('disables actions for non-admin users', async () => {
    AuthenticationService.getUserRoles.mockReturnValue(['USER']);
    render(<ListProjectsComponent />, { wrapper: BrowserRouter });

    await waitFor(() => {
      const addButton = screen.getByText(/add project/i);
      expect(addButton).toBeDisabled();
      
      const updateButtons = screen.getAllByText('Update');
      expect(updateButtons[0]).toBeDisabled();
      
      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons[0]).toBeDisabled();
    });
  });

  it('shows error snackbar on API failure', async () => {
    ProjectDataService.retrieveAllProjects.mockRejectedValue(new Error('API Error'));
    render(<ListProjectsComponent />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText(/failed to retrieve data/i)).toBeInTheDocument();
    });
  });

  it('handles dialog cancellation', async () => {
    render(<ListProjectsComponent />, { wrapper: BrowserRouter });
  
    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
    });
  
    const deleteButtons = await screen.findAllByText('Delete');
    await userEvent.click(deleteButtons[0]);
  
    await userEvent.click(screen.getByText('Cancel'));
    
    await waitFor(() => {
      expect(screen.queryByText('Are you sure you want to delete')).not.toBeInTheDocument();
    });
  });
  
  it('handles bulk delete dialog cancellation', async () => {
    render(<ListProjectsComponent />, { wrapper: BrowserRouter });
   
    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
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
  
  it('handles project deletion failure', async () => {
    ProjectDataService.deleteProject.mockRejectedValue(new Error('Delete failed'));
    render(<ListProjectsComponent />, { wrapper: BrowserRouter });
  
    const deleteButton = (await screen.findAllByText('Delete'))[0];
    await userEvent.click(deleteButton);
    await userEvent.click(screen.getByText('Confirm'));
  
    await waitFor(() => {
      expect(screen.getByText(/failed to delete project/i)).toBeInTheDocument();
    });
  });
  
  it('handles bulk deletion failure', async () => {
    ProjectDataService.deleteProject.mockRejectedValue(new Error('Delete failed'));
    render(<ListProjectsComponent />, { wrapper: BrowserRouter });
   
    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
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
    render(<ListProjectsComponent />, { wrapper: BrowserRouter });
  
    const searchInput = screen.getByLabelText(/search projects by name/i);
    await userEvent.type(searchInput, 'Project A');
    await userEvent.clear(searchInput);
  
    await waitFor(() => {
      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.getByText('Project B')).toBeInTheDocument();
    });
  });
  
  it('closes snackbar when clicking close', async () => {
    ProjectDataService.retrieveAllProjects.mockRejectedValue(new Error('API Error'));
    render(<ListProjectsComponent />, { wrapper: BrowserRouter });
  
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