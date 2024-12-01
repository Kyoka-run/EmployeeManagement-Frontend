import axios from "axios";

const Employee_API = 'http://localhost:8080';
// const Employee_API = 'http://98.81.209.12';

export const USER_NAME_SESSION_ATTRIBUTE_NAME = 'authenticatedUser';
export const USER_ROLES_SESSION_ATTRIBUTE_NAME = 'userRoles';
export const USER_ID_SESSION_ATTRIBUTE_NAME = 'userId';

class AuthenticationService {
    static JWT_TOKEN_KEY = 'jwtToken';

    // Login method for authenticating user and storing JWT token
    async login(username, password) {
        try {
            const response = await axios.post(Employee_API + '/login', { username, password });
            if (response.data.token) {
                localStorage.setItem(AuthenticationService.JWT_TOKEN_KEY, response.data.token);
                // Store user ID and username
                sessionStorage.setItem(USER_ID_SESSION_ATTRIBUTE_NAME, response.data.userId);
                sessionStorage.setItem(USER_NAME_SESSION_ATTRIBUTE_NAME, username);
                this.setupAxiosInterceptors(this.getJwtToken());
            }
            return response;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    }

    // Retrieve JWT token from local storage
    getJwtToken() {
        return localStorage.getItem(AuthenticationService.JWT_TOKEN_KEY);
    }

    // Register successful login and set up interceptors for authenticated requests
    async registerSuccessfulLogin(username, userId, token) {
        try {
            await this.fetchUserRoles();
            this.setupAxiosInterceptors(this.getJwtToken());
            const user = { id: userId, username };
            sessionStorage.setItem('authenticatedUser', JSON.stringify(user));     
        } catch (error) {
            console.error("Failed to register successful login:", error);
        }
    }

    // Fetch user roles from the server and store them in session storage
    async fetchUserRoles() {
        try {
            const response = await axios.get(Employee_API + `/roles`, {
                headers: {
                    Authorization: `Bearer ${this.getJwtToken()}`
                }
            });
            const roles = response.data;
            sessionStorage.setItem(USER_ROLES_SESSION_ATTRIBUTE_NAME, JSON.stringify(roles));
        } catch (error) {
            console.error("Failed to fetch user roles:", error);
        }
    }

    // Retrieve user roles from session storage
    getUserRoles() {
        const roles = sessionStorage.getItem(USER_ROLES_SESSION_ATTRIBUTE_NAME);
        return roles ? JSON.parse(roles) : [];
    }

    // Check if a user is logged in by verifying the existence of a JWT token
    isUserLoggedIn() {
        return this.getJwtToken() !== null;
    }

    // Logout method for clearing session data and resetting axios authorization header
    logout(context) {
        localStorage.removeItem(AuthenticationService.JWT_TOKEN_KEY);
        sessionStorage.removeItem(USER_ROLES_SESSION_ATTRIBUTE_NAME); // Clear user roles
        sessionStorage.removeItem(USER_ID_SESSION_ATTRIBUTE_NAME); // Clear user ID
        sessionStorage.removeItem(USER_NAME_SESSION_ATTRIBUTE_NAME); // Clear username
        axios.defaults.headers.common['Authorization'] = null;
        if (context && context.setIsUserLoggedIn) {
            context.setIsUserLoggedIn(false);
        }
    }

    retrieveUser(id) {
        return axios.get(`${Employee_API}/users/${id}`);
    }
    
    updatePassword(id, passwordUpdateRequest) {
        return axios.put(`${Employee_API}/users/${id}/update-password`, passwordUpdateRequest);
    }
      
    // Set up axios interceptors to include JWT token in all outgoing requests
    setupAxiosInterceptors(token) {
        axios.interceptors.request.use(
            config => {
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            error => {
                return Promise.reject(error);
            }
        );
    }
}

export default new AuthenticationService();
