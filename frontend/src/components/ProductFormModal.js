// src/components/ProductFormModal.js

import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Form, Alert, InputGroup } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';

const ProductFormModal = ({ show, handleClose, onSaveSuccess, productToEdit }) => {
    const { api } = useContext(AuthContext);
    const isEditing = !!productToEdit
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (show && isEditing && productToEdit) {
            // Populate form fields with existing product data
            setName(productToEdit.name || '');
            // Convert price (string) back to number state for input field
            setPrice(parseFloat(productToEdit.price).toFixed(2) || ''); 
            setDescription(productToEdit.description || '');
        } else if (show && !isEditing) {
            // Clear fields for CREATE mode
            resetForm();
        }
    }, [show, isEditing, productToEdit]);


    const resetForm = () => {
        setName('');
        setPrice('');
        setDescription('');
        setError(null);
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic client side validation
        if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            setError('Price must be a valid number greater than zero.');
            setLoading(false);
            return;
        }

        try {
            const productData = { name, price: parseFloat(price).toFixed(2), description };
            
            let response;
            
            if (isEditing) {
                // UPDATE operation
                response = await api.put(`/products/${productToEdit.id}`, productData);
            } else {
                // CREATE operation
                response = await api.post('/products', productData);
            }


            onSaveSuccess(response.data.product);
            
            handleClose();
            resetForm();
            
        } catch (err) {
            console.error("Product save failed:", err);
            setError(err.response?.data?.msg || 'Failed to save product due to server error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} onExited={resetForm} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{isEditing ? `Edit Product: ${productToEdit.name}` : 'Add New Product'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <Form.Group className="mb-3" controlId="formProductName">
                        <Form.Label>Product Name</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="e.g., Enterprise Software License" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="formProductPrice">
                        <Form.Label>Price ($)</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>$</InputGroup.Text>
                            <Form.Control 
                                type="number"
                                step="0.01" 
                                placeholder="e.g., 999.99" 
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formProductDescription">
                        <Form.Label>Description (Optional)</Form.Label>
                        <Form.Control 
                            as="textarea"
                            rows={3} 
                            placeholder="Detailed product features..." 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Product' : 'Save Product')}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ProductFormModal;