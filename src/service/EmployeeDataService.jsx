import axios from 'axios';

const Employee_API_URL = 'http://localhost:8080/employees';
// const Employee_API_URL = 'http://98.81.209.12/employees';


class EmployeeDataService {

    retrieveAllEmployees() {
        return axios.get(Employee_API_URL, { withCredentials: true });
    }

    deleteEmployee(id) {
        return axios.delete(Employee_API_URL + '/' + id, { withCredentials: true });
    }

    updateEmployee(id, employee) {
        return axios.put(Employee_API_URL + '/' + id, employee, { withCredentials: true });
    }

    createEmployee(employee) {
        return axios.post(Employee_API_URL, employee, { withCredentials: true });
    }

    retrieveEmployee(id) {
        return axios.get(Employee_API_URL + '/' + id, { withCredentials: true });
    }
}

export default new EmployeeDataService();