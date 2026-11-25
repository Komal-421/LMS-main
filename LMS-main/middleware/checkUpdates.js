
module.exports.checkUpdates = (req, res, next) => {
    const updates = Object.keys(req.body);
    const role = req.role;
    // Define which fields each role can update
    const allowedFields = {
        admin: ['name', 'email', 'phone', 'password', 'dob', 'address', 'department', 'experience', 'status', 'enrollment_no', 'gender', 'admissionDate'],
        faculty: ['name', 'email', 'phone', 'password', 'dob', 'address', 'department', 'experience'],
        student: ['name', 'email', 'phone', 'password', 'dob', 'address']
    };
    const permitted = allowedFields[role] || [];
    const invalid = updates.filter(field => !permitted.includes(field));
    if (invalid.length) {
        return res.status(403).json({ message: `Not allowed to update ${invalid.join(', ')}` });
    }
    next();
};