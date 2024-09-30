import axios from "axios";
const Employee_API = 'http://localhost:8080/api';

export const USER_NAME_SESSION_ATTRIBUTE_NAME = 'authenticatedUser'
export const USER_ROLES_SESSION_ATTRIBUTE_NAME = 'userRoles';

class AuthenticationService {

    login(username, password) {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        return axios.post(Employee_API + '/login', params, { withCredentials: true })
        .then(response => {
            sessionStorage.setItem(USER_NAME_SESSION_ATTRIBUTE_NAME, username);
            this.fetchUserRoles(); 
            this.setupAxiosInterceptors();
            return response;
        });
    }

    async registerSuccessfulLogin(username,id) {
        sessionStorage.setItem(USER_NAME_SESSION_ATTRIBUTE_NAME, username);
        await this.fetchUserRoles(id); 
        this.setupAxiosInterceptors();
    }

    async fetchUserRoles() {
        try {
            const response = await axios.get(Employee_API + '/user/roles', { withCredentials: true });
            const roles = response.data;
            console.log("Roles fetched from API:", roles);
            sessionStorage.setItem(USER_ROLES_SESSION_ATTRIBUTE_NAME, JSON.stringify(roles));
        } catch (error) {
            console.error("Failed to fetch user roles:", error);
        }
    }

    getUserRoles() {
        const roles = sessionStorage.getItem(USER_ROLES_SESSION_ATTRIBUTE_NAME);
        return roles ? JSON.parse(roles) : [];
    }    

    isUserLoggedIn() {
        return sessionStorage.getItem(USER_NAME_SESSION_ATTRIBUTE_NAME) !== null;
    }

    logout(context) {
        axios.post("http://localhost:8080/api/logout", {}, { withCredentials: true })
            .then(() => {
                sessionStorage.removeItem(USER_NAME_SESSION_ATTRIBUTE_NAME);
                sessionStorage.removeItem(USER_ROLES_SESSION_ATTRIBUTE_NAME);
                if (context && context.setIsUserLoggedIn) {
                    context.setIsUserLoggedIn(false);
                }
            })
            .catch(error => {
                console.error("Logout failed:", error); 
            });
    }
    
    setupAxiosInterceptors() {
        axios.interceptors.request.use((config) => {
            let user = sessionStorage.getItem(USER_NAME_SESSION_ATTRIBUTE_NAME);
            if (user) {
                config.withCredentials = true;
            }
            return config;
        });
    }
}

export default new AuthenticationService();