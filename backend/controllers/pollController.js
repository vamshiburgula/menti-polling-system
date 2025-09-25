// controllers/pollController.js
const Poll = require('../models/Poll');
const { verifyTeacher } = require('../utils/teacherAuth');

exports.createPoll = async (req, res) => {
  try {
    if (!verifyTeacher(req)) return res.status(401).json({ message: 'Unauthorized' });
    const { question, options, duration, correctOptionIndex } = req.body;
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'Invalid poll data' });
    }
    const optObjs = options.map((text) => ({ text }));
    const poll = new Poll({
      question,
      options: optObjs,
      duration: duration || 60,
      correctOptionIndex,
      createdBy: 'teacher',
      isActive: false,
    });
    await poll.save();
    return res.status(201).json({ poll });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPoll = async (req, res) => {
  try {
    const { id } = req.params;
    const poll = await Poll.findById(id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    return res.json({ poll: poll.toObject() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.endPoll = async (req, res) => {
  try {
    if (!verifyTeacher(req)) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    const poll = await Poll.findById(id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    poll.isActive = false;
    await poll.save();
    return res.json({ poll: poll.toObject() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listPolls = async (req, res) => {
  try {
    if (!verifyTeacher(req)) return res.status(401).json({ message: 'Unauthorized' });
    const polls = await Poll.find().sort({ createdAt: -1 }).limit(100);
    return res.json({ polls });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};
