import AuthenticationService from '../service/AuthenticationService';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('AuthenticationService', () => {
    // Setup before each test
    beforeEach(() => {
        // Clear storage
        localStorage.clear();
        sessionStorage.clear();
        // Reset axios mocks
        jest.clearAllMocks();
    });

    // Test login functionality
    describe('login', () => {
        it('should successfully login and store token', async () => {
            const mockResponse = {
                data: {
                    token: 'fake-jwt-token',
                    userId: '123'
                }
            };
            axios.post.mockResolvedValue(mockResponse);

            const response = await AuthenticationService.login('testuser', 'password');

            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/login'),
                { username: 'testuser', password: 'password' }
            );
            expect(localStorage.getItem('jwtToken')).toBe('fake-jwt-token');
            expect(sessionStorage.getItem('userId')).toBe('123');
            expect(response).toEqual(mockResponse);
        });

        it('should handle login failure', async () => {
            const errorMessage = 'Invalid credentials';
            axios.post.mockRejectedValue(new Error(errorMessage));

            await expect(AuthenticationService.login('testuser', 'wrong'))
                .rejects.toThrow(errorMessage);
        });
    });

    // Test JWT token management
    describe('JWT token management', () => {
        it('should correctly get JWT token', () => {
            localStorage.setItem('jwtToken', 'test-token');
            expect(AuthenticationService.getJwtToken()).toBe('test-token');
        });

        it('should setup axios interceptors with token', () => {
            const token = 'test-token';
            AuthenticationService.setupAxiosInterceptors(token);
            
            const interceptor = axios.interceptors.request.use.mock.calls[0][0];
            const config = { headers: {} };
            const result = interceptor(config);
            
            expect(result.headers.Authorization).toBe(`Bearer ${token}`);
        });
    });

    // Test user roles functionality
    describe('user roles', () => {
        it('should fetch and store user roles', async () => {
            const mockRoles = ['ADMIN', 'USER'];
            axios.get.mockResolvedValue({ data: mockRoles });

            await AuthenticationService.fetchUserRoles();

            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/roles'),
                expect.any(Object)
            );
            expect(JSON.parse(sessionStorage.getItem('userRoles'))).toEqual(mockRoles);
        });

        it('should handle role fetching error', async () => {
            axios.get.mockRejectedValue(new Error('Network error'));
            await AuthenticationService.fetchUserRoles();
            expect(sessionStorage.getItem('userRoles')).toBeNull();
        });

        it('should get user roles from session storage', () => {
            const mockRoles = ['ADMIN', 'USER'];
            sessionStorage.setItem('userRoles', JSON.stringify(mockRoles));
            expect(AuthenticationService.getUserRoles()).toEqual(mockRoles);
        });
    });

    // Test login status
    describe('login status', () => {
        it('should correctly identify logged in user', () => {
            localStorage.setItem('jwtToken', 'test-token');
            expect(AuthenticationService.isUserLoggedIn()).toBe(true);
        });

        it('should correctly identify logged out user', () => {
            expect(AuthenticationService.isUserLoggedIn()).toBe(false);
        });
    });

    // Test logout functionality
    describe('logout', () => {
        it('should clear all storage and reset axios header', () => {
            // Setup initial state
            localStorage.setItem('jwtToken', 'test-token');
            sessionStorage.setItem('userRoles', JSON.stringify(['ADMIN']));
            sessionStorage.setItem('userId', '123');
            sessionStorage.setItem('authenticatedUser', 'testuser');

            const mockContext = {
                setIsUserLoggedIn: jest.fn()
            };

            AuthenticationService.logout(mockContext);

            expect(localStorage.getItem('jwtToken')).toBeNull();
            expect(sessionStorage.getItem('userRoles')).toBeNull();
            expect(sessionStorage.getItem('userId')).toBeNull();
            expect(sessionStorage.getItem('authenticatedUser')).toBeNull();
            expect(mockContext.setIsUserLoggedIn).toHaveBeenCalledWith(false);
        });
    });

    // Test user operations
    describe('user operations', () => {
        it('should retrieve user details', async () => {
            const mockUser = { id: '123', username: 'testuser' };
            axios.get.mockResolvedValue({ data: mockUser });

            const response = await AuthenticationService.retrieveUser('123');
            expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/users/123'));
            expect(response.data).toEqual(mockUser);
        });

        it('should update password', async () => {
            const passwordUpdateRequest = {
                oldPassword: 'old',
                newPassword: 'new'
            };
            axios.put.mockResolvedValue({ data: { message: 'Success' } });

            await AuthenticationService.updatePassword('123', passwordUpdateRequest);
            expect(axios.put).toHaveBeenCalledWith(
                expect.stringContaining('/users/123/update-password'),
                passwordUpdateRequest
            );
        });
    });
});