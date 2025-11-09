import React, { useContext } from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AppNavbar = () => {
    const { isAuthenticated, user, logout, hasPermission } = useContext(AuthContext);

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
            <Container>
                <Navbar.Brand as={NavLink} to="/">
                    Client Manager
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {isAuthenticated && (
                            <>
                                {hasPermission('clients:read') && (
                                    <Nav.Link as={NavLink} to="/clients">
                                        Clients
                                    </Nav.Link>
                                )}
                                {hasPermission('products:read') && (
                                    <Nav.Link as={NavLink} to="/products">
                                        Products
                                    </Nav.Link>
                                )}
                                
                                {hasPermission('orders:read') && (
                                    <Nav.Link as={NavLink} to="/orders">
                                        Orders
                                    </Nav.Link>
                                )}
                                
                                {hasPermission('comments:read') && (
                                    <Nav.Link as={NavLink} to="/comments">
                                        Comments
                                    </Nav.Link>
                                )}
                            </>
                        )}
                    </Nav>

                  
                    <Nav>
                        {isAuthenticated ? (
                            <>
                            
                                <Navbar.Text className="me-3">
                                    Signed in as: <strong className="text-info">{user?.role || 'User'}</strong>
                                </Navbar.Text>
                                
                                <Button variant="outline-light" onClick={logout}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Nav.Link as={NavLink} to="/login">
                                Login
                            </Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;