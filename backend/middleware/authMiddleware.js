const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware for JWT Authentication 
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Attach decoded user info (id, role_id, role_name) to the request
        req.user = decoded; 
        
        next(); 
    } catch (err) {
        return res.status(403).json({ msg: 'Invalid token.' });
    }
};

exports.authorizePermission = (requiredPermissions) => {
    return async (req, res, next) => {
        //  Check if user is authenticated 
        if (!req.user) {
            return res.status(500).json({ msg: 'Authorization failure: User not authenticated.' });
        }

        if (req.user.role_name === 'Admin') {
            return next();
        }

        // Retrieve ALL permissions for the user's role_id
        try {
            const permissionQuery = `
                SELECT p.code
                FROM role_permissions rp
                JOIN permissions p ON rp.permission_id = p.id
                WHERE rp.role_id = $1;
            `;
            
            const result = await pool.query(permissionQuery, [req.user.role_id]);
            
            // Map the results to a simple array of permission codes
            const userPermissions = result.rows.map(row => row.code);

            // Check if the user has the required permissions
            const hasPermission = requiredPermissions.some(perm => 
                userPermissions.includes(perm)
            );

            if (hasPermission) {
                next(); // Authorization successful
            } else {
                res.status(403).json({ msg: 'Forbidden. You do not have permission to perform this action.' });
            }

        } catch (err) {
            console.error('Authorization check failed:', err.message);
            res.status(500).json({ msg: 'Authorization service error.' });
        }
    };
};