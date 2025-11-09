
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { publicApi } from '../api/axios'; 

const Login = () => {
    const { login } = useContext(AuthContext); 

    const [isLogin, setIsLogin] = useState(true); 
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                // --- LOGIN 
                const loginError = await login(email, password);
                if (loginError) {
                    setError(loginError);
                }
            } else {
                // --- REGISTER 
                const userData = { name, email, password, role_name: 'Sales Rep' };
                
                const res = await publicApi.post('/auth/register', userData);
                
                await login(email, password); 
                
            }
        } catch (err) {
            console.error('Authentication error:', err.response?.data?.msg || err.message);
            setError(err.response?.data?.msg || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        setName('');
        setPassword('');
    };

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card style={{ width: '25rem' }}>
                <Card.Header as="h5" className="text-center">
                    {isLogin ? 'Client Manager Login' : 'Register New User'}
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>

                        {!isLogin && (
                            <Form.Group className="mb-3" controlId="formBasicName">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Enter full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        )}
                        
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control 
                                type="email" 
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        
                        <div className="d-grid gap-2">
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
                
                <Card.Footer className="text-center">
                    <Button variant="link" onClick={toggleMode} disabled={loading}>
                        {isLogin ? 'Need an account? Register here.' : 'Already have an account? Login here.'}
                    </Button>
                </Card.Footer>
            </Card>
        </Container>
    );
};

export default Login;