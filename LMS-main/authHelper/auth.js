const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET);
};

// Verify password using bcrypt
const verifyPassword = async (stored, given) => {
    try {
        return await bcrypt.compare(given, stored);
    } catch (error) {
        console.log(error.message);
        return false;
    }
};

// Authorize role for accessing protected resources
const authorizeRole = (role) => {
    if (role === 'faculty' || role === 'admin') return 1; // true
    if (role === 'student') return 0; // false
    return null;
};

// Create bcrypt hash for passwords
const createHash = async (password) => {
    return await bcrypt.hash(password, 10);
};

// Extract user info from Authorization header (Bearer token)
const extractInfo = (req) => {
    const headers = req.headers;
    if (!headers || !headers.authorization) {
        // No token provided
        return null;
    }
    try {
        const token = headers.authorization.split(' ')[1];
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const { id, role } = verified;
        return { id, role };
    } catch (error) {
        console.log(error.message);
        return null;
    }
};

module.exports = {
    generateToken,
    verifyPassword,
    authorizeRole,
    createHash,
    extractInfo,
};
