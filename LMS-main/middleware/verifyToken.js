const jwt = require('jsonwebtoken');

module.exports.verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json('Token not found');
    }
    try {
        const token = authHeader.split(' ')[1];
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) {
            return res.status(401).json('Invalid token');
        }
        req.id = verified.id;
        req.role = verified.role;
        next();
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
};