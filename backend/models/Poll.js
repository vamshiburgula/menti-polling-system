// models/Poll.js
const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 }
});

const submissionSchema = new mongoose.Schema({
  key: String,
  optionId: String,
  name: String,
  at: { type: Date, default: Date.now }
});

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [optionSchema],
  correctOptionIndex: { type: Number },
  createdBy: { type: String },
  duration: { type: Number, default: 60 },
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  submissions: [submissionSchema],
  startedAt: Date
});

// Virtual getter for clean results
pollSchema.virtual('results').get(function () {
  return this.options.reduce((acc, o) => {
    acc[o.text] = o.votes || 0;
    return acc;
  }, {});
});

// ensure virtuals are included when toObject / toJSON called
pollSchema.set('toObject', { virtuals: true });
pollSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Poll', pollSchema);
