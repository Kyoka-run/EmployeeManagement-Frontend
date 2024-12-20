import axios from 'axios';

// const Project_API_URL = 'http://localhost:8080/projects';
const Project_API_URL = 'http://3.252.231.197/projects';

class ProjectDataService {
    retrieveAllProjects() {
        return axios.get(Project_API_URL);
    }

    deleteProject(id) {
        return axios.delete(Project_API_URL + '/' + id);
    }

    updateProject(id, project) {
        return axios.put(Project_API_URL + '/' + id, project);
    }

    createProject(project) {
        return axios.post(Project_API_URL, project);
    }

    retrieveProject(id) {
        return axios.get(Project_API_URL + '/' + id);
    }
}

export default new ProjectDataService();
