import React, { createContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApi, protectedApi } from '../api/axios'; 


const initialState = {
    isAuthenticated: false,
    user: null,        
    permissions: [],   
    token: localStorage.getItem('token') || null,
    loading: true, 
};


const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            // Store token and user data in localStorage
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user)); 

            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                permissions: Array.isArray(action.payload.permissions) ? action.payload.permissions : [],
                token: action.payload.token,
            };
        case 'LOGOUT':
            localStorage.removeItem('token');
            localStorage.removeItem('user'); 
            return {
                ...initialState,
                isAuthenticated: false,
                user: null,
                permissions: [],
                token: null,
            };
        case 'SET_PERMISSIONS':
             return {
                ...state,
                permissions: Array.isArray(action.payload) ? action.payload : [],
            };
        case 'STOP_LOADING': 
            return {
                ...state,
                loading: false,
            };
        default:
            return state;
    }
};



export const AuthContext = createContext();



export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const navigate = useNavigate();

    // Dynamically generate the API client whenever the token changes
    const api = protectedApi(state.token);
    
    // fetch  all permissions for a user's role
    const fetchPermissions = (role_name) => { 
        
        const permissionMap = {
            'Admin': ['clients:read', 'clients:create', 'clients:update', 'clients:delete', 
                      'products:read', 'products:create', 'products:update', 'products:delete',
                      'orders:read', 'orders:create', 
                      'comments:read', 'comments:create', 'comments:update', 'comments:delete',
                      'users:read', 'users:create', 'users:update', 'users:delete'], // Added users permissions
            'Sales Rep': ['clients:read', 'clients:create', 'clients:update', 
                          'orders:read', 'orders:create', 'products:read', 'comments:read'],
            'Comment Viewer': ['comments:read'],
        };
        
        const permissions = permissionMap[role_name];

        if (permissions && Array.isArray(permissions)) {
            dispatch({ type: 'SET_PERMISSIONS', payload: permissions });
        } else {
            console.error("AuthContext Error: Cannot map permissions for role:", role_name);
            dispatch({ type: 'SET_PERMISSIONS', payload: [] });
        }
    };

    useEffect(() => {
        const initializeAuth = () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    dispatch({
                        type: 'LOGIN',
                        payload: {
                            token: storedToken,
                            user: user, 
                            permissions: [], 
                        },
                    });
                    
                } catch (e) {
                    console.error("Failed to parse user data, logging out:", e);
                    dispatch({ type: 'LOGOUT' });
                }
            }
   
            dispatch({ type: 'STOP_LOADING' }); 
        };


        initializeAuth();
        
    }, []); 



    useEffect(() => {
        if (state.isAuthenticated && state.user && state.permissions.length === 0) {
            fetchPermissions(state.user.role); 
        }
    }, [state.isAuthenticated, state.user, state.permissions.length]);




    // Authentication
    const login = async (email, password) => {
        try {
            const res = await publicApi.post('/auth/login', { email, password });

            dispatch({
                type: 'LOGIN',
                payload: {
                    token: res.data.token,
                    user: res.data.user // { id, name, email, role }
                },
            });
            navigate('/clients'); 
        } catch (err) {
            console.error('Login failed:', err.response?.data?.msg || err.message);
            return err.response?.data?.msg || 'Login failed';
        }
    };
    
    const logout = () => {
        dispatch({ type: 'LOGOUT' });
        navigate('/login');
    };

   
    const hasPermission = (permissionCode) => {
        if (!state.user) {
            return false;
        }

        if (state.user.role === 'Admin') {
            return true;
        }
        
        return Array.isArray(state.permissions) && state.permissions.includes(permissionCode);
    };


    const contextValue = {
        ...state,
        login,
        logout,
        api, 
        hasPermission,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};