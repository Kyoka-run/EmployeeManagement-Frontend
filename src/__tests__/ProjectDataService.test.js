import ProjectDataService from '../service/ProjectDataService';
import axios from 'axios';

jest.mock('axios');

describe('ProjectDataService', () => {
    const mockProject = { id: 1, name: 'Project Alpha', status: 'Active' };
    const apiUrl = 'http://localhost:8080/projects';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('retrieveAllProjects', () => {
        it('should fetch all projects', async () => {
            const mockProjects = [mockProject];
            axios.get.mockResolvedValue({ data: mockProjects });

            const result = await ProjectDataService.retrieveAllProjects();
            expect(axios.get).toHaveBeenCalledWith(apiUrl);
            expect(result.data).toEqual(mockProjects);
        });

        it('should handle fetch error', async () => {
            axios.get.mockRejectedValue(new Error('Network error'));
            await expect(ProjectDataService.retrieveAllProjects()).rejects.toThrow('Network error');
        });
    });

    describe('deleteProject', () => {
        it('should delete project by id', async () => {
            axios.delete.mockResolvedValue({ data: 'Deleted' });

            await ProjectDataService.deleteProject(1);
            expect(axios.delete).toHaveBeenCalledWith(`${apiUrl}/1`);
        });

        it('should handle delete error', async () => {
            axios.delete.mockRejectedValue(new Error('Delete failed'));
            await expect(ProjectDataService.deleteProject(1)).rejects.toThrow('Delete failed');
        });
    });

    describe('updateProject', () => {
        it('should update project', async () => {
            axios.put.mockResolvedValue({ data: mockProject });

            const result = await ProjectDataService.updateProject(1, mockProject);
            expect(axios.put).toHaveBeenCalledWith(`${apiUrl}/1`, mockProject);
            expect(result.data).toEqual(mockProject);
        });

        it('should handle update error', async () => {
            axios.put.mockRejectedValue(new Error('Update failed'));
            await expect(ProjectDataService.updateProject(1, mockProject)).rejects.toThrow('Update failed');
        });
    });

    describe('createProject', () => {
        it('should create new project', async () => {
            axios.post.mockResolvedValue({ data: mockProject });

            const result = await ProjectDataService.createProject(mockProject);
            expect(axios.post).toHaveBeenCalledWith(apiUrl, mockProject);
            expect(result.data).toEqual(mockProject);
        });

        it('should handle creation error', async () => {
            axios.post.mockRejectedValue(new Error('Creation failed'));
            await expect(ProjectDataService.createProject(mockProject)).rejects.toThrow('Creation failed');
        });
    });

    describe('retrieveProject', () => {
        it('should fetch project by id', async () => {
            axios.get.mockResolvedValue({ data: mockProject });

            const result = await ProjectDataService.retrieveProject(1);
            expect(axios.get).toHaveBeenCalledWith(`${apiUrl}/1`);
            expect(result.data).toEqual(mockProject);
        });

        it('should handle fetch error', async () => {
            axios.get.mockRejectedValue(new Error('Fetch failed'));
            await expect(ProjectDataService.retrieveProject(1)).rejects.toThrow('Fetch failed');
        });
    });
});