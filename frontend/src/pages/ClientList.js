// src/pages/ClientList.js

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap';
import ClientFormModal from '../components/ClientFormModal';

const ClientList = () => {

    const { hasPermission, api, loading: authLoading } = useContext(AuthContext); 

    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [clientToEdit, setClientToEdit] = useState(null); 

    // Permissions 
    const canRead = hasPermission('clients:read');
    const canCreate = hasPermission('clients:create');
    const canUpdate = hasPermission('clients:update'); 
    const canDelete = hasPermission('clients:delete');

    // --- Modal Handlers ---
    const handleClose = () => {
        setShowModal(false);
        setClientToEdit(null); 
    };
    
    // Handler for "Add New Client" button
    const handleShowCreate = () => {
        setClientToEdit(null); 
        setShowModal(true);
    };

    // Handler for "Edit" button
    const handleShowEdit = (client) => {
        setClientToEdit(client);
        setShowModal(true);     
    };
    
    // Success Handler: Updates table for  CREATE and UPDATE
    const handleSaveSuccess = (savedClient) => {
        if (clientToEdit) {
            setClients(prevClients => 
                prevClients.map(c => 
                    c.id === savedClient.id ? savedClient : c
                )
            );
        } else {
            setClients(prevClients => [savedClient, ...prevClients]);
        }
    };
    
    // --- DELETE Handler ---
    const handleDelete = async (clientId) => {
        if (!window.confirm("Are you sure you want to delete this client?")) {
            return;
        }

        try {
            await api.delete(`/clients/${clientId}`);
            
            // Remove the client from the local state list 
            setClients(prevClients => prevClients.filter(c => c.id !== clientId));
            alert(`Client ID ${clientId} deleted successfully.`);
        } catch (err) {
            console.error('Delete failed:', err);
            alert(err.response?.data?.msg || 'Failed to delete client.');
        }
    };


    // Data Fetching 
    useEffect(() => {
        if (!canRead) return; 

        const fetchClients = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get('clients'); 
                setClients(response.data.clients);
            } catch (err) {
                setError(err.response?.data?.msg || 'Failed to fetch clients.');
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, [canRead, api]); 


    if (authLoading) {
        return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    }
    if (!canRead) {
        return <Container className="mt-5"><Alert variant="danger">Access Denied: You do not have permission to view the Client List.</Alert></Container>;
    }
    if (error) {
        return <Container className="mt-5"><Alert variant="danger">Error: {error}</Alert></Container>;
    }
    if (loading) {
        return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    }

    return (
        <Container className="mt-5">
            <h2 className="mb-4">Client Management</h2>
            
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Client List ({clients.length} Total)</h4>
                {canCreate && (
                    <Button variant="success" onClick={handleShowCreate}> {/* Using handleShowCreate */}
                        + Add New Client
                    </Button>
                )}
            </div>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Registered</th>
                        {(canUpdate || canDelete) && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {clients.map(client => (
                        <tr key={client.id}>
                            <td>{client.id}</td>
                            <td>{client.name}</td>
                            <td>{client.email}</td>
                            <td>{client.phone}</td>
                            <td>{new Date(client.created_at).toLocaleDateString()}</td>
                            {(canUpdate || canDelete) && (
                                <td>
                                    {canUpdate && (
                                        <Button 
                                            variant="info" 
                                            size="sm" 
                                            className="me-2"
                                            onClick={() => handleShowEdit(client)} 
                                        >
                                            Edit
                                        </Button>
                                    )}
                                    
                                    {canDelete && (
                                        <Button 
                                            variant="danger" 
                                            size="sm"
                                            onClick={() => handleDelete(client.id)} 
                                        >
                                            Delete
                                        </Button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </Table>

            {clients.length === 0 && !loading && (
                <Alert variant="info" className="text-center">No clients found in the system.</Alert>
            )}
            <ClientFormModal 
                show={showModal} 
                handleClose={handleClose} 
                onSaveSuccess={handleSaveSuccess} 
                clientToEdit={clientToEdit} 
            />
        </Container>
    );
};

export default ClientList;