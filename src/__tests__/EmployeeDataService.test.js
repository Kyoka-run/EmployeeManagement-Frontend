import axios from 'axios';
import EmployeeDataService from '../service/EmployeeDataService';

jest.mock('axios');

describe('EmployeeDataService', () => {
    const mockEmployee = { id: 1, name: 'John Doe', role: 'Developer' };
    const apiUrl = 'http://localhost:8080/employees';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('retrieveAllEmployees', () => {
        it('should fetch all employees', async () => {
            const mockEmployees = [mockEmployee];
            axios.get.mockResolvedValue({ data: mockEmployees });

            const result = await EmployeeDataService.retrieveAllEmployees();
            expect(axios.get).toHaveBeenCalledWith(apiUrl);
            expect(result.data).toEqual(mockEmployees);
        });

        it('should handle fetch error', async () => {
            axios.get.mockRejectedValue(new Error('Network error'));
            await expect(EmployeeDataService.retrieveAllEmployees()).rejects.toThrow('Network error');
        });
    });

    describe('deleteEmployee', () => {
        it('should delete employee by id', async () => {
            axios.delete.mockResolvedValue({ data: 'Deleted' });

            await EmployeeDataService.deleteEmployee(1);
            expect(axios.delete).toHaveBeenCalledWith(`${apiUrl}/1`);
        });

        it('should handle delete error', async () => {
            axios.delete.mockRejectedValue(new Error('Delete failed'));
            await expect(EmployeeDataService.deleteEmployee(1)).rejects.toThrow('Delete failed');
        });
    });

    describe('updateEmployee', () => {
        it('should update employee', async () => {
            axios.put.mockResolvedValue({ data: mockEmployee });

            const result = await EmployeeDataService.updateEmployee(1, mockEmployee);
            expect(axios.put).toHaveBeenCalledWith(`${apiUrl}/1`, mockEmployee);
            expect(result.data).toEqual(mockEmployee);
        });

        it('should handle update error', async () => {
            axios.put.mockRejectedValue(new Error('Update failed'));
            await expect(EmployeeDataService.updateEmployee(1, mockEmployee)).rejects.toThrow('Update failed');
        });
    });

    describe('createEmployee', () => {
        it('should create new employee', async () => {
            axios.post.mockResolvedValue({ data: mockEmployee });

            const result = await EmployeeDataService.createEmployee(mockEmployee);
            expect(axios.post).toHaveBeenCalledWith(apiUrl, mockEmployee);
            expect(result.data).toEqual(mockEmployee);
        });

        it('should handle creation error', async () => {
            axios.post.mockRejectedValue(new Error('Creation failed'));
            await expect(EmployeeDataService.createEmployee(mockEmployee)).rejects.toThrow('Creation failed');
        });
    });

    describe('retrieveEmployee', () => {
        it('should fetch employee by id', async () => {
            axios.get.mockResolvedValue({ data: mockEmployee });

            const result = await EmployeeDataService.retrieveEmployee(1);
            expect(axios.get).toHaveBeenCalledWith(`${apiUrl}/1`);
            expect(result.data).toEqual(mockEmployee);
        });

        it('should handle fetch error', async () => {
            axios.get.mockRejectedValue(new Error('Fetch failed'));
            await expect(EmployeeDataService.retrieveEmployee(1)).rejects.toThrow('Fetch failed');
        });
    });
});