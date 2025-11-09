import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Form, Alert, Row, Col, InputGroup, Spinner } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';

//  Payment Methods for the dropdown
const PAYMENT_METHODS = ['Credit Card', 'Cash'];

const OrderFormModal = ({ show, handleClose, onOrderSuccess }) => {
    const { api } = useContext(AuthContext);
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    const [clientId, setClientId] = useState('');
    const [orderItems, setOrderItems] = useState([]);
    const [payments, setPayments] = useState([{ method: 'Credit Card', amount: 0.00 }]);
   
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const calculateTotal = () => {
        let total = 0;
        orderItems.forEach(item => {
            const product = products.find(p => p.id === item.product_id);
            if (product) {
                total += parseFloat(product.price) * item.quantity;
            }
        });
        return total;
    };

    const calculatedTotal = calculateTotal();
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const remainingBalance = calculatedTotal - totalPaid;
    const isPaymentBalanced = Math.abs(remainingBalance) < 0.01; 

    // Data Initialization 
    useEffect(() => {
        const fetchRequiredData = async () => {
            setDataLoading(true);
            try {
                // Fetch Clients and Products concurrently
                const [clientsRes, productsRes] = await Promise.all([
                    api.get('/clients'),
                    api.get('/products')
                ]);
                
                setClients(clientsRes.data.clients);
                setProducts(productsRes.data.products.map(p => ({ 
                    ...p, 
                    id: parseInt(p.id) 
                }))); 

            } catch (err) {
                setError('Failed to load clients or products needed for the order form.');
                console.error('Order Form Init Error:', err);
            } finally {
                setDataLoading(false);
            }
        };

        if (show) {
            fetchRequiredData();
        }
    }, [show, api]);


    const handleAddItem = () => {
        setOrderItems([...orderItems, { product_id: products[0]?.id || '', quantity: 1 }]);
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...orderItems];
        updatedItems[index][field] = value;
        setOrderItems(updatedItems);
    };

    const handleRemoveItem = (index) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    // Payment Handlers 
    const handlePaymentChange = (index, field, value) => {
        const updatedPayments = [...payments];
        updatedPayments[index][field] = value;
        setPayments(updatedPayments);
    };

    const handleAddPayment = () => {
        setPayments([...payments, { method: 'Cash', amount: 0.00 }]);
    };

    const handleRemovePayment = (index) => {
        setPayments(payments.filter((_, i) => i !== index));
    };

    //  Form Submt
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!isPaymentBalanced) {
            setError(`Payment mismatch! Total cost is $${calculatedTotal.toFixed(2)}, but paid amount is $${totalPaid.toFixed(2)}.`);
            return;
        }

        setLoading(true);

        try {
            const orderData = { 
                client_id: parseInt(clientId),
                items: orderItems.map(item => ({
                    product_id: parseInt(item.product_id),
                    quantity: parseInt(item.quantity)
                })),
                payments: payments.map(p => ({
                    method: p.method,
                    amount: parseFloat(p.amount)
                }))
            };
            
            const response = await api.post('/orders', orderData); 

            onOrderSuccess(response.data.order_id);
            handleClose();
            
        } catch (err) {
            console.error("Order submission failed:", err.response?.data?.msg || err.message);
            setError(err.response?.data?.msg || 'Failed to place order due to server error.');
        } finally {
            setLoading(false);
        }
    };
    
    if (dataLoading) {
        return (
            <Modal show={show} onHide={handleClose}>
                <Modal.Body className="text-center"><Spinner animation="border" size="sm" /> Loading Order Data...</Modal.Body>
            </Modal>
        );
    }

    return (
        <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Place New Order</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    {/* CLIENT SELECTION */}
                    <Form.Group className="mb-3">
                        <Form.Label>Client</Form.Label>
                        <Form.Select 
                            value={clientId} 
                            onChange={(e) => setClientId(e.target.value)} 
                            required
                        >
                            <option value="">Select a Client</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {/* ITEMS LIST */}
                    <h5 className="mt-4 mb-3">Order Items</h5>
                    {orderItems.map((item, index) => (
                        <Row key={index} className="mb-2 align-items-end">
                            <Col xs={6}>
                                <Form.Label>Product</Form.Label>
                                <Form.Select 
                                    value={item.product_id}
                                    onChange={(e) => handleItemChange(index, 'product_id', parseInt(e.target.value))}
                                    required
                                >
                                    <option value="">Select Product</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (${parseFloat(p.price).toFixed(2)})</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col xs={3}>
                                <Form.Label>Quantity</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                    required
                                />
                            </Col>
                            <Col xs={3} className="d-flex align-items-center">
                                <Button 
                                    variant="danger" 
                                    onClick={() => handleRemoveItem(index)}
                                    className="mt-2"
                                >
                                    Remove
                                </Button>
                            </Col>
                        </Row>
                    ))}
                    <Button variant="outline-secondary" onClick={handleAddItem} className="mt-2">
                        + Add Product Line
                    </Button>

                    {/* PAYMENTS & TOTALS */}
                    <h5 className="mt-4 mb-3">Payments (Total: ${calculatedTotal.toFixed(2)})</h5>
                    {payments.map((payment, index) => (
                        <Row key={index} className="mb-2 align-items-end">
                            <Col xs={6}>
                                <Form.Label>Method</Form.Label>
                                <Form.Select
                                    value={payment.method}
                                    onChange={(e) => handlePaymentChange(index, 'method', e.target.value)}
                                    required
                                >
                                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                                </Form.Select>
                            </Col>
                            <Col xs={3}>
                                <Form.Label>Amount Paid</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    value={payment.amount}
                                    onChange={(e) => handlePaymentChange(index, 'amount', e.target.value)}
                                    required
                                />
                            </Col>
                            <Col xs={3} className="d-flex align-items-center">
                                {payments.length > 1 && (
                                    <Button 
                                        variant="danger" 
                                        onClick={() => handleRemovePayment(index)}
                                        className="mt-2"
                                    >
                                        Remove
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    ))}
                    <Button variant="outline-secondary" onClick={handleAddPayment} className="mt-2">
                        + Add Payment Method
                    </Button>
                    
                    {/* BALANCE CHECK */}
                    <Alert variant={isPaymentBalanced ? 'success' : 'warning'} className="mt-3">
                        **Total Paid:** ${totalPaid.toFixed(2)} | **Remaining Balance:** ${remainingBalance.toFixed(2)}
                    </Alert>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={loading || !clientId || orderItems.length === 0 || !isPaymentBalanced}
                    >
                        {loading ? 'Processing Order...' : 'Submit Order'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default OrderFormModal;