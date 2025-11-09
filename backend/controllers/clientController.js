const { pool } = require('../config/db'); 

//CREATE Client 
exports.createClient = async (req, res) => {
    const { name, email, phone } = req.body; 

    if (!name || !email) {
        return res.status(400).json({ msg: 'Name and email are required fields.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
            [name, email, phone] 
        );
        res.status(201).json({
            msg: 'Client created successfully',
            client: result.rows[0]
        });
    } catch (err) {
        if (err.code === '23505') { 
            return res.status(409).json({ msg: 'Client with this email or phone already exists.' });
        }
        console.error("Database error in createClient:", err.message);
        res.status(500).json({ msg: 'Server error during client creation.' });
    }
};


// READ All Clients 
exports.getClients = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
        res.status(200).json({
            count: result.rowCount,
            clients: result.rows
        });
    } catch (err) {
        console.error("Database error in getClients:", err.message);
        res.status(500).json({ msg: 'Server error retrieving clients.' });
    }
};

// READ Single Client by ID
exports.getClientById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Client not found.' });
        }

        res.status(200).json({ client: result.rows[0] });
    } catch (err) {
        console.error("Database error in getClientById:", err.message);
        res.status(500).json({ msg: 'Server error retrieving client.' });
    }
};

// UPDATE Client 
exports.updateClient = async (req, res) => {
    const { id } = req.params;
    // all required fields are destructured
    const { name, email, phone, is_active } = req.body; 
    
    try {
        const result = await pool.query(
            'UPDATE clients SET name = $1, email = $2, phone = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
            [name, email, phone, is_active, id] 
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Client not found.' });
        }

        res.status(200).json({
            msg: 'Client updated successfully',
            client: result.rows[0]
        });
    } catch (err) {
        console.error("Database error in updateClient:", err.message); 
        res.status(500).json({ msg: 'Server error during client update.' });
    }
};


// DELETE Client 
exports.deleteClient = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING id', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Client not found.' });
        }

        res.status(200).json({ msg: `Client with ID ${id} deleted successfully.` });
    } catch (err) {
        console.error("Database error in deleteClient:", err.message);
        res.status(500).json({ msg: 'Server error during client deletion.' });
    }
};