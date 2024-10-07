import axios from 'axios';
import ProjectDataService from '../service/ProjectDataService';

jest.mock('axios');

describe('ProjectDataService', () => {

    const mockProject = {
        id: 1,
        name: 'Project A',
        description: 'Description A',
    };

    it('should retrieve all projects', async () => {
        const mockProjectsResponse = { data: [mockProject] };
        axios.get.mockResolvedValueOnce(mockProjectsResponse);

        const response = await ProjectDataService.retrieveAllProjects();
        
        // Check if axios GET was called with the correct URL
        expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/api/projects', { withCredentials: true });
        // Check if the response matches the mock data
        expect(response.data).toEqual(mockProjectsResponse.data);
    });

    it('should delete a project', async () => {
        const projectId = 1;
        axios.delete.mockResolvedValueOnce({});

        await ProjectDataService.deleteProject(projectId);
        
        // Check if axios DELETE was called with the correct URL
        expect(axios.delete).toHaveBeenCalledWith(`http://localhost:8080/api/projects/${projectId}`, { withCredentials: true });
    });

    it('should update a project', async () => {
        const projectId = 1;
        const updatedProject = { ...mockProject, name: 'Updated Project A' };
        axios.put.mockResolvedValueOnce({ data: updatedProject });

        const response = await ProjectDataService.updateProject(projectId, updatedProject);
        
        // Check if axios PUT was called with the correct URL and data
        expect(axios.put).toHaveBeenCalledWith(`http://localhost:8080/api/projects/${projectId}`, updatedProject, { withCredentials: true });
        // Check if the response matches the updated data
        expect(response.data).toEqual(updatedProject);
    });

    it('should create a new project', async () => {
        axios.post.mockResolvedValueOnce({ data: mockProject });

        const response = await ProjectDataService.createProject(mockProject);
        
        // Check if axios POST was called with the correct URL and data
        expect(axios.post).toHaveBeenCalledWith('http://localhost:8080/api/projects', mockProject, { withCredentials: true });
        // Check if the response matches the mock data
        expect(response.data).toEqual(mockProject);
    });

    it('should retrieve a project by id', async () => {
        const projectId = 1;
        axios.get.mockResolvedValueOnce({ data: mockProject });

        const response = await ProjectDataService.retrieveProject(projectId);
        
        // Check if axios GET was called with the correct URL
        expect(axios.get).toHaveBeenCalledWith(`http://localhost:8080/api/projects/${projectId}`, { withCredentials: true });
        // Check if the response matches the mock data
        expect(response.data).toEqual(mockProject);
    });
});
