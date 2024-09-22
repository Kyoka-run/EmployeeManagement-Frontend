import axios from "axios";
const Employee_API = 'http://localhost:8080/api';

export const USER_NAME_SESSION_ATTRIBUTE_NAME = 'authenticatedUser'

class AuthenticationService {

    login(username, password) {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        return axios.post(Employee_API + '/login', params, { withCredentials: true });
    }

    registerSuccessfulLogin(username) {
        sessionStorage.setItem(USER_NAME_SESSION_ATTRIBUTE_NAME, username);
        this.setupAxiosInterceptors();
    }

    isUserLoggedIn() {
        return sessionStorage.getItem(USER_NAME_SESSION_ATTRIBUTE_NAME) !== null;
    }

    logout(context) {
        axios.post("http://localhost:8080/api/logout", {}, { withCredentials: true })
            .then(() => {
                sessionStorage.removeItem(USER_NAME_SESSION_ATTRIBUTE_NAME);
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