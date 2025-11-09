
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Table, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import OrderFormModal from '../components/OrderFormModal';

const OrderList = () => {
    const { hasPermission, api, loading: authLoading } = useContext(AuthContext); 

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    const canRead = hasPermission('orders:read');
    const canCreate = hasPermission('orders:create');

    const handleShowOrder = () => setShowOrderModal(true);
    const handleCloseOrder = () => setShowOrderModal(false);
    
    const handleOrderSuccess = (newOrderId) => {
        handleCloseOrder();
        window.location.reload(); 
    };
    useEffect(() => {
        if (!canRead) return; 

        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch the list of orders (summary data)
                const response = await api.get('/orders'); 
                setOrders(response.data.orders);
            } catch (err) {
                setError(err.response?.data?.msg || 'Failed to fetch orders.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [canRead, api]); 

    const getStatusVariant = (status) => {
        switch (status) {
            case 'complete': return 'success';
            case 'pending': return 'warning';
            default: return 'secondary';
        }
    };



    
    if (authLoading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;
    if (!canRead) return <Container className="mt-5"><Alert variant="danger">Access Denied: You do not have permission to view Orders.</Alert></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">Error: {error}</Alert></Container>;
    if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;

    return (
        <Container className="mt-5">
            <h2 className="mb-4">Order Management System</h2>
            
            <div className="d-flex justify-content-between align-items-center mb-3">
                 <h4>Order History ({orders.length} Total)</h4>
                 {canCreate && (
                    <Button variant="primary" onClick={handleShowOrder}>
                        + Place New Order
                    </Button>
                 )}
            </div>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Client</th>
                        <th>User</th>
                        <th>Order placed</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date Placed</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.client_name}</td>
                            <td>{order.user_name}</td>
                            <td>
                                {order.order_items_summary && order.order_items_summary.length > 0 ? (
                                    <ul>
                                        {order.order_items_summary.map((item, index) => (
                                            <li key={index} style={{ listStyleType: 'none', margin: 0, padding: 0 }}>
                                                {item.product_name} x {item.quantity} </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className="text-muted">No items found</span>
                                )}
                            </td>
                            <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                            <td>
                                <Badge bg={getStatusVariant(order.status)}>
                                    {order.status.toUpperCase()}
                                </Badge>
                            </td>
                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                            
                        </tr>
                    ))}
                </tbody>
            </Table>

            {orders.length === 0 && !loading && (
                <Alert variant="info" className="text-center">No orders found in the system. {canCreate && "Click 'Place New Order' to begin."}</Alert>
            )}
            <OrderFormModal
                show={showOrderModal} 
                handleClose={handleCloseOrder} 
                onOrderSuccess={handleOrderSuccess} 
            />
        </Container>
    );
};

export default OrderList;