const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET; 

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role_id: user.role_id, role_name: user.role_name }, 
        JWT_SECRET, 
        { expiresIn: '1d' }
    );
};

//  User Registration 
exports.register = async (req, res) => {
    const { name, email, password, role_name = 'Sales Rep' } = req.body;

    try {
        // Check if user already exists
        let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rowCount > 0) {
            return res.status(400).json({ msg: 'User already exists with this email.' });
        }

        //  Determine Role ID
        const roleResult = await pool.query('SELECT id, name FROM roles WHERE name = $1', [role_name]);
        if (roleResult.rowCount === 0) {
            return res.status(400).json({ msg: `Role "${role_name}" not found.` });
        }
        const role_id = roleResult.rows[0].id;

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert New User
        const newUserResult = await pool.query(
            'INSERT INTO users (name, email, password_hash, role_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role_id',
            [name, email, password_hash, role_id]
        );
        const user = newUserResult.rows[0];
        
        // Generate Token and Respond
        const token = generateToken({ ...user, role_name });
        res.status(201).json({ 
            msg: 'User registered successfully',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: role_name }
        });

    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).json({ msg: 'Server error during registration.' });
    }
};

// User Login (Authenticates user) 
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            `SELECT u.id, u.email, u.password_hash, u.role_id, r.name AS role_name 
             FROM users u
             JOIN roles r ON u.role_id = r.id
             WHERE u.email = $1`,
            [email]
        );
        
        if (result.rowCount === 0) {
            return res.status(401).json({ msg: 'Invalid credentials: User not found.' });
        }
        const user = result.rows[0];

        // Check Password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ msg: 'Invalid credentials: Password incorrect.' });
        }

        // Generate Token and Respond
        const token = generateToken(user);
        res.status(200).json({ 
            msg: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role_name }
        });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ msg: 'Server error during login.' });
    }
};