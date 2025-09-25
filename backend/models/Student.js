// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  connected: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Student', studentSchema);
