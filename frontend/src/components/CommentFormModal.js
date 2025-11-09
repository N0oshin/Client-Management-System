
import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';

const CommentFormModal = ({ show, handleClose, onSaveSuccess, commentToEdit }) => {
    const { api } = useContext(AuthContext);
    const isEditing = !!commentToEdit;
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (show && isEditing && commentToEdit) {
            setContent(commentToEdit.content || '');
        } else if (show && !isEditing) {
            resetForm();
        }
    }, [show, isEditing, commentToEdit]);

    const resetForm = () => {
        setContent('');
        setError(null);
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!content.trim()) {
            setError('Comment content cannot be empty.');
            setLoading(false);
            return;
        }

        try {
            const commentData = { content };
            let response;
            
            if (isEditing) {
                //  (PUT) operation
                response = await api.put(`/comments/${commentToEdit.id}`, commentData);
            } else {
                //  (POST) operation 
                response = await api.post('/comments', commentData);
            }

            onSaveSuccess(response.data.comment);
            
            handleClose();
        } catch (err) {
            console.error("Comment save failed:", err);
            
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} onExited={resetForm} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{isEditing ? `Edit Comment ${commentToEdit.id}` : 'Add New Comment'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <Form.Group className="mb-3" controlId="formContent">
                        <Form.Label>Comment Content</Form.Label>
                        <Form.Control 
                            as="textarea"
                            rows={4}
                            placeholder="Type your feedback or comment here..." 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Comment' : 'Save Comment')}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CommentFormModal;