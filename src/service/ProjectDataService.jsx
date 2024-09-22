import axios from 'axios';

const Project_API_URL = 'http://localhost:8080/api/projects';

class ProjectDataService {
    retrieveAllProjects() {
        return axios.get(Project_API_URL, { withCredentials: true }).then(response => {
            console.log('API Response:', response);
            return response;
        });
    }

    deleteProject(id) {
        return axios.delete(Project_API_URL + '/' + id, { withCredentials: true });
    }

    updateProject(id, project) {
        return axios.put(Project_API_URL + '/' + id, project, { withCredentials: true });
    }

    createProject(project) {
        return axios.post(Project_API_URL, project, { withCredentials: true });
    }

    retrieveProject(id) {
        return axios.get(Project_API_URL + '/' + id, { withCredentials: true });
    }
}

export default new ProjectDataService();
