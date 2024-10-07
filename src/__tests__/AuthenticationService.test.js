import axios from 'axios';
import AuthenticationService, { USER_NAME_SESSION_ATTRIBUTE_NAME, USER_ROLES_SESSION_ATTRIBUTE_NAME } from '../service/AuthenticationService';

// Mock axios
jest.mock('axios');

describe('AuthenticationService', () => {

    afterEach(() => {
        // Clear the session storage after each test
        sessionStorage.clear();
    });

    it('should login and store the username and roles', async () => {
        const mockResponse = { data: 'mocked response' };
        const mockRolesResponse = { data: ['ROLE_USER', 'ROLE_ADMIN'] };
    
        axios.post.mockResolvedValueOnce(mockResponse);
        axios.get.mockResolvedValueOnce(mockRolesResponse);
    
        const username = 'testUser';
        const password = 'testPassword';
    
        const response = await AuthenticationService.login(username, password);
    
        // Check if login returns the correct response
        expect(response).toEqual(mockResponse);
    
        // Check if username is stored in sessionStorage
        expect(sessionStorage.getItem(USER_NAME_SESSION_ATTRIBUTE_NAME)).toBe(username);
    
        // Wait for fetchUserRoles to complete and roles to be stored
        await AuthenticationService.fetchUserRoles();
    
        // Check if roles are fetched and stored in sessionStorage
        expect(sessionStorage.getItem(USER_ROLES_SESSION_ATTRIBUTE_NAME)).toBe(JSON.stringify(mockRolesResponse.data));
    });

    it('should register successful login and fetch user roles', async () => {
        const mockRolesResponse = { data: ['ROLE_USER'] };
        axios.get.mockResolvedValueOnce(mockRolesResponse);

        const username = 'testUser';
        const id = 1;

        await AuthenticationService.registerSuccessfulLogin(username, id);

        // Check if username is stored in sessionStorage
        expect(sessionStorage.getItem(USER_NAME_SESSION_ATTRIBUTE_NAME)).toBe(username);

        // Check if roles are fetched and stored in sessionStorage
        expect(sessionStorage.getItem(USER_ROLES_SESSION_ATTRIBUTE_NAME)).toBe(JSON.stringify(mockRolesResponse.data));
    });

    it('should fetch user roles and store in sessionStorage', async () => {
        const mockRolesResponse = { data: ['ROLE_USER'] };
        axios.get.mockResolvedValueOnce(mockRolesResponse);

        await AuthenticationService.fetchUserRoles();

        // Check if roles are fetched and stored in sessionStorage
        expect(sessionStorage.getItem(USER_ROLES_SESSION_ATTRIBUTE_NAME)).toBe(JSON.stringify(mockRolesResponse.data));
    });

    it('should return roles from sessionStorage', () => {
        const mockRoles = ['ROLE_USER', 'ROLE_ADMIN'];
        sessionStorage.setItem(USER_ROLES_SESSION_ATTRIBUTE_NAME, JSON.stringify(mockRoles));

        const roles = AuthenticationService.getUserRoles();

        // Check if the roles are returned correctly
        expect(roles).toEqual(mockRoles);
    });

    it('should return true if user is logged in', () => {
        sessionStorage.setItem(USER_NAME_SESSION_ATTRIBUTE_NAME, 'testUser');
        
        const isLoggedIn = AuthenticationService.isUserLoggedIn();

        // Check if the user is logged in
        expect(isLoggedIn).toBe(true);
    });

    it('should return false if user is not logged in', () => {
        const isLoggedIn = AuthenticationService.isUserLoggedIn();

        // Check if the user is not logged in
        expect(isLoggedIn).toBe(false);
    });

    it('should log out and remove session storage items', async () => {
        sessionStorage.setItem(USER_NAME_SESSION_ATTRIBUTE_NAME, 'testUser');
        sessionStorage.setItem(USER_ROLES_SESSION_ATTRIBUTE_NAME, JSON.stringify(['ROLE_USER']));
        
        axios.post.mockResolvedValueOnce({});  // Mock logout API call

        const mockContext = { setIsUserLoggedIn: jest.fn() };

        await AuthenticationService.logout(mockContext);

        // Check if the sessionStorage items are removed
        expect(sessionStorage.getItem(USER_NAME_SESSION_ATTRIBUTE_NAME)).toBeNull();
        expect(sessionStorage.getItem(USER_ROLES_SESSION_ATTRIBUTE_NAME)).toBeNull();

        // Check if setIsUserLoggedIn is called with false
        expect(mockContext.setIsUserLoggedIn).toHaveBeenCalledWith(false);
    });

    it('should set up axios interceptors', () => {
        // Mock session storage
        sessionStorage.setItem(USER_NAME_SESSION_ATTRIBUTE_NAME, 'testUser');
        
        // Spy on axios interceptors
        const interceptorSpy = jest.spyOn(axios.interceptors.request, 'use');

        AuthenticationService.setupAxiosInterceptors();

        // Ensure the interceptor was set
        expect(interceptorSpy).toHaveBeenCalled();
    });
});
