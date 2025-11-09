
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap';
import ProductFormModal from '../components/ProductFormModal';

const ProductList = () => {
    const { hasPermission, api, loading: authLoading } = useContext(AuthContext); 

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    


    const [showModal, setShowModal] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null); 
    const canRead = hasPermission('products:read');
    const canCreate = hasPermission('products:create');
    const canUpdate = hasPermission('products:update'); 
    const canDelete = hasPermission('products:delete');

    //
    const handleClose = () => {
        setShowModal(false);
        setProductToEdit(null); 
    };
    

    
    const handleShowCreate = () => {
        setProductToEdit(null); 
        setShowModal(true);
    };


    const handleShowEdit = (product) => {
        setProductToEdit(product); 
        setShowModal(true);        
    };


    const handleSaveSuccess = (savedProduct) => {
        if (productToEdit) {
            // Update: Replace the old product object in the array
            setProducts(prevProducts => 
                prevProducts.map(p => 
                    p.id === savedProduct.id ? savedProduct : p
                )
            );
        } else {
            // Create: Add new product
            setProducts(prevProducts => [savedProduct, ...prevProducts]);
        }
    };
    


    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product? ")) {
            return;
        }

        try {
            await api.delete(`/products/${productId}`);

            setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
            alert(`Product ID ${productId} deleted successfully.`);
            
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    useEffect(() => {
        if (!canRead) return; 

        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get('/products'); 
                setProducts(response.data.products);
            } catch (err) {
                setError(err.response?.data?.msg || 'Failed to fetch products.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [canRead, api]); 



    if (authLoading) {
        return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    }
    if (!canRead) {
        return <Container className="mt-5"><Alert variant="danger">Access Denied: You do not have permission to view the Product List.</Alert></Container>;
    }
    if (error) {
        return <Container className="mt-5"><Alert variant="danger">Error: {error}</Alert></Container>;
    }
    if (loading) {
        return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    }




    return (
        <Container className="mt-5">
            <h2 className="mb-4">Product Catalog Management</h2>
            
            <div className="d-flex justify-content-between align-items-center mb-3">
                 <h4>Product List ({products.length} Total)</h4>
                 {canCreate && (
                    <Button variant="success" onClick={handleShowCreate}> 
                        + Add New Product
                    </Button>
                 )}
            </div>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Description</th>
                        {(canUpdate || canDelete) && <th>Actions</th>} 
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>${parseFloat(product.price).toFixed(2)}</td>
                            <td>{product.description}</td>
                            {(canUpdate || canDelete) && (
                                <td>
                                    {canUpdate && (
                                        <Button 
                                            variant="info" 
                                            size="sm" 
                                            className="me-2"
                                            onClick={() => handleShowEdit(product)} 
                                        >
                                            Edit
                                        </Button>
                                    )}
                                    {canDelete && (
                                        <Button 
                                            variant="danger" 
                                            size="sm"
                                            onClick={() => handleDelete(product.id)} 
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

            {products.length === 0 && !loading && (
                <Alert variant="info" className="text-center">No products found in the catalog. {canCreate && "Click 'Add New Product' to begin."}</Alert>
            )}
            
        

            <ProductFormModal
                show={showModal} 
                handleClose={handleClose} 
                onSaveSuccess={handleSaveSuccess} 
                productToEdit={productToEdit} 
            />
        </Container>
    );
};

export default ProductList;