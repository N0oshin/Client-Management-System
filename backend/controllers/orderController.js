const { pool } = require('../config/db');

// CREATE Order 
exports.createOrder = async (req, res) => {

    const { client_id, items, payments } = req.body;
    const user_id = req.user.id; 
    
    if (!client_id || !items || items.length === 0 || !payments || payments.length === 0) {
        return res.status(400).json({ msg: 'Order requires a client, items, and payment details.' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN'); 

        let calculatedTotal = 0;
        let paidTotal = 0;

        for (const item of items) {
            const productResult = await client.query('SELECT price FROM products WHERE id = $1', [item.product_id]);
            if (productResult.rowCount === 0) {
                throw new Error(`Product ID ${item.product_id} not found.`);
            }
            const unitPrice = parseFloat(productResult.rows[0].price);
            
            calculatedTotal += unitPrice * item.quantity;
            
            item.unit_price = unitPrice; 
        }

        for (const payment of payments) {
            paidTotal += parseFloat(payment.amount);
        }

        // FINANCIAL INTEGRITY CHECK 
        if (Math.abs(calculatedTotal - paidTotal) > 0.01) {
            throw new Error(`Financial mismatch: Order total is $${calculatedTotal.toFixed(2)}, but paid amount is $${paidTotal.toFixed(2)}.`);
        }

        // INSERT INTO ORDERS TABLE 
        const orderResult = await client.query(
            'INSERT INTO orders (client_id, user_id, total_amount, status) VALUES ($1, $2, $3, $4) RETURNING id',
            [client_id, user_id, calculatedTotal, 'complete'] 
        );
        const orderId = orderResult.rows[0].id;

        // INSERT INTO ORDER_ITEMS TABLE 
        for (const item of items) {
            await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
                [orderId, item.product_id, item.quantity, item.unit_price]
            );
        }

        // INSERT INTO ORDER_PAYMENTS TABLE
        for (const payment of payments) {
            await client.query(
                'INSERT INTO order_payments (order_id, method, amount) VALUES ($1, $2, $3)',
                [orderId, payment.method, payment.amount]
            );
        }

        await client.query('COMMIT'); 
        
        res.status(201).json({
            msg: 'Order created successfully and processed',
            order_id: orderId,
            total: calculatedTotal.toFixed(2),
            payments: payments
        });

    } catch (err) {
        await client.query('ROLLBACK'); 
        console.error("Order Transaction Error:", err.message);
        res.status(500).json({ msg: `Order failed: ${err.message}` });
    } finally {
        client.release(); 
    }
};


// READ All Orders
exports.getOrders = async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT 
                o.id, 
                o.total_amount, 
                o.status, 
                o.created_at, 
                c.name AS client_name, 
                u.name AS user_name,
                
                -- CRITICAL FIX: Aggregate the order items into a single JSON array
                (
                    SELECT json_agg(
                        json_build_object(
                            'product_name', p.name,
                            'quantity', oi.quantity,
                            'unit_price', oi.unit_price
                        )
                    )
                    FROM order_items oi
                    JOIN products p ON oi.product_id = p.id
                    WHERE oi.order_id = o.id
                ) AS order_items_summary
                
            FROM orders o
            JOIN clients c ON o.client_id = c.id
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
            `
        );
        res.status(200).json({
            count: result.rowCount,
            orders: result.rows
        });
    } catch (err) {
        console.error("Database error in getOrders:", err.message);
        res.status(500).json({ msg: 'Server error retrieving orders.' });
    }
};

// READ Single Order by ID 
exports.getOrderById = async (req, res) => {
    const { id } = req.params;

    try {
        const orderResult = await pool.query(
            `SELECT o.*, c.name AS client_name, u.name AS user_name
             FROM orders o
             JOIN clients c ON o.client_id = c.id
             JOIN users u ON o.user_id = u.id
             WHERE o.id = $1`, [id]
        );

        if (orderResult.rowCount === 0) {
            return res.status(404).json({ msg: 'Order not found.' });
        }
        const order = orderResult.rows[0];

        const itemsResult = await pool.query(
            `SELECT oi.*, p.name AS product_name
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`, [id]
        );
        order.items = itemsResult.rows;

        const paymentsResult = await pool.query(
            'SELECT method, amount, payment_date FROM order_payments WHERE order_id = $1', [id]
        );
        order.payments = paymentsResult.rows;

        res.status(200).json({ order });

    } catch (err) {
        console.error("Database error in getOrderById:", err.message);
        res.status(500).json({ msg: 'Server error retrieving order details.' });
    }
};