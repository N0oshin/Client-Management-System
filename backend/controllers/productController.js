const { pool } = require('../config/db'); 

exports.createProduct = async (req, res) => {
    const { name, price, description } = req.body;
    
    if (!name || !price) {
        return res.status(400).json({ msg: 'Name and price are required fields.' });
    }
    
    if (isNaN(parseFloat(price))) {
        return res.status(400).json({ msg: 'Price must be a valid number.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING *',
            [name, price, description]
        );
        res.status(201).json({
            msg: 'Product created successfully',
            product: result.rows[0]
        });
    } catch (err) {
        console.error("Database error in createProduct:", err.message);
        res.status(500).json({ msg: 'Server error during product creation.' });
    }
};

// READ All Products 
exports.getProducts = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, price, description FROM products ORDER BY id ASC');
        res.status(200).json({
            count: result.rowCount,
            products: result.rows
        });
    } catch (err) {
        console.error("Database error in getProducts:", err.message);
        res.status(500).json({ msg: 'Server error retrieving products.' });
    }
};

// READ Single Product by ID 
exports.getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT id, name, price, description FROM products WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Product not found.' });
        }

        res.status(200).json({ product: result.rows[0] });
    } catch (err) {
        console.error("Database error in getProductById:", err.message);
        res.status(500).json({ msg: 'Server error retrieving product.' });
    }
};

// UPDATE Product
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, description } = req.body;

    if (!name || !price) {
        return res.status(400).json({ msg: 'Name and price are required fields.' });
    }
    
    try {
        const result = await pool.query(
            'UPDATE products SET name = $1, price = $2, description = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
            [name, price, description, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Product not found.' });
        }

        res.status(200).json({
            msg: 'Product updated successfully',
            product: result.rows[0]
        });
    } catch (err) {
        console.error("Database error in updateProduct:", err.message);
        res.status(500).json({ msg: 'Server error during product update.' });
    }
};

// DELETE Product 
exports.deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Product not found.' });
        }

        res.status(200).json({ msg: `Product with ID ${id} deleted successfully.` });
    } catch (err) {
        console.error("Database error in deleteProduct:", err.message);
        res.status(500).json({ msg: 'Server error during product deletion.' });
    }
};