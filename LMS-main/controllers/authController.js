const Student = require('../model/students');
const Faculty = require('../model/faculty');
const { createHash, verifyPassword, generateToken, extractInfo } = require('../authHelper/auth');

// Helper to handle duplicate key errors from MongoDB
function handleDupError(err) {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const msgs = {
      email: 'Email already registered',
      phone: 'Phone number already registered',
      enrollment_no: 'Enrollment number already registered'
    };
    return { status: 400, message: msgs[field] || `Duplicate value for ${field}` };
  }
  return null;
}

// ---------------- Registration ----------------
module.exports.registerStudent = async (req, res) => {
  try {
    const { name, email, password, gender, phone, dob, address, enrollment_no, department, admissionDate } = req.body;
    // Basic validation – ensure all required fields are present
    if (!name || !email || !password || !gender || !phone || !dob || !address || !enrollment_no || !department || !admissionDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Password hashing (pre‑save hook also hashes, but we do it here for clarity)
    const hashed = await createHash(password);
    const user = await Student.create({
      name,
      email,
      phone,
      password: hashed,
      dob,
      gender,
      address,
      enrollment_no,
      department,
      admissionDate,
      status: 'active',
      role: 'student'
    });
    const safeUser = (({ password, __v, ...rest }) => rest)(user.toObject());
    return res.status(201).json({ success: true, message: 'Student registered successfully', data: safeUser });
  } catch (error) {
    const dup = handleDupError(error);
    if (dup) return res.status(dup.status).json({ message: dup.message });
    return res.status(500).json({ message: error.message });
  }
};

// ---------------- Login ----------------
module.exports.loginUser = async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email or password not provided!' });
  }
  try {
    let user;
    if (role === 'faculty' && role !== 'admin') {
      user = await Faculty.findOne({ email }).select('+password');
    } else {
      // default to student lookup for other roles
      user = await Student.findOne({ email }).select('+password');
    }
    if (!user) return res.status(404).json({ message: "User doesn't exist" });
    const ok = await verifyPassword(user.password, password);
    if (!ok) return res.status(400).json({ message: 'Invalid email or password' });
    const token = generateToken(user._id, user.role);
    const { password: _, ...userInfo } = user.toObject();
    return res.status(200).json({ success: true, message: 'Login successful', data: { token, user: userInfo } });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ---------------- Current User ----------------
module.exports.getCurrentUser = async (req, res) => {
  try {
    const { id, role } = extractInfo(req);
    if (!role) return res.status(404).json({ message: 'Cannot find Role' });
    if (!id) return res.status(404).json({ message: 'Cannot find id' });
    let user;
    if (role === 'admin' || role === 'faculty') {
      user = await Faculty.findById(id);
    } else if (role === 'student') {
      user = await Student.findById(id);
    } else {
      return res.status(403).json({ message: 'Invalid role' });
    }
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password: _, ...safe } = user.toObject();
    return res.status(200).json({ success: true, data: safe });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
