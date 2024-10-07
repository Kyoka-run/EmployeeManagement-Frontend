import axios from 'axios';
import EmployeeDataService from '../service/EmployeeDataService';

jest.mock('axios');

describe('EmployeeDataService', () => {

    const mockEmployee = {
        id: 1,
        name: 'John Doe',
        position: 'Developer',
        department: 'Engineering',
        email: 'john.doe@example.com',
    };

    it('should retrieve all employees', async () => {
        const mockEmployeesResponse = { data: [mockEmployee] };
        axios.get.mockResolvedValueOnce(mockEmployeesResponse);

        const response = await EmployeeDataService.retrieveAllEmployees();
        
        // Check if axios GET was called with the correct URL
        expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/api/employees', { withCredentials: true });
        // Check if the response matches the mock data
        expect(response.data).toEqual(mockEmployeesResponse.data);
    });

    it('should delete an employee', async () => {
        const employeeId = 1;
        axios.delete.mockResolvedValueOnce({});

        await EmployeeDataService.deleteEmployee(employeeId);
        
        // Check if axios DELETE was called with the correct URL
        expect(axios.delete).toHaveBeenCalledWith(`http://localhost:8080/api/employees/${employeeId}`, { withCredentials: true });
    });

    it('should update an employee', async () => {
        const employeeId = 1;
        const updatedEmployee = { ...mockEmployee, name: 'Jane Doe' };
        axios.put.mockResolvedValueOnce({ data: updatedEmployee });

        const response = await EmployeeDataService.updateEmployee(employeeId, updatedEmployee);
        
        // Check if axios PUT was called with the correct URL and data
        expect(axios.put).toHaveBeenCalledWith(`http://localhost:8080/api/employees/${employeeId}`, updatedEmployee, { withCredentials: true });
        // Check if the response matches the updated data
        expect(response.data).toEqual(updatedEmployee);
    });

    it('should create a new employee', async () => {
        axios.post.mockResolvedValueOnce({ data: mockEmployee });

        const response = await EmployeeDataService.createEmployee(mockEmployee);
        
        // Check if axios POST was called with the correct URL and data
        expect(axios.post).toHaveBeenCalledWith('http://localhost:8080/api/employees', mockEmployee, { withCredentials: true });
        // Check if the response matches the mock data
        expect(response.data).toEqual(mockEmployee);
    });

    it('should retrieve an employee by id', async () => {
        const employeeId = 1;
        axios.get.mockResolvedValueOnce({ data: mockEmployee });

        const response = await EmployeeDataService.retrieveEmployee(employeeId);
        
        // Check if axios GET was called with the correct URL
        expect(axios.get).toHaveBeenCalledWith(`http://localhost:8080/api/employees/${employeeId}`, { withCredentials: true });
        // Check if the response matches the mock data
        expect(response.data).toEqual(mockEmployee);
    });
});
