import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ProjectDetailsComponent from '../components/ProjectDetailsComponent';
import ProjectDataService from '../service/ProjectDataService';

jest.mock('../service/ProjectDataService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn()
}));

const mockProject = {
  id: 1,
  name: 'Project X',
  description: 'Test Project',
  employees: [
    { id: 1, name: 'Employee A' },
    { id: 2, name: 'Employee B' }
  ]
};

describe('ProjectDetailsComponent', () => {
  beforeEach(() => {
    ProjectDataService.retrieveProject.mockResolvedValue({ data: mockProject });
  });

  it('shows loading state initially', () => {
    render(<ProjectDetailsComponent />, { wrapper: BrowserRouter });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays project details after loading', async () => {
    render(<ProjectDetailsComponent />, { wrapper: BrowserRouter });
    
    await waitFor(() => {
      expect(screen.getByText(mockProject.name)).toBeInTheDocument();
      expect(screen.getByText(`Description: ${mockProject.description}`)).toBeInTheDocument();
      expect(screen.getByText(/Employee A, Employee B/)).toBeInTheDocument();
    });
  });

  it('displays default folder icon when imageUrl is not provided', async () => {
    render(<ProjectDetailsComponent />, { wrapper: BrowserRouter });
    
    await waitFor(() => {
      expect(screen.getByTestId('FolderIcon')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    ProjectDataService.retrieveProject.mockRejectedValue(new Error('API Error'));

    render(<ProjectDetailsComponent />, { wrapper: BrowserRouter });
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });
    
    consoleError.mockRestore();
  });
});