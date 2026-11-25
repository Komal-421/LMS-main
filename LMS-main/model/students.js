const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true },
  phone: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: function (value) {
        // Accept 10‑15 digits, allow leading zeros
        return /^[0-9]{10,15}$/.test(value);
      },
      message: 'Enter a valid phone number (10‑15 digits)'
    }
  },
  password: { type: String, required: true, select: false },
  dob: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value < new Date();
      },
      message: 'Enter correct DOB'
    }
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other', 'prefer not to say'],
    default: 'male'
  },
  address: { type: String, required: true },
  enrollment_no: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  admissionDate: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return new Date(value) <= new Date();
      },
      message: 'Enter valid admission date'
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'passed out', 'dropped'],
    default: 'active'
  },
  role: {
    type: String,
    required: true,
    enum: ['null', 'student'],
    default: 'student'
  }
});

// Hash password before saving if it has been modified
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('student', studentSchema);
