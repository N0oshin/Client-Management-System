
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap';
import CommentFormModal from '../components/CommentFormModal'; 

const CommentList = () => {
    const { hasPermission, api, loading: authLoading } = useContext(AuthContext); 

    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [commentToEdit, setCommentToEdit] = useState(null); 

    const canRead = hasPermission('comments:read');
    const canCreate = hasPermission('comments:create');
    const canUpdate = hasPermission('comments:update');
    const canDelete = hasPermission('comments:delete'); 

    //  Modal Handlers 
    const handleClose = () => {
        setShowModal(false);
        setCommentToEdit(null); 
    };
    
    const handleShowCreate = () => {
        setCommentToEdit(null);
        setShowModal(true);
    };

    const handleShowEdit = (comment) => {
        if (!canUpdate) {
            alert("Access Denied: You do not have permission to edit comments.");
            return;
        }
        setCommentToEdit(comment); 
        setShowModal(true);        
    };

    const handleSaveSuccess = (savedComment) => {
        if (commentToEdit) {
            setComments(prevComments => 
                prevComments.map(c => 
                    c.id === savedComment.id ? savedComment : c
                )
            );
        } else {
            setComments(prevComments => [savedComment, ...prevComments]);
        }
    };
    
    const handleDelete = async (commentId) => {
        if (!canDelete) {
            alert("Access Denied: You do not have permission to delete comments.");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this comment?")) {
            return;
        }

        try {
            await api.delete(`/comments/${commentId}`);
            
            // Remove the comment from the local state 
            setComments(prevComments => prevComments.filter(c => c.id !== commentId));
            alert(`Comment ID ${commentId} deleted successfully.`);
        } catch (err) {
            console.error('Delete failed:', err);
            alert(err.response?.data?.msg || 'Failed to delete comment.');
        }
    };
    
    //Data Fetching Effect 
    useEffect(() => {
        if (!canRead) return; 

        const fetchComments = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get('/comments'); 
                setComments(response.data.comments);
            } catch (err) {
                setError(err.response?.data?.msg || 'Failed to fetch comments.');
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [canRead, api]); 


    if (authLoading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    
    if (!canRead) return <Container className="mt-5"><Alert variant="danger">Access Denied: You do not have permission to view Comments.</Alert></Container>;
    
    if (error) return <Container className="mt-5"><Alert variant="danger">Error: {error}</Alert></Container>;
    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;

    return (
        <Container className="mt-5">
            <h2 className="mb-4">Comments and Feedback</h2>
            
            <div className="d-flex justify-content-between align-items-center mb-3">
                 <h4>System Comments ({comments.length} Total)</h4>
                 {canCreate && ( 
                    <Button variant="success" onClick={handleShowCreate}>
                        + Add New Comment
                    </Button>
                 )}
            </div>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Content</th>
                        <th>Author</th>
                        <th>Date Posted</th>
                        {(canUpdate || canDelete) && <th>Actions</th>} 
                    </tr>
                </thead>
                <tbody>
                    {comments.map(comment => (
                        <tr key={comment.id}>
                            <td>{comment.id}</td>
                            <td>{comment.content}</td>
                            <td>{comment.author_name} ({comment.author_email})</td> 
                            <td>{new Date(comment.created_at).toLocaleDateString()}</td>
                            {(canUpdate || canDelete) && (
                                <td>
                                    {canUpdate && (
                                        <Button 
                                            variant="info" 
                                            size="sm" 
                                            className="me-2"
                                            onClick={() => handleShowEdit(comment)}
                                        >
                                            Edit
                                        </Button>
                                    )}
                                    {canDelete && (
                                        <Button 
                                            variant="danger" 
                                            size="sm"
                                            onClick={() => handleDelete(comment.id)}
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

            {comments.length === 0 && !loading && (
                <Alert variant="info" className="text-center">No comments have been posted yet.</Alert>
            )}
            
            <CommentFormModal
                show={showModal} 
                handleClose={handleClose} 
                onSaveSuccess={handleSaveSuccess} 
                commentToEdit={commentToEdit}
            />
        </Container>
    );
};

export default CommentList;