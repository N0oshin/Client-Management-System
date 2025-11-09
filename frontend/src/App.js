import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ClientList from './pages/ClientList'; 
import CommentList from './pages/CommentList';
import ProductList from './pages/ProductList';
import OrderList from './pages/OrderList';
import { AuthContext } from './context/AuthContext';
import AppNavbar from './components/AppNavbar';
import './App.css';



const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = React.useContext(AuthContext);
    if (loading) return <div>Loading...</div>;
    // Redirect to login if not authenticated
    return isAuthenticated ? children : <Navigate to="/login" />;
};


function App() {
  return (
    <>
        <AppNavbar /> 

            <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route path="/" element={<Navigate to="/clients" />} />
              
                <Route 
                    path="/clients" 
                    element={<PrivateRoute><ClientList /></PrivateRoute>} 
                />
                <Route 
                    path="/products" 
                    element={<PrivateRoute><ProductList /></PrivateRoute>} 
                />

                <Route 
                    path="/orders" 
                    element={<PrivateRoute><OrderList /></PrivateRoute>} 
                />

                <Route 
                    path="/comments" 
                    element={<PrivateRoute><CommentList /></PrivateRoute>} 
                />

            </Routes>
        </>
  );
}

export default App;
