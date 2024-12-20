import axios from 'axios';

// const Employee_API_URL = 'http://localhost:8080/employees';
const Employee_API_URL = 'http://3.252.231.197/employees';


class EmployeeDataService {

    retrieveAllEmployees() {
        return axios.get(Employee_API_URL);
    }

    deleteEmployee(id) {
        return axios.delete(Employee_API_URL + '/' + id);
    }

    updateEmployee(id, employee) {
        return axios.put(Employee_API_URL + '/' + id, employee);
    }

    createEmployee(employee) {
        return axios.post(Employee_API_URL, employee);
    }

    retrieveEmployee(id) {
        return axios.get(Employee_API_URL + '/' + id);
    }
}

export default new EmployeeDataService();