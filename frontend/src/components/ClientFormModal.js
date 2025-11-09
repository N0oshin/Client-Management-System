import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';

// Accept clientToEdit object
const ClientFormModal = ({ show, handleClose, onSaveSuccess, clientToEdit }) => {
    const { api } = useContext(AuthContext);
    
    const isEditing = !!clientToEdit;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);



    useEffect(() => {
        if (show && isEditing && clientToEdit) {
            setName(clientToEdit.name || '');
            setEmail(clientToEdit.email || '');
            setPhone(clientToEdit.phone || '');
        } else if (show && !isEditing) {
            resetForm();
        }
    }, [show, isEditing, clientToEdit]);

    const resetForm = () => {
        setName('');
        setEmail('');
        setPhone('');
        setError(null);
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const clientData = { name, email, phone };
            let response;
            
            if (isEditing) {
                clientData.is_active = clientToEdit.is_active; 
                response = await api.put(`/clients/${clientToEdit.id}`, clientData);
            } else {
                // (POST) operation
                response = await api.post('/clients', clientData);
            }

            onSaveSuccess(response.data.client);
            
            handleClose();

            
        } catch (err) {
            console.error("Client save failed:", err);
            setError(err.response?.data?.msg || 'Failed to save client due to server error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} onExited={resetForm} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{isEditing ? `Edit Client: ${clientToEdit.name}` : 'Add New Client'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                   
                    <Form.Group className="mb-3" controlId="formName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Client Name" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Form.Group>
                    
                  
                    <Form.Group className="mb-3" controlId="formEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control 
                            type="email" 
                            placeholder="Email Address" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                           
                        />
                    </Form.Group>

                   
                    <Form.Group className="mb-3" controlId="formPhone">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Phone Number" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Client' : 'Save Client')}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ClientFormModal;